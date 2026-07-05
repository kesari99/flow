import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PageShellProps = {
  title: string;
  description?: string;
};

export function PageShell({ title, description }: PageShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <Card className="border-border bg-secondary/30 shadow-none">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Coming soon
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            This section is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pt-0 pb-4">
          <p className="text-sm text-muted-foreground">
            Content for {title.toLowerCase()} will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
