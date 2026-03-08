import type { ImgHTMLAttributes, ReactNode } from "react";
import { User } from "lucide-react";
import { cn } from "@utils/cn";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size"> {
  fallback?: ReactNode;
  size?: AvatarSize;
}

export interface AvatarGroupProps {
  children: ReactNode;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const Avatar = ({ src, alt, fallback, size = "md", className, ...props }: AvatarProps) =>
  src ? (
    <img src={src} alt={alt} className={cn("rounded-full object-cover", sizeClasses[size], className)} {...props} />
  ) : (
    <span className={cn("inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-gray-200", sizeClasses[size], className)}>
      {fallback || <User className="h-4 w-4" />}
    </span>
  );

export const AvatarGroup = ({ children, className }: AvatarGroupProps) => (
  <div className={cn("flex -space-x-2", className)}>{children}</div>
);

export default Avatar;
