import { Skeleton } from "@/components/ui/skeleton";

const MinhaAreaSkeleton = () => (
  <div className="min-h-screen bg-background">
    {/* Header */}
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
    </header>

    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Plan info card */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Protocol section */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Check-in section */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-28" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default MinhaAreaSkeleton;
