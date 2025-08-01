import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md", className)}
      style={{
        backgroundColor: 'hsl(var(--primary) / 0.1)'
      }}
      {...props}
    />
  )
}

export { Skeleton }