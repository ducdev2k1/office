declare module 'mammoth/mammoth.browser.js' {
  import type { MammothApi } from './mammoth.types';

  const api: MammothApi;
  export default api;
  export const convertToHtml: MammothApi['convertToHtml'];
  export const extractRawText: MammothApi['extractRawText'];
}
