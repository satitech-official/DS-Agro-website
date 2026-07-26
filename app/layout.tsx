import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = "https://satitech-official.github.io/DS-Agro-website";
const previewImage = `${siteUrl}/preview.svg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "DS Agro Tourism & Resort | From Soil to Serenity", template: "%s | DS Agro Tourism & Resort" },
  description: "A nature-led destination for stays, day outings, family time and celebrations. Send a direct enquiry to plan your visit.",
  openGraph: {
    title: "DS Agro Tourism & Resort",
    description: "Escape the city. Experience nature. Live luxury.",
    type: "website",
    url: siteUrl,
    images: [previewImage],
  },
  twitter: { card: "summary_large_image", images: [previewImage] },
  icons: { icon: `${basePath}/favicon.svg` },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
