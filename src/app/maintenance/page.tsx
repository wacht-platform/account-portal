"use client";

export default function Maintenance() {
  return (
    <div className="flex w-full h-screen items-center justify-center bg-background">
      <div className="max-w-[400px] w-full bg-surface/50 dark:bg-zinc-900/50 backdrop-blur rounded-xl shadow-sm border border-border/50 p-8 text-center">
        <div className="mb-6">
          <h1 className="text-xl text-foreground mb-3">Under Maintenance</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We're currently performing scheduled maintenance. We'll be back shortly.
          </p>
        </div>


        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          Check Again
        </button>
      </div>
    </div>
  );
}