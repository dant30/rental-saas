import type { HTMLAttributes } from "react";
import { cn } from "@utils/cn";

type Span = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ColProps extends HTMLAttributes<HTMLDivElement> {
  span?: Span;
}

const spanClasses: Record<Span, string> = {
  1: "w-1/12",
  2: "w-2/12",
  3: "w-3/12",
  4: "w-4/12",
  5: "w-5/12",
  6: "w-6/12",
  7: "w-7/12",
  8: "w-8/12",
  9: "w-9/12",
  10: "w-10/12",
  11: "w-11/12",
  12: "w-full",
};

const Col = ({ span = 12, className, ...props }: ColProps) => (
  <div className={cn("min-w-0", spanClasses[span], className)} {...props} />
);

export default Col;
