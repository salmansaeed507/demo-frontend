import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../auth/authStore";
import HubBrand from "../components/HubBrand";
import SiteFooter from "../components/SiteFooter";

type Demo = {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  stack: string[];
  to?: string;
};

const demos: Demo[] = [
  {
    id: "gadget-grove",
    title: "AI Customer Support Agent",
    description:
      "Answers customer questions from your own docs, with sources, and hands off to a human when it can’t. Includes the full RAG pipeline (ingestion, chunking, embeddings, retrieval) plus ticket triage and routing.",
    to: "/gadget-grove/admin",
    image: "/customer-support-demo.png",
    alt: "AI Customer Support Agent demo",
    stack: ["RAG", "LangChain", "Vector Search", "FastAPI", "PostgreSQL", "React"],
  },
  {
    id: "lead-qualification",
    title: "Lead Qualification Engine",
    description:
      "Scores and prioritizes inbound leads using signal-based rules — a standalone qualification service integrated through the same gateway architecture.",
    image: "https://picsum.photos/seed/lead-qualification/640/360",
    alt: "Lead Qualification Engine demo",
    stack: ["FastAPI", "Scoring API", "Docker"],
  },
];

function DemoCardBody({ demo }: { demo: Demo }) {
  const soon = !demo.to;
  return (
    <>
      <div className="aspect-video overflow-hidden bg-muted">
        <img
          src={demo.image}
          alt={demo.alt}
          loading="lazy"
          className={
            soon
              ? "size-full object-cover grayscale"
              : "size-full object-cover transition-transform duration-[350ms] ease-out group-hover:scale-[1.04]"
          }
        />
      </div>
      <div className="flex flex-1 flex-col px-[22px] pt-[22px] pb-6">
        {soon && (
          <span className="mb-2 self-start rounded-full bg-primary/12 px-2.5 py-1 text-[0.72rem] font-bold tracking-[0.06em] text-primary uppercase">
            Coming soon
          </span>
        )}
        <h3 className="font-heading mb-2.5 text-[1.35rem] text-foreground">
          {demo.title}
        </h3>
        <p className="mb-4 flex-1 text-[0.9rem] leading-[1.65] text-muted-foreground">
          {demo.description}
        </p>
        <ul className="mb-[18px] flex list-none flex-wrap gap-2 p-0">
          {demo.stack.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-foreground/8 px-2.5 py-1 text-xs font-semibold text-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
        {!soon && (
          <span className="inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-primary transition-colors duration-200 group-hover:text-foreground">
            Live demo
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        )}
      </div>
    </>
  );
}

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

          <p className="mx-auto mt-2 mb-8 max-w-[640px] text-center text-[0.98rem] leading-[1.7] text-muted-foreground">
            Explore working demos that show how I design, integrate, and ship
            production-ready AI and automation solutions.
          </p>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {demos.map((demo) =>
              demo.to ? (
                <Link
                  key={demo.id}
                  to={demo.to}
                  className="group flex flex-col overflow-hidden rounded-[22px] border border-border bg-card text-inherit no-underline transition duration-200 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(10,39,68,0.1)]"
                >
                  <DemoCardBody demo={demo} />
                </Link>
              ) : (
                <article
                  key={demo.id}
                  aria-disabled="true"
                  className="flex cursor-not-allowed flex-col overflow-hidden rounded-[22px] border border-dashed border-border bg-card opacity-60 select-none"
                >
                  <DemoCardBody demo={demo} />
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
