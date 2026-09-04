import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    return <p className="status">Loading...</p>;
  }

  if (error) {
    return (
      <main className="container">
        <p className="error">Error: {error}</p>
        <p>
          <Link to="/shoppilot-ai">Open ShopPilot AI UI (static)</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="container">
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
  );
}
