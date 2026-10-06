import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../auth/authStore";
import HubBrand from "../components/HubBrand";
import SiteFooter from "../components/SiteFooter";

const demos = [
  {
    id: "shoppilot-ai",
    pill: "ShopPilot AI",
    title: "Customer Support Agent",
    description:
      "An AI agent that answers questions, tracks orders, and opens tickets — wired to a knowledge base and order API behind the demo api-gateway.",
    to: "/shoppilot-ai/admin",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    stack: ["AI Agent", "RAG", "FastAPI", "React"],
  },
] as const;

export default function HomePage() {
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Demo Hub | Salman Saeed";
  }, []);

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-muted-foreground">
      <section className="relative overflow-hidden bg-sidebar pt-8 pb-8 sm:pt-10 sm:pb-10">
        <div className="relative z-10 mx-auto max-w-[1180px] px-[clamp(16px,4vw,40px)]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <HubBrand variant="light" />
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-sidebar-foreground/75">
                Welcome{" "}
                <span className="font-semibold text-sidebar-foreground">
                  {session?.fullName}
                </span>
              </p>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-white/28 px-4 py-1.5 text-xs font-semibold text-sidebar-foreground transition hover:border-sidebar-foreground"
              >
                Sign out
              </button>
            </div>
          </div>
          <p className="text-[0.75rem] font-semibold tracking-[3px] text-gold uppercase">
            Live examples
          </p>
          <h1 className="font-heading mt-2 max-w-2xl text-[clamp(2rem,4vw,2.8rem)] tracking-tight text-sidebar-foreground">
            Demo Hub
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-sidebar-foreground/72 sm:text-[0.95rem]">
            Hands-on examples of AI agents and workflow automation by Salman
            Saeed — interactive demos you can explore end to end.
          </p>
        </div>
      </section>

      <section className="flex-1 bg-background py-12 sm:py-14">
        <div className="mx-auto max-w-[1180px] px-[clamp(16px,4vw,40px)]">
          <p className="text-center text-xs font-semibold tracking-[2px] text-primary uppercase">
            Available now
          </p>
          <h2 className="font-heading mt-2 text-center text-[clamp(1.8rem,3.4vw,2.6rem)] tracking-[-0.02em] text-foreground">
            Demos
          </h2>

          <div className="mx-auto mt-8 grid max-w-md gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
            {demos.map((demo) => (
              <Link
                key={demo.id}
                to={demo.to}
                className="group flex flex-col overflow-hidden rounded-[20px] border border-border bg-card text-inherit no-underline transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(24,24,27,0.12)]"
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={demo.image}
                    alt=""
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col px-7 pt-6 pb-7">
                  <span className="mb-2 w-fit rounded-full bg-foreground/8 px-2.5 py-1 text-xs font-semibold text-foreground">
                    {demo.pill}
                  </span>
                  <h3 className="font-heading text-[1.3rem] text-foreground">
                    {demo.title}
                  </h3>
                  <p className="mt-2.5 mb-4 flex-1 text-[0.9rem] leading-relaxed text-muted-foreground">
                    {demo.description}
                  </p>
                  <ul className="mb-5 flex list-none flex-wrap gap-2 p-0">
                    {demo.stack.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full bg-foreground/8 px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:text-foreground">
                    Open demo
                    <span
                      aria-hidden
                      className="transition group-hover:translate-x-1"
                    >
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
