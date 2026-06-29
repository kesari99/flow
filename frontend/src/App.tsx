import { Button } from '@/components/ui/button'

function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-8 text-foreground">
      <h1 className="text-3xl font-semibold tracking-tight">Promptflow</h1>
      <p className="text-muted-foreground">
        Vite + Tailwind CSS + shadcn/ui
      </p>
      <Button>Get started</Button>
    </main>
  )
}

export default App
