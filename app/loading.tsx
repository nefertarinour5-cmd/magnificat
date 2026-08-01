import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton de chargement global affiché pendant la navigation
 * entre les routes (streaming Suspense).
 */
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
