"use client";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function SectionTitle({
  title,
  subtitle,
  action,
}: SectionTitleProps) {
  return (
    <div className="flex items-end justify-between">

      <div>

        <h2 className="text-3xl font-black text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 text-slate-400">
            {subtitle}
          </p>
        )}

      </div>

      {action}

    </div>
  );
}