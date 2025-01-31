"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ItemLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image carousel skeleton */}
        <div>
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Item details skeleton */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-8" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>

          {/* Seller card skeleton */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description and details skeleton */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div>
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>

            {/* Action buttons skeleton */}
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
