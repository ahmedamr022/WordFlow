"use client";

interface BadgeProps {
  children: React.ReactNode;
  color?: "cyan" | "green" | "yellow" | "pink";
}

export default function Badge({
  children,
  color = "cyan",
}: BadgeProps) {
  const styles = {
    cyan: "bg-cyan-400/10 border-cyan-400/20 text-cyan-300",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",
    pink: "bg-pink-500/10 border-pink-500/20 text-pink-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${styles[color]}`}
    >
      {children}
    </span>
  );
}