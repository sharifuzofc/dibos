import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva("button", {
  variants: { variant: { default: "button-primary", outline: "button-outline", ghost: "button-ghost", icon: "icon-button" } },
  defaultVariants: { variant: "default" },
});
export function Button({ variant, className, ...props }: ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant }), className)} type="button" {...props} />;
}
