export const AUTH_CONFIG = {
  iamBaseUrl: import.meta.env.VITE_IAM_BASE_URL ?? 'https://iam.onemail.vn',
  appBaseUrl: import.meta.env.VITE_APP_BASE_URL ?? 'https://office.onemail.vn',
  clientId: 'office-workspace',
  scope: 'openid email profile',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    ME: '/api/v1/auth/me',
    LOGIN: '/api/v1/auth/login',
    LOGIN_2FA: '/api/v1/auth/login/2fa',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    PROFILE: '/api/v1/auth/profile',
    CHANGE_PASSWORD: '/api/v1/auth/change-password',
    SESSIONS: '/api/v1/auth/sessions',
    LOGOUT_OTHERS: '/api/v1/auth/sessions/logout-others',
    TRUSTED_DEVICES: '/api/v1/auth/trusted-devices',
  },
  OAUTH: {
    AUTHORIZE: '/oauth/authorize',
    TOKEN: '/oauth/token',
    USERINFO: '/oauth/userinfo',
    LOGOUT: '/oauth/logout',
    DISCOVERY: '/.well-known/openid-configuration',
  },
} as const;

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'onemail-pro-at',
  REFRESH_TOKEN: 'onemail-pro-rt',
  TRUSTED_DEVICE: 'onemail-pro-td',
} as const;

export const AUTH_BYPASS_PATHS = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.LOGIN_2FA,
  API_ENDPOINTS.AUTH.REFRESH,
  API_ENDPOINTS.AUTH.LOGOUT,
] as const;

export const TOKEN_REFRESH = {
  PROACTIVE_REFRESH_BUFFER_MS: 60_000,
  MAX_RETRY_COUNT: 2,
} as const;

export const PKCE = {
  CODE_CHALLENGE_METHOD: 'S256' as const,
  CODE_VERIFIER_LENGTH: 64,
} as const;