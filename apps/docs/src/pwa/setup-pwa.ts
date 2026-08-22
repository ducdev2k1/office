import { getStoredLocale, translate } from '@office/i18n';
import { registerSW } from 'virtual:pwa-register';

const TOAST_ID = 'pwa-update-toast';

const showUpdateToast = (onRefresh: () => void): void => {
  if (document.getElementById(TOAST_ID)) return;
  const locale = getStoredLocale();
  const message = translate(locale, 'common.pwa.updateReady');
  const actionLabel = translate(locale, 'common.pwa.reload');

  const container = document.createElement('div');
  container.id = TOAST_ID;
  container.setAttribute('role', 'alert');
  container.style.cssText =
    'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:9999;' +
    'display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:12px;' +
    'background:#1f2937;color:#f9fafb;font-size:13px;line-height:1.4;' +
    'box-shadow:0 10px 30px rgba(0,0,0,.25);font-family:system-ui,sans-serif;';

  const text = document.createElement('span');
  text.textContent = message;

  const button = document.createElement('button');
  button.textContent = actionLabel;
  button.style.cssText =
    'border:0;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;' +
    'background:#49c98d;color:#052e16;cursor:pointer;';
  button.addEventListener('click', onRefresh);

  container.append(text, button);
  document.body.append(container);
};

/** Đăng ký service worker (chỉ production) + toast "Có phiên bản mới". */
export const setupPwa = (): void => {
  if (!('serviceWorker' in navigator)) return;
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      showUpdateToast(() => {
        void updateSW(true);
      });
    },
  });
};
