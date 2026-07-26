/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Footer, GlobalMotion, Header } from "../../components/HomeExperience";
import { contact, pages } from "../../data/site";

export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(pages).map(slug => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = pages[(await params).slug];
  return page ? { title: page.kicker, description: page.intro } : {};
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();
  const message = `Hello DS Agro Tourism & Resort, I would like to enquire about ${page.kicker.toLowerCase()}. Please share current details.`;
  const gallery = [
    "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
  ];
  return <><GlobalMotion /><Header /><main className="page-enter">
    <section className="inner-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(18,34,25,.84),rgba(18,34,25,.18)),url("${page.image}")` }}>
      <div className="inner-hero-copy"><p className="eyebrow light">{page.kicker}</p><h1>{page.title}</h1><p>{page.intro}</p></div>
      <div className="inner-scroll">Scroll to discover <span>↓</span></div>
    </section>
    <div className="energy-marquee"><div>From Soil to Serenity ✦ Nature-led escapes ✦ Unforgettable gatherings ✦ Direct resort enquiry ✦ </div></div>
    <section className="inner-sections section reveal">{page.sections.map((section, i) => <article className="reveal" key={section.title}><span>0{i + 1}</span><div><h2>{section.title}</h2><p>{section.body}</p></div></article>)}</section>
    {slug === "gallery" && <section className="gallery-grid section reveal">{gallery.map((src, i) => <figure key={src}><img src={src} alt={`Experience inspiration ${i + 1}`} /><figcaption>Experience inspiration · 0{i + 1}</figcaption></figure>)}</section>}
    <section className="final-cta reveal"><div className="cta-spark one">✦</div><div className="cta-spark two">✦</div><p className="eyebrow">Direct enquiry</p><h2>Let’s plan the<br /><em>right escape.</em></h2><div><a className="button button-dark pulse-button" href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">Enquire on WhatsApp <b>↗</b></a><a className="button button-outline" href={contact.maps} target="_blank" rel="noreferrer">Get directions <b>↗</b></a></div></section>
  </main><Footer /></>;
}
