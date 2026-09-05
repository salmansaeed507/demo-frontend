import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";

const demos = [
  {
    id: "shoppilot-ai",
    title: "ShopPilot AI",
    description:
      "An AI agent that answers questions, tracks orders, and opens tickets — wired to a knowledge base and order API behind the demo gateway.",
    to: "/shoppilot-ai",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    stack: ["React", "FastAPI", "Gateway"],
  },
] as const;

export default function HomePage() {
  useEffect(() => {
    document.title = "Demo Hub";
  }, []);

  return (
    <div
      className="flex min-h-svh flex-col bg-white text-[#4b5563]"
      style={{ fontFamily: '"Poppins", sans-serif' }}
    >
      <section className="relative overflow-hidden bg-[#1a1a4b] pt-14 pb-16 sm:pt-16 sm:pb-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[#1a1a4b]"
          style={{ clipPath: "ellipse(120% 85% at 30% 0%)" }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-[1140px] px-6">
          <p className="text-[0.8rem] font-semibold tracking-[3px] text-[#fbbf24] uppercase">
            Live examples
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[3.25rem]">
            Demo Hub
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-[1rem]">
            Hands-on examples of AI agents, workflow automation, and microservice
            architecture — React frontend through an API gateway to independent
            backend services.
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
          <p className="mx-auto mt-3 mb-8 max-w-xl text-center text-[0.95rem] leading-relaxed text-[#6b7280]">
            Open a demo to explore the full UI. More services from this stack will
            appear here as they get frontends.
          </p>

          <div className="mx-auto grid max-w-md gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
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
