
import type { Metadata } from "next";
import { Poppins, Noto_Sans } from "next/font/google";
import "../globals.css";
import "../theme-blue.css";
import type { ReactNode } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["100", "900"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "NVCCZ - Authentication",
  description: "Sign in to your NVCCZ account",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${notoSans.variable} theme-blue`}
    >
      <head>
        <meta name="theme-color" content="#0b1220" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
