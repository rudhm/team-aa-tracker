import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-xl border border-[#E6EAE0] bg-white px-3 py-2 text-[13px] font-medium text-[#11161B] transition-all outline-none placeholder:text-[#11161B]/30 focus-visible:border-[#11161B]/20 focus-visible:ring-2 focus-visible:ring-[#11161B]/5 disabled:cursor-not-allowed disabled:bg-[#F3F5EE] disabled:opacity-50 aria-invalid:border-red-300 aria-invalid:ring-2 aria-invalid:ring-red-100",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
