"use client";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "🎤 CONCERT VAULT", subtitle = "Libera espacio. Quédate con lo mejor." }: HeaderProps) {
  return (
    <header className="text-center">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-zinc-600">{subtitle}</p>
      )}
    </header>
  );
}
