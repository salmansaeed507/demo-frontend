import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import HubBrand from "../components/HubBrand";

/** Same key the gateway / demo stack expects (see VITE_API_KEY). */
const PROVIDED_LOGIN_TOKEN =
  import.meta.env.VITE_API_KEY || "dev-api-key-change-me";

export default function HubLoginPage() {
  const { isAuthenticated, login } = useAuth();
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

  useEffect(() => {
    document.title = "Sign in | Demo Hub";
  }, []);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const name = fullName.trim();
    const loginToken = token.trim();
    if (!name || !loginToken) {
      setError("Enter your full name and the provided login token.");
      return;
    }
    if (loginToken !== PROVIDED_LOGIN_TOKEN) {
      setError("Use your full name and the provided login token shown below.");
      return;
    }
    setError(null);
    login(name, loginToken);
    navigate(from, { replace: true });
  }

  return (
    <div
      className="flex min-h-svh flex-col bg-[#f9fafb] text-[#4b5563]"
      style={{ fontFamily: '"Poppins", sans-serif' }}
    >
      <section className="relative overflow-hidden bg-[#1a1a4b] pt-14 pb-20 sm:pt-16 sm:pb-24">
        <div
          className="pointer-events-none absolute inset-0 bg-[#1a1a4b]"
          style={{ clipPath: "ellipse(120% 85% at 30% 0%)" }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-[1140px] px-6">
          <div className="mb-10">
            <HubBrand variant="light" />
          </div>
          <p className="text-[0.8rem] font-semibold tracking-[3px] text-[#fbbf24] uppercase">
            Demo Hub
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Sign in
          </h1>
          <p className="mt-3 max-w-md text-base text-white/80">
            Access all demos with your full name and the provided login token.
          </p>
        </div>
      </section>

      <section className="relative z-10 -mt-10 flex flex-1 px-6 pb-12">
        <form
          onSubmit={onSubmit}
          className="mx-auto w-full max-w-md rounded-xl bg-white p-8 shadow-[0_10px_40px_rgba(26,26,75,0.12)]"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-sm font-semibold text-[#1f2937]"
              >
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/25"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label
                htmlFor="token"
                className="mb-1.5 block text-sm font-semibold text-[#1f2937]"
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
                className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/25"
                placeholder="Provided login token"
              />
            </div>
            <p className="rounded-lg bg-[#f5f3ff] px-3.5 py-3 text-xs leading-relaxed text-[#4b5563]">
              Use your full name and this provided login token:{" "}
              <code className="font-semibold text-[#7c3aed]">
                {PROVIDED_LOGIN_TOKEN}
              </code>
            </p>
            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#6366f1] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(124,58,237,0.35)]"
            >
              Sign in
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
