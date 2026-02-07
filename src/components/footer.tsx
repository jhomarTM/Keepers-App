export function Footer() {
  const stack = [
    { name: "v0", url: "https://v0.dev" },
    { name: "Next.js", url: "https://nextjs.org" },
    { name: "Vercel", url: "https://vercel.com" },
    { name: "Cloudinary", url: "https://cloudinary.com" },
    { name: "xAI", url: "https://x.ai" },
    { name: "Groq", url: "https://groq.com" },
  ];

  return (
    <footer className="border-t border-zinc-100 bg-zinc-50/30">
      <div className="mx-auto max-w-md px-5 py-6">
        <p className="mb-3 text-center text-xs text-zinc-500">
          Hecho con
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {stack.map((tech) => (
            <a
              key={tech.name}
              href={tech.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:underline"
            >
              {tech.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
