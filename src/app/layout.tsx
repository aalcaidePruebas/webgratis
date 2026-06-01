import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#2f5c47",
};

export const metadata: Metadata = {
  title: "Mente Sana | Clínica de Psicología",
  description: "Reserva tu sesión de terapia individual, de pareja o infantil de forma rápida y sencilla con profesionales colegiados.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mente Sana",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#f8faf9] text-[#1e293b]">
          {children}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(reg) {
                      console.log('Service Worker registrado con éxito:', reg.scope);
                    }).catch(function(err) {
                      console.log('Fallo al registrar Service Worker:', err);
                    });
                  });
                }
              `
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
