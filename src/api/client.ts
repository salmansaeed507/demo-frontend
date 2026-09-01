const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_KEY = import.meta.env.VITE_API_KEY || "dev-api-key-change-me";

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "X-API-Key": API_KEY,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

export interface Ticket {
  id: number;
  subject: string;
  status: string;
}

export interface Lead {
  id: number;
  name: string;
  score: number;
  status: string;
}

export function fetchTickets(): Promise<Ticket[]> {
  return apiFetch<Ticket[]>("/api/customer-support/tickets");
}

export function fetchLeads(): Promise<Lead[]> {
  return apiFetch<Lead[]>("/api/lead-qualification/leads");
}
