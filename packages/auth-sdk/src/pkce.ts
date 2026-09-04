export interface IPkceChallenge {
  challenge: string;
  verifier: string;
}

const generateRandomString = (length: number): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const base64UrlEncode = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

export const generatePkceChallenge = async (): Promise<IPkceChallenge> => {
  const verifier = generateRandomString(64);
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const challenge = base64UrlEncode(digest);
  return { challenge, verifier };
};

export const storePkceVerifier = (verifier: string): void => {
  sessionStorage.setItem('pkce_verifier', verifier);
};

export const getPkceVerifier = (): string | null => {
  return sessionStorage.getItem('pkce_verifier');
};

export const clearPkceVerifier = (): void => {
  sessionStorage.removeItem('pkce_verifier');
};