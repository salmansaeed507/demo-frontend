import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = { title: string; note?: string };

/** Temporary stub until the matching plan task fills in the static UI. */
export default function PlaceholderPage({ title, note }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{note ?? "Static UI placeholder."}</CardDescription>
      </CardHeader>
    </Card>
  );
}
