import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astralia AI Studio",
  description: "Estúdio privado de conteúdo e vídeo do Astralia.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
