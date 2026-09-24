const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:5070";
const CUSTOMER_SUPPORT_API_URL =
  import.meta.env.VITE_CUSTOMER_SUPPORT_API_URL ||
  `${API_GATEWAY_URL.replace(/\/$/, "")}/support`;

let authToken: string | null = null;

export type ApiClient = {
  baseUrl: string;
  fetch: <T>(
    path: string,
    options?: RequestInit,
    opts?: { requireAuth?: boolean },
  ) => Promise<T>;
  setAuthToken: (token: string | null) => void;
  getAuthToken: () => string | null;
};

function createClient(baseUrl: string): ApiClient {
  const normalizedBase = baseUrl.replace(/\/$/, "");

  return {
    baseUrl: normalizedBase,
    setAuthToken(token) {
      authToken = token;
    },
    getAuthToken() {
      return authToken;
    },
    async fetch<T>(
      path: string,
      options: RequestInit = {},
      { requireAuth = true }: { requireAuth?: boolean } = {},
    ): Promise<T> {
      const headers = new Headers(options.headers);

      if (!headers.has("Content-Type") && options.body) {
        headers.set("Content-Type", "application/json");
      }

      if (requireAuth) {
        if (!authToken) {
          throw new Error("Not authenticated");
        }
        headers.set("Authorization", `Bearer ${authToken}`);
      }

      const url = path.startsWith("http")
        ? path
        : `${normalizedBase}${path.startsWith("/") ? path : `/${path}`}`;

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API error ${response.status}: ${text}`);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return response.json() as Promise<T>;
    },
  };
}

export const apiGatewayClient = createClient(API_GATEWAY_URL);
export const customerSupportApiClient = createClient(CUSTOMER_SUPPORT_API_URL);
