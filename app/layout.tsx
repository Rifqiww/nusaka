import type { Metadata } from "next";
import { Geist, Geist_Mono, Nanum_Pen_Script } from "next/font/google";
import "./globals.css";
import GlobalAudio from "@/components/GlobalAudio";
import GlobalTransition from "@/components/GlobalTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nanumPen = Nanum_Pen_Script({
  weight: "400",
  variable: "--font-nanum-pen",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nusaka",
  description: "Kenali Hewan Nusaka",
  icons: {
    icon: "/Favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nanumPen.variable} antialiased`}
      >
        <GlobalAudio />
        <GlobalTransition />
        {children}
      </body>
    </html>
  );
}
