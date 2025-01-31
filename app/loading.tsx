"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* App name skeleton */}
      <Skeleton className="h-10 w-48 mx-auto" />

      {/* Search bar skeleton */}
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-12 w-full" />
      </div>

      {/* Category list skeleton */}
      <div className="flex flex-wrap gap-4 justify-center">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-20" />
        ))}
      </div>

      {/* Section title skeleton */}
      <Skeleton className="h-8 w-64" />

      {/* Item grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
