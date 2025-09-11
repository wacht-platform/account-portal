export default function NotFound() {
  return (
    <div className="flex w-full h-screen items-center justify-center bg-background">
      <div className="max-w-[400px] w-full bg-surface/50 dark:bg-zinc-900/50 backdrop-blur rounded-xl shadow-sm border border-border/50 p-8 text-center">
        <div className="mb-6">
          <h1 className="text-5xl text-foreground mb-2">404</h1>
          <h2 className="text-xl text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground text-sm mb-6">
            The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="/"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}