import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="shell py-14">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-5 h-14 w-2/3" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[14px] border border-line bg-surface">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
