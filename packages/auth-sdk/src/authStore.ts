import { API_ENDPOINTS } from './config';
import { apiClient, setAuthStoreGetter } from './authClient';
import { refreshOnce } from './refreshOnce';
import {
  cancelProactiveRefresh,
  closeBroadcastChannel,
  initBroadcastChannel,
  scheduleProactiveRefresh,
  broadcastTokenRefreshed,
} from './tokenRefreshScheduler';
import type { IAuthStore, ILoginCredentials, ILoginResult, IVerify2faParams, IVerify2faResult, ILoginClientInfo, IUserProfile } from './types';

const collectClientInfo = async (): Promise<ILoginClientInfo> => {
  const nav = navigator as Navigator & { userAgentData?: { brands?: readonly { brand: string; version: string }[]; mobile?: boolean; platform?: string; getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string; fullVersionList?: readonly { brand: string; version: string }[]; model?: string; platformVersion?: string }> } };
  const base: ILoginClientInfo = {
    userAgent: navigator.userAgent,
    brands: nav.userAgentData?.brands,
    mobile: nav.userAgentData?.mobile,
    platform: nav.userAgentData?.platform,
  };
  if (!nav.userAgentData?.getHighEntropyValues) return base;
  try {
    const highEntropy = await nav.userAgentData.getHighEntropyValues([
      'architecture',
      'fullVersionList',
      'model',
      'platformVersion',
    ]);
    return { ...base, ...highEntropy };
  } catch {
    return base;
  }
};

const toProfile = (user: IUserProfile): IUserProfile => ({
  id: user.id,
  tenantId: user.tenantId,
  email: user.email,
  name: user.name,
  role: user.role,
  isLoginAs: user.isLoginAs,
  actingAdminEmail: user.actingAdminEmail,
});

const isAuthExemptPage = (): boolean =>
  typeof window !== 'undefined' &&
  (window.location.pathname === '/login' || window.location.pathname.startsWith('/auth/callback'));

let loginAsExpiryTimer: ReturnType<typeof setTimeout> | null = null;

const scheduleLoginAsExpiryCheck = (expiresAtIso: string, onExpiry: () => void): void => {
  if (loginAsExpiryTimer !== null) clearTimeout(loginAsExpiryTimer);
  const delay = new Date(expiresAtIso).getTime() - Date.now();
  loginAsExpiryTimer = setTimeout(onExpiry, Math.max(0, delay) + 1_000);
};

const cancelLoginAsExpiryCheck = (): void => {
  if (loginAsExpiryTimer !== null) clearTimeout(loginAsExpiryTimer);
  loginAsExpiryTimer = null;
};

import { create } from 'zustand';

export const useAuthStore = create<IAuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isLoggingOut: false,
  initStarted: false,
  accessTokenExpiresAt: null,

  silentRefresh: async () => {
    try {
      const expiresAt = await refreshOnce();
      get().scheduleRefresh(expiresAt);
      return expiresAt;
    } catch (error) {
      const status = error instanceof Error && 'response' in error
        ? (error as { response?: { status: number } }).response?.status
        : undefined;
      if (status === 401 || status === 403) {
        await get().logout();
      }
      return null;
    }
  },

  scheduleRefresh: (expiresAt) => {
    set({ accessTokenExpiresAt: expiresAt });
    scheduleProactiveRefresh(
      expiresAt,
      () => get().silentRefresh(),
      () => get().accessTokenExpiresAt,
    );
    broadcastTokenRefreshed(expiresAt);
  },

  cancelRefresh: () => {
    cancelProactiveRefresh();
    cancelLoginAsExpiryCheck();
    set({ accessTokenExpiresAt: null });
  },

  bootstrap: async () => {
    if (get().initStarted) return;
    set({ initStarted: true });

    setAuthStoreGetter(() => ({
      silentRefresh: get().silentRefresh,
      scheduleRefresh: get().scheduleRefresh,
    }));

    initBroadcastChannel((expiresAt) => {
      get().scheduleRefresh(expiresAt);
    });

    if (isAuthExemptPage()) {
      set({ isLoading: false });
      return;
    }
    await get().fetchUser();
  },

  fetchUser: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
      const user = response.data;
      set({
        user: toProfile({
          id: user.user_id,
          tenantId: user.tenant_id,
          email: user.email,
          name: user.name ?? user.email.split('@')[0],
          role: user.role,
          isLoginAs: Boolean(user.is_login_as),
          actingAdminEmail: user.acting_admin_email ?? null,
        }),
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      if (typeof user.access_token_expires_at === 'string') {
        if (user.is_login_as) {
          get().cancelRefresh();
          scheduleLoginAsExpiryCheck(user.access_token_expires_at, () => {
            void get().fetchUser();
          });
        } else {
          cancelLoginAsExpiryCheck();
          get().scheduleRefresh(user.access_token_expires_at);
        }
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        ...credentials,
        clientInfo: await collectClientInfo(),
      });
      if (response.data?.requires_2fa) {
        set({ isLoading: false });
        return {
          kind: 'mfa',
          mfaToken: response.data.mfa_token,
          methods: response.data.methods ?? [],
          primary: response.data.primary ?? null,
        };
      }
      if (response.data?.requires_2fa_setup) {
        set({ isLoading: false });
        if (typeof response.data.access_token_expires_at === 'string') {
          get().scheduleRefresh(response.data.access_token_expires_at);
        }
        return {
          kind: '2fa_setup_required',
          userId: response.data.user_id,
          email: response.data.email,
          totpConfigured: response.data.totp_configured,
        };
      }
      if (response.data?.requires_password_change) {
        set({ isLoading: false });
        return { kind: 'password_change_required', pwdChangeToken: response.data.pwd_change_token };
      }
      set({
        user: toProfile({
          id: response.data.user.user_id,
          tenantId: response.data.user.tenant_id,
          email: response.data.user.email,
          name: response.data.user.name ?? response.data.user.email.split('@')[0],
          role: response.data.user.role,
          isLoginAs: false,
          actingAdminEmail: null,
        }),
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      if (typeof response.data.access_token_expires_at === 'string') {
        get().scheduleRefresh(response.data.access_token_expires_at);
      }
      return { kind: 'done' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  verify2fa: async (mfaToken, params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN_2FA, {
        mfa_token: mfaToken,
        method: params.method,
        code: params.code,
        backup_code: params.backupCode,
        credential_response: params.credentialResponse,
      });
      if (response.data?.requires_password_change) {
        set({ isLoading: false });
        return { kind: 'password_change_required', pwdChangeToken: response.data.pwd_change_token };
      }
      if (response.data?.user) {
        const user = response.data.user;
        set({
          user: toProfile({
            id: user.user_id,
            tenantId: user.tenant_id,
            email: user.email,
            name: user.name ?? user.email.split('@')[0],
            role: user.role,
            isLoginAs: false,
            actingAdminEmail: null,
          }),
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        if (typeof response.data.access_token_expires_at === 'string') {
          get().scheduleRefresh(response.data.access_token_expires_at);
        }
        return { kind: 'done' };
      }
      set({ isLoading: false });
      return { kind: 'done' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  forceChangePassword: async (pwdChangeToken, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        pwd_change_token: pwdChangeToken,
        new_password: newPassword,
        clientInfo: await collectClientInfo(),
      });
      const user = response.data.user;
      set({
        user: toProfile({
          id: user.user_id,
          tenantId: user.tenant_id,
          email: user.email,
          name: user.name ?? user.email.split('@')[0],
          role: user.role,
          isLoginAs: false,
          actingAdminEmail: null,
        }),
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      if (typeof response.data.access_token_expires_at === 'string') {
        get().scheduleRefresh(response.data.access_token_expires_at);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Password change failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // ignore
    } finally {
      get().cancelRefresh();
      closeBroadcastChannel();
      try {
        sessionStorage.clear();
      } catch {
        // ignore
      }
    }

    const iamBase = import.meta.env.VITE_IAM_BASE_URL ?? 'https://iam.onemail.vn';
    const redirectUri = `${window.location.origin}/auth/callback`;
    const { generatePkceChallenge } = await import('./pkce');
    const { challenge } = await generatePkceChallenge();

    const iamLoginParams = new URLSearchParams({
      client_id: 'office-workspace',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    const targetLoginUrl = `${iamBase}/login?${iamLoginParams.toString()}`;
    const postLogoutRedirect = encodeURIComponent(targetLoginUrl);
    window.location.replace(`${iamBase}/oauth/logout?post_logout_redirect_uri=${postLogoutRedirect}`);
  },
}));