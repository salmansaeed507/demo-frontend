import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import HubBrand from "../components/HubBrand";
import SiteFooter from "../components/SiteFooter";

const demos = [
  {
    id: "shoppilot-ai",
    pill: "ShopPilot AI",
    title: "Customer Support Agent",
    description:
      "An AI agent that answers questions, tracks orders, and opens tickets — wired to a knowledge base and order API behind the demo gateway.",
    to: "/shoppilot-ai/admin",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    stack: ["AI Agent", "RAG", "FastAPI", "React"],
  },
] as const;

export default function HomePage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Demo Hub | Salman Saeed";
  }, []);

  function onLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div
      className="flex min-h-svh flex-col bg-white text-[#4b5563]"
      style={{ fontFamily: '"Poppins", sans-serif' }}
    >
      <section className="relative overflow-hidden bg-[#1a1a4b] pt-8 pb-8 sm:pt-10 sm:pb-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[#1a1a4b]"
          style={{ clipPath: "ellipse(120% 85% at 30% 0%)" }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-[1140px] px-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <HubBrand variant="light" />
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-white/75">
                Welcome{" "}
                <span className="font-semibold text-white">
                  {session?.fullName}
                </span>
              </p>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-white/40 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          </div>
          <p className="text-[0.75rem] font-semibold tracking-[3px] text-[#fbbf24] uppercase">
            Live examples
          </p>
          <h1 className="mt-2 max-w-2xl text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            Demo Hub
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80 sm:text-[0.95rem]">
            Hands-on examples of AI agents and workflow automation by Salman
            Saeed — interactive demos you can explore end to end.
          </p>
        </div>
      </section>

      <section className="flex-1 bg-[#f9fafb] py-12 sm:py-14">
        <div className="mx-auto max-w-[1140px] px-6">
          <p className="text-center text-xs font-semibold tracking-[2px] text-[#7c3aed] uppercase">
            Available now
          </p>
          <h2 className="mt-2 text-center text-2xl font-bold text-[#1f2937] sm:text-[2rem]">
            Demos
          </h2>

          <div className="mx-auto mt-8 grid max-w-md gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
            {demos.map((demo) => (
              <Link
                key={demo.id}
                to={demo.to}
                className="group flex flex-col overflow-hidden rounded-xl bg-white text-inherit shadow-[0_1px_3px_rgba(0,0,0,0.08)] no-underline transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(26,26,75,0.12)]"
              >
                <div className="aspect-video overflow-hidden bg-[#f3f4f6]">
                  <img
                    src={demo.image}
                    alt=""
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col px-7 pt-6 pb-7">
                  <span className="mb-2 w-fit rounded-full bg-[#f5f3ff] px-2.5 py-1 text-xs font-semibold text-[#7c3aed]">
                    {demo.pill}
                  </span>
                  <h3 className="text-[1.15rem] font-bold text-[#1f2937]">
                    {demo.title}
                  </h3>
                  <p className="mt-2.5 mb-4 flex-1 text-[0.9rem] leading-relaxed text-[#6b7280]">
                    {demo.description}
                  </p>
                  <ul className="mb-5 flex list-none flex-wrap gap-2 p-0">
                    {demo.stack.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full bg-[#f3f4f6] px-2.5 py-1 text-xs font-semibold text-[#4b5563]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7c3aed] transition group-hover:text-[#1a1a4b]">
                    Open demo
                    <span aria-hidden className="transition group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
