export interface IUserProfile {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  isLoginAs: boolean;
  actingAdminEmail: string | null;
}

export interface IAuthState {
  user: IUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ILoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ILoginResult {
  kind: 'done' | 'mfa' | '2fa_setup_required' | 'password_change_required';
  mfaToken?: string;
  methods?: string[];
  primary?: string | null;
  userId?: string;
  email?: string;
  totpConfigured?: boolean;
  pwdChangeToken?: string;
}

export interface IVerify2faParams {
  method: string;
  code?: string;
  backupCode?: string;
  credentialResponse?: unknown;
}

export interface IVerify2faResult {
  kind: 'done' | 'password_change_required';
  pwdChangeToken?: string;
}

export interface IAuthStore extends IAuthState {
  initStarted: boolean;
  accessTokenExpiresAt: string | null;
  isLoggingOut: boolean;
  bootstrap: () => Promise<void>;
  fetchUser: () => Promise<void>;
  login: (credentials: ILoginCredentials) => Promise<ILoginResult>;
  verify2fa: (mfaToken: string, params: IVerify2faParams) => Promise<IVerify2faResult>;
  forceChangePassword: (pwdChangeToken: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  silentRefresh: () => Promise<string | null>;
  scheduleRefresh: (expiresAt: string) => void;
  cancelRefresh: () => void;
}

export interface IApiError {
  message: string;
  statusCode: number;
  code?: string;
  params?: Record<string, unknown>;
  errors?: Record<string, string[]>;
}

export interface ILoginClientInfo {
  userAgent: string;
  brands?: readonly { brand: string; version: string }[];
  mobile?: boolean;
  platform?: string;
  architecture?: string;
  fullVersionList?: readonly { brand: string; version: string }[];
  model?: string;
  platformVersion?: string;
}