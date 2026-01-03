import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring focus-visible:ring-[3px] aria-invalid:ring-destructive aria-invalid:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "border border-border bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-destructive",
        success:
          "bg-success text-success-foreground shadow-xs hover:bg-success/90 focus-visible:ring-success",
        warning:
          "bg-warning text-warning-foreground shadow-xs hover:bg-warning/90 focus-visible:ring-warning",
        outline:
          "border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground",
        accent:
          "bg-accent text-accent-foreground shadow-xs hover:bg-accent/80",
        muted:
          "bg-muted text-muted-foreground hover:text-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
