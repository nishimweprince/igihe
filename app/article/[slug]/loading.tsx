import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="grid grid-cols-1 gap-x-8 py-6 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:pr-8">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="mt-3 h-10 w-full" />
            <Skeleton className="mt-2 h-10 w-4/5" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <div className="mt-5 border-y border-rule py-3">
              <Skeleton className="h-2.5 w-64" />
            </div>
            <Skeleton className="mt-6 aspect-[16/9] w-full" />
            <div className="mt-7 max-w-measure space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={i % 4 === 3 ? "h-4 w-2/3" : "h-4 w-full"}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 lg:col-span-4 lg:mt-0 lg:border-l lg:border-rule lg:pl-8">
            <div className="section-rule pt-2">
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="mt-4 space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-2.5 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-[72px] w-[88px] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <span className="sr-only" role="status">
        Inkuru irimo gutegurwa
      </span>
    </div>
  );
}
