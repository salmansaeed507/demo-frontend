import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import HubBrand from "../components/HubBrand";

export default function HubLoginPage() {
  const session = useAuthStore((s) => s.session);
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = session !== null;
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from: string }).from !== "/login"
      ? (location.state as { from: string }).from
      : "/";

  const [fullName, setFullName] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Sign in | Demo Hub";
  }, []);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const name = fullName.trim();
    const loginToken = token.trim();
    if (!name || !loginToken) {
      setError("Enter your full name and the provided login token.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login(name, loginToken);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign in failed. Check your name and login token.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-muted-foreground">
      <section className="relative overflow-hidden bg-sidebar pt-14 pb-20 sm:pt-16 sm:pb-24">
        <div className="relative z-10 mx-auto max-w-[1180px] px-[clamp(16px,4vw,40px)]">
          <div className="mb-10">
            <HubBrand variant="light" />
          </div>
          <p className="text-[0.8rem] font-semibold tracking-[3px] text-gold uppercase">
            Demo Hub
          </p>
          <h1 className="font-heading mt-3 text-[clamp(2rem,4vw,2.8rem)] tracking-tight text-sidebar-foreground">
            Sign in
          </h1>
          <p className="mt-3 max-w-md text-base text-sidebar-foreground/72">
            Access all demos with your full name and the provided login token.
          </p>
        </div>
      </section>

      <section className="relative z-10 -mt-10 flex flex-1 px-[clamp(16px,4vw,40px)] pb-12">
        <form
          onSubmit={onSubmit}
          className="mx-auto w-full max-w-md rounded-[22px] border border-border bg-card p-[26px] shadow-[0_10px_30px_rgba(24,24,27,0.12)]"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-[0.92rem] font-medium text-foreground"
              >
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={submitting}
                className="w-full rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label
                htmlFor="token"
                className="mb-1.5 block text-[0.92rem] font-medium text-foreground"
              >
                Login token
              </label>
              <input
                id="token"
                name="token"
                type="password"
                autoComplete="off"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={submitting}
                className="w-full rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring"
                placeholder="Provided login token"
              />
            </div>
            {error ? (
              <p className="text-sm font-medium text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-full border border-primary bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
