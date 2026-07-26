import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "DS Agro Tourism & Resort | From Soil to Serenity", template: "%s | DS Agro Tourism & Resort" },
  description: "A nature-led destination for stays, day outings, family time and celebrations. Send a direct enquiry to plan your visit.",
  openGraph: { title: "DS Agro Tourism & Resort", description: "Escape the city. Experience nature. Live luxury.", type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
