import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-xl border border-[#E6EAE0] bg-white px-3 py-1.5 text-[13px] font-medium text-[#11161B] transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#11161B] placeholder:text-[#11161B]/30 focus-visible:border-[#11161B]/20 focus-visible:ring-2 focus-visible:ring-[#11161B]/5 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F3F5EE] disabled:opacity-50 aria-invalid:border-red-300 aria-invalid:ring-2 aria-invalid:ring-red-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
