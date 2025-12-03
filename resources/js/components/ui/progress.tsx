import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

function Progress({
  className,
  value = 0,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const v = Math.min(100, Math.max(0, value ?? 0))


  const colors = [
    [0, 0, 0],      
    [59, 130, 246], 
    [34, 197, 94],   
  ]

  const t = v / 100
  const mid = t * 2

  const [from, to] = mid <= 1
    ? [colors[0], colors[1]]
    : [colors[1], colors[2]]

  const m = mid <= 1 ? mid : mid - 1
  const rgb = from.map((c, i) => c + (to[i] - c) * m)
  const dynamicColor = `rgb(${rgb.join(",")})`

  return (
    <ProgressPrimitive.Root
      className={cn("bg-muted/30 relative h-2 w-full overflow-hidden rounded-full", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full transition-all"
        style={{
          transform: `translateX(-${100 - v}%)`,
          backgroundColor: dynamicColor,
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
