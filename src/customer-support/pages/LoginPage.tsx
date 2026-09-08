import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageShell from "../PageShell";

const DEMO_EMAIL = "alex@example.com";
const DEMO_PASSWORD = "demo1234";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      sessionStorage.setItem(
        "cs-demo-user",
        JSON.stringify({ email, name: "Alex Rivera" }),
      );
      setError(null);
      navigate("/shoppilot-ai");
      return;
    }
    setError("Use the demo credentials shown below.");
  }

  return (
    <PageShell
      contentClassName="mx-auto max-w-md px-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Use the prefilled credentials to continue to the storefront.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button type="submit">Sign in</Button>
            <Button asChild variant="ghost">
              <Link to="/shoppilot-ai">Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageShell>
  );
}
