export type DomainLoadStatus = "idle" | "loading" | "ready" | "error";

export type DomainLoadSlice = {
  status: DomainLoadStatus;
  error: string | null;
};
