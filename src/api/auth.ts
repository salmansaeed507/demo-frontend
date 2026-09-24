import { apiGatewayClient } from "./client";

export interface LoginResponse {
  user_id: number;
  name: string;
  token: string;
  last_activity_at: string;
}

export interface SessionResponse {
  user_id: number;
  name: string;
  last_activity_at: string;
}

export function loginRequest(
  loginToken: string,
  name: string,
  userId?: number | null,
): Promise<LoginResponse> {
  const body: { login_token: string; name: string; user_id?: number } = {
    login_token: loginToken,
    name,
  };
  if (userId != null) {
    body.user_id = userId;
  }
  return apiGatewayClient.fetch<LoginResponse>(
    "/login",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    { requireAuth: false },
  );
}

export function logoutRequest(): Promise<{ status: string }> {
  return apiGatewayClient.fetch<{ status: string }>("/logout", {
    method: "POST",
  });
}

export function fetchSession(): Promise<SessionResponse> {
  return apiGatewayClient.fetch<SessionResponse>("/session");
}
