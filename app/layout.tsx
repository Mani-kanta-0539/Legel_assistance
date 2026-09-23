import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ClauseGuard | AI Contract Risk & Legal Intake Assistant",
  description:
    "Demystify predatory contracts, detect unconscionable clauses, compare contract drafts, and generate lawyer-ready briefing dossiers with Google Gemini GenAI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FFF8DF] text-[#18030B] font-sans selection:bg-[#FC6C26] selection:text-[#FFF8DF]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
