import React from "react";
import { Skeleton } from "./Skeleton";

export const CardSkeleton: React.FC = () => (
  <div className="premium-card p-5">
    <Skeleton variant="rectangle" height={160} className="mb-4" />
    <Skeleton variant="text" className="mb-2" />
    <Skeleton variant="text" width="60%" />
  </div>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 rounded-card bg-white p-4 shadow-soft">
        <Skeleton variant="circle" height={48} width={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
    ))}
  </div>
);

export const PropertyCardSkeleton: React.FC = () => (
  <div className="premium-card overflow-hidden p-0">
    <Skeleton variant="rectangle" height={180} />
    <div className="p-5">
      <Skeleton variant="text" className="mb-3" />
      <div className="flex items-center gap-3">
        <Skeleton variant="text" width={80} />
        <Skeleton variant="text" width={60} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Skeleton variant="text" width={100} />
        <Skeleton variant="circle" height={32} width={32} />
      </div>
    </div>
  </div>
);

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div
      className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-r-transparent"
      aria-hidden="true"
    />
    <p className="text-base text-text-secondary">{message}</p>
  </div>
);

export const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <div
      className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-r-transparent"
      aria-hidden="true"
    />
  </div>
);

export default PageLoader;
