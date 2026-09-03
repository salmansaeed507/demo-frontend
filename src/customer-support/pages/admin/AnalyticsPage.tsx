import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { analytics } from "../../mock/admin";

export default function AnalyticsPage() {
  const maxIntent = Math.max(...analytics.topIntents.map((i) => i.count));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Conversations today</CardDescription>
            <CardTitle className="text-2xl">
              {analytics.conversationsToday}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Tickets created</CardDescription>
            <CardTitle className="text-2xl">{analytics.ticketsCreated}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>AI resolved rate</CardDescription>
            <CardTitle className="text-2xl">
              {analytics.aiResolvedRate}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={analytics.aiResolvedRate} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg. AI response</CardDescription>
            <CardTitle className="text-2xl">
              {analytics.avgResponseSeconds}s
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top intents</CardTitle>
          <CardDescription>
            What customers asked about in this mock sample
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.topIntents.map((intent) => (
            <div key={intent.label} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>{intent.label}</span>
                <span className="text-muted-foreground">{intent.count}</span>
              </div>
              <Progress value={(intent.count / maxIntent) * 100} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
