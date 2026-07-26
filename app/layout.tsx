import type { Metadata } from "next";
import "./globals.css";

const productionUrl = "https://satitech-official.github.io/DS-Agro-website";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(`${productionUrl}/`),
  title: { default: "DS Agro Tourism & Resort | From Soil to Serenity", template: "%s | DS Agro Tourism & Resort" },
  description: "A nature-led destination for stays, day outings, family time and celebrations. Send a direct enquiry to plan your visit.",
  openGraph: { title: "DS Agro Tourism & Resort", description: "Escape the city. Experience nature. Live luxury.", type: "website", url: productionUrl, images: [`${productionUrl}/og.png`] },
  twitter: { card: "summary_large_image", images: [`${productionUrl}/og.png`] },
  icons: { icon: `${basePath}/favicon.svg` },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
