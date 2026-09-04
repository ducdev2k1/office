import { refreshOnce } from './refreshOnce';

export type TypeGetExpiresAt = () => string | null;
export type TypeRefreshFn = () => Promise<string | null>;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let channel: BroadcastChannel | null = null;

export const scheduleProactiveRefresh = (
  expiresAtIso: string,
  refreshFn: TypeRefreshFn,
  getExpiresAt: TypeGetExpiresAt,
): void => {
  if (refreshTimer !== null) clearTimeout(refreshTimer);

  const expiresAt = new Date(expiresAtIso).getTime();
  const now = Date.now();
  const buffer = 60_000;
  const delay = Math.max(0, expiresAt - now - buffer);

  refreshTimer = setTimeout(async () => {
    const currentExpiresAt = getExpiresAt();
    if (currentExpiresAt && new Date(currentExpiresAt).getTime() - Date.now() < 5_000) {
      return;
    }
    await refreshFn();
  }, delay);
};

export const cancelProactiveRefresh = (): void => {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};

export const initBroadcastChannel = (onRemoteRefresh: (expiresAt: string) => void): void => {
  if (channel) return;

  channel = new BroadcastChannel('office-auth-refresh');
  channel.onmessage = (event) => {
    if (event.data?.type === 'TOKEN_REFRESHED' && event.data.expiresAt) {
      onRemoteRefresh(event.data.expiresAt);
    }
  };
};

export const closeBroadcastChannel = (): void => {
  if (channel) {
    channel.close();
    channel = null;
  }
};

export const broadcastTokenRefreshed = (expiresAt: string): void => {
  if (channel) {
    channel.postMessage({ type: 'TOKEN_REFRESHED', expiresAt });
  }
};