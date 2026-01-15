export default function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white/70 dark:bg-[#151925]/70 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-xl rounded-3xl p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}