import { cva } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center w-fit h-fit rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        "org-role-owner": "border-transparent bg-[image:var(--gradient-premium)] text-primary-foreground shadow-sm",
        "org-role-manager": "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        "org-role-staff": "border-border bg-transparent text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)
