import axios, { AxiosHeaders, type AxiosInstance } from 'axios';
import { API_ENDPOINTS, AUTH_BYPASS_PATHS, TOKEN_REFRESH } from './config';
import { refreshOnce } from './refreshOnce';
import type { IApiError } from './types';

const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL ?? '';
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const stripMultipartContentType = (
  headers: AxiosHeaders | Record<string, string> | undefined,
  data: unknown,
): AxiosHeaders => {
  const normalizedHeaders = AxiosHeaders.from(headers as AxiosHeaders | Record<string, string>);

  if (typeof FormData === 'undefined' || !(data instanceof FormData)) {
    return normalizedHeaders;
  }

  normalizedHeaders.delete('Content-Type');
  normalizedHeaders.delete('content-type');
  return normalizedHeaders;
};

apiClient.interceptors.request.use((config) => {
  config.headers = stripMultipartContentType(config.headers, config.data);
  return config;
});

const isAuthBypass = (url: string | undefined): boolean => {
  if (!url) return false;
  return AUTH_BYPASS_PATHS.some((p) => url.includes(p));
};

const isOnAuthPage = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  return path === '/login' || path.startsWith('/auth/callback');
};

type AuthStoreRef = {
  silentRefresh: () => Promise<string | null>;
  scheduleRefresh: (expiresAt: string) => void;
} | null;

let authStoreGetter: () => AuthStoreRef = () => null;

export const setAuthStoreGetter = (
  getter: () => AuthStoreRef,
): void => {
  authStoreGetter = getter;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const config = error.config ?? {};
    const url = config.url as string | undefined;

    if (
      status === 401 &&
      !isAuthBypass(url) &&
      (config._retryCount ?? 0) < TOKEN_REFRESH.MAX_RETRY_COUNT
    ) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      try {
        const store = authStoreGetter();
        if (store) {
          const expiresAt = await store.silentRefresh();
          if (expiresAt) {
            store.scheduleRefresh(expiresAt);
          }
        } else {
          const expiresAt = await refreshOnce();
          const newStore = authStoreGetter();
          if (newStore) {
            newStore.scheduleRefresh(expiresAt);
          }
        }
        return apiClient(config);
      } catch {
        if (!isOnAuthPage()) {
          window.location.href = '/login';
        }
      }
    }

    const apiError: IApiError = {
      message: error.response?.data?.message ?? error.message ?? 'Unknown error',
      statusCode: status ?? 0,
      code: error.response?.data?.code,
      params: error.response?.data?.params,
      errors: error.response?.data?.errors,
    };
    return Promise.reject(apiError);
  },
);

export { apiClient };