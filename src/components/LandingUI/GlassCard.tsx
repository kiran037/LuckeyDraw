export default function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.08] shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl p-6 sm:p-8 transition-all ${className}`}
    >
      {children}
    </div>
  );
}
