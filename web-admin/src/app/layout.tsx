import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | DBecommerce",
  description: "Panel de administración para empresas en Blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen pb-20">{children}</body>
    </html>
  );
}
