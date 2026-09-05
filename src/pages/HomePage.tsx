import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import { fetchLeads, fetchTickets, Lead, Ticket } from "../api/client";

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ticketData, leadData] = await Promise.all([
          fetchTickets(),
          fetchLeads(),
        ]);
        setTickets(ticketData);
        setLeads(leadData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-100">
        <p className="status flex-1 px-4 py-8">Loading...</p>
        <SiteFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-100">
        <main className="container flex-1">
          <p className="error">Error: {error}</p>
          <p>
            <Link to="/shoppilot-ai">Open ShopPilot AI UI (static)</Link>
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-zinc-100">
      <main className="container flex-1">
        <header>
          <h1>Multi-Service Demo</h1>
          <p>React frontend → API Gateway → backend services</p>
          <p>
            <Link to="/shoppilot-ai">ShopPilot AI →</Link>
          </p>
        </header>

        <section>
          <h2>Customer Support Tickets</h2>
          <ul>
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                #{ticket.id} — {ticket.subject} ({ticket.status})
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Qualified Leads</h2>
          <ul>
            {leads.map((lead) => (
              <li key={lead.id}>
                #{lead.id} — {lead.name} — score {lead.score} ({lead.status})
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
