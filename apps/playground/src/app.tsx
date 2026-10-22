import { cn } from "@masmeert/ui/lib/utils";

export function App() {
  return (
    <main className={cn("mx-auto max-w-3xl p-10")}>
      <h1 className="text-2xl font-semibold">@masmeert/ui</h1>
      <p className="mt-2 text-muted-foreground">Playground</p>
    </main>
  );
}
