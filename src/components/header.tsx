"use client";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Concert Vault", subtitle }: HeaderProps) {
  return (
    <header>
      <h1 className="text-xl font-medium text-zinc-900">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>}
    </header>
  );
}
