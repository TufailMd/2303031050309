import { AuthRequest, AuthResponse, LoggerConfig } from "./types";

const DEFAULT_BASE_URL = "http://4.224.186.213/evaluation-service";

interface CachedToken {
  token: string;
  expiresAtMs: number; 
}

let cachedToken: CachedToken | null = null;
let inFlightAuth: Promise<string> | null = null;

const REFRESH_SKEW_MS = 30_000;

function getBaseUrl(config: LoggerConfig): string {
  return config.baseUrl ?? DEFAULT_BASE_URL;
}

async function requestToken(config: LoggerConfig): Promise<string> {
  const body: AuthRequest = {
    email: config.email,
    name: config.name,
    rollNo: config.rollNo,
    accessCode: config.accessCode,
    clientID: config.clientID,
    clientSecret: config.clientSecret,
  };

  const res = await fetch(`${getBaseUrl(config)}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Auth request failed with status ${res.status}: ${text || res.statusText}`
    );
  }

  const data = (await res.json()) as AuthResponse;

  const expiresAtMs = data.expires_in * 1000;

  cachedToken = {
    token: data.access_token,
    expiresAtMs: expiresAtMs - REFRESH_SKEW_MS,
  };

  return cachedToken.token;
}

export async function getAuthToken(
  config: LoggerConfig,
  forceRefresh = false
): Promise<string> {
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAtMs) {
    return cachedToken.token;
  }

  if (!inFlightAuth) {
    inFlightAuth = requestToken(config).finally(() => {
      inFlightAuth = null;
    });
  }

  return inFlightAuth;
}

export function clearAuthCache(): void {
  cachedToken = null;
}
