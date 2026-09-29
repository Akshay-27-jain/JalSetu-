// Google OAuth 2.0 Client & Token Services

const STORAGE_KEY = 'jalsetu_google_client_id';

export function getStoredGoogleClientId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setCustomGoogleClientId(clientId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, clientId);
  } catch (e) {
    console.error('Failed to store Google Client ID:', e);
  }
}

export const GOOGLE_CLIENT_ID =
  getStoredGoogleClientId() ||
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '363898350860-cg6dhbo9g7f65pe0lv1uktfg24t0hhvs.apps.googleusercontent.com';

export function isGoogleConfigured(): boolean {
  const activeId = getStoredGoogleClientId() || import.meta.env.VITE_GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID;
  return Boolean(
    activeId &&
    activeId.includes('.apps.googleusercontent.com')
  );
}

export interface GoogleUserProfile {
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  sub?: string;
  email_verified?: boolean;
}

/**
 * Fetch verified user profile directly from Google's OAuth2 userinfo endpoint
 * using a valid Google OAuth Access Token
 */
export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Decode base64url-encoded Google ID Token payload
 */
export function parseGoogleIdToken(idToken: string): GoogleUserProfile | null {
  try {
    const parts = idToken.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse Google ID Token:', err);
    return null;
  }
}
