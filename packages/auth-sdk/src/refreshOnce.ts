import axios from 'axios';

let refreshUrl: string | null = null;

export interface IAuthClientConfig {
  refreshUrl: string;
}

export const configureAuthClient = (config: IAuthClientConfig): void => {
  refreshUrl = config.refreshUrl;
};

let inflight: Promise<string> | null = null;

export const refreshOnce = (): Promise<string> => {
  if (inflight) return inflight;

  const url = refreshUrl;
  if (!url) {
    return Promise.reject(new Error('auth-client chưa được configureAuthClient()'));
  }

  inflight = axios
    .post(url, {}, { withCredentials: true })
    .then((res) => {
      const expiresAt = res.data?.access_token_expires_at;
      if (typeof expiresAt !== 'string') {
        throw new Error('refresh response thiếu access_token_expires_at');
      }
      return expiresAt;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
};