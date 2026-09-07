import { MorphingInfinity } from "@/components/loading-ui/morphing-infinity"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F5EE] dark:bg-black">
      <MorphingInfinity className="h-20 w-20 text-[var(--theme-accent)] animate-pulse" />
    </div>
  )
}
