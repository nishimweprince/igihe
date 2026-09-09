import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({ withImage = true }: { withImage?: boolean }) {
  return (
    <div className="space-y-2.5">
      {withImage && <Skeleton className="aspect-[3/2] w-full" />}
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-2.5 w-32" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-11 border-b border-rule" />
      <div className="mx-auto flex max-w-page flex-col items-center px-4 py-6 sm:py-8">
        <Skeleton className="h-2.5 w-40" />
        <Skeleton className="mt-3 h-14 w-64 sm:w-80" />
        <Skeleton className="mt-3 h-2.5 w-52" />
      </div>
      <div className="h-11 border-y border-ink" />

      <main className="mx-auto max-w-page px-4">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 py-6 lg:grid-cols-12 lg:gap-y-0">
          <div className="lg:order-2 lg:col-span-6 lg:border-x lg:border-rule lg:px-6">
            <div className="pt-2">
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="mt-4 aspect-[16/9] w-full" />
            <Skeleton className="mt-4 h-9 w-full" />
            <Skeleton className="mt-2 h-9 w-3/4" />
            <Skeleton className="mt-4 h-3.5 w-full" />
            <Skeleton className="mt-2 h-3.5 w-2/3" />
          </div>

          <div className="lg:order-1 lg:col-span-3 lg:pr-6">
            <div className="pt-2">
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="mt-4 space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} withImage={false} />
              ))}
            </div>
          </div>

          <div className="lg:order-3 lg:col-span-3 lg:pl-6">
            <div className="pt-2">
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="mt-4 space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} withImage={false} />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="mt-4 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </main>
      <span className="sr-only" role="status">
        Amakuru arimo gutegurwa
      </span>
    </div>
  );
}
