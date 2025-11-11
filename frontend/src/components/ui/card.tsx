import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "bordered" | "highlighted" | "primary" | "success" | "destructive" | "warning" | "info";
}

function Card({ className, variant = "default", ...props }: CardProps) 
{
  const variantClasses = {
    default: "bg-card text-card-foreground",
    bordered: "bg-card text-card-foreground border border-border",
    highlighted: "bg-card text-card-foreground border border-primary/30 shadow-md hover:shadow-lg transition-shadow",
    primary: "bg-card text-card-foreground border border-primary/40 shadow-primary",
    success: "bg-card text-card-foreground border border-success/40 shadow-success",
    destructive: "bg-card text-card-foreground border border-destructive/40 shadow-destructive",
    warning: "bg-card text-card-foreground border border-warning/40 shadow-warning",
    info: "bg-card text-card-foreground border border-info/40 shadow-info",
  };

  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-xl px-4 py-4 shadow-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <div
      data-slot="card-content"
      className={cn("", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
