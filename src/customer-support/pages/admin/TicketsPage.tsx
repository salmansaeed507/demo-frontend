import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tickets } from "../../mock/admin";

function priorityVariant(priority: string) {
  if (priority === "high") return "destructive" as const;
  if (priority === "medium") return "outline" as const;
  return "secondary" as const;
}

function statusVariant(status: string) {
  if (status === "open") return "destructive" as const;
  if (status === "pending") return "outline" as const;
  return "secondary" as const;
}

export default function TicketsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support tickets</CardTitle>
        <CardDescription>
          Created automatically by the AI when it can&apos;t resolve an issue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.id}</TableCell>
                <TableCell>{t.customer}</TableCell>
                <TableCell className="max-w-xs sm:max-w-md">
                  {t.summary}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={priorityVariant(t.priority)}
                    className="capitalize"
                  >
                    {t.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant(t.status)}
                    className="capitalize"
                  >
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {t.createdAgo}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
