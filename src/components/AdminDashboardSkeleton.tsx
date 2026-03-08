import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function StatCardSkeleton() {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-10" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

function IssueRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 px-2 border-b border-border last:border-0">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-14 rounded-full" />
      <Skeleton className="h-5 w-12 rounded-full" />
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  );
}

function MobileCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="glass-card">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex justify-between items-center">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface AdminDashboardSkeletonProps {
  isMobile: boolean;
}

export function AdminDashboardSkeleton({ isMobile }: AdminDashboardSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="glass-card">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <MobileCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <IssueRowSkeleton key={i} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar skeleton */}
        <div className="lg:col-span-1">
          <SidebarSkeleton />
        </div>
      </div>
    </div>
  );
}
