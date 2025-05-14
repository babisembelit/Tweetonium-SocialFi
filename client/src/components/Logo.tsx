import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showBeta?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className, showBeta = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl md:text-6xl"
  };

  const betaSizes = {
    sm: "text-xs px-1 py-0.5",
    md: "text-xs px-1.5 py-0.5",
    lg: "text-sm px-2 py-1"
  };

  return (
    <div className={cn("flex items-center", className)}>
      <h1 className={cn("tiny5-font font-bold tracking-widest", sizeClasses[size])}>
        TWEETONIUM
      </h1>
      {showBeta && (
        <span className={cn("ml-2 font-semibold rounded bg-accent text-white", betaSizes[size])}>
          BETA
        </span>
      )}
    </div>
  );
}
