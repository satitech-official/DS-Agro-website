"use client";

import { useEffect, useState } from "react";
import { contact, experiences, nav } from "../data/site";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function sitePath(path: string) {
  if (!path.startsWith("/")) return path;
  if (path === "/") return `${basePath}/`;
  return `${basePath}${path}${path.endsWith("/") ? "" : "/"}`;
}

export function whatsapp(message: string) {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

function SocialIcon({ type }: { type: "wa" | "ig" | "fb" }) {
  return <span className={`social-glyph ${type}`} aria-hidden="true">{type === "wa" ? "◔" : type === "ig" ? "◎" : "f"}</span>;
}

export function FirstVisitLoader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const seen = sessionStorage.getItem("ds-loader-seen-v2");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen) {
      const instant = setTimeout(() => setShow(false), 0);
      return () => clearTimeout(instant);
    }
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("ds-loader-seen-v2", "1");
    }, reduce ? 250 : 2100);
    return () => clearTimeout(timer);
  }, []);
  if (!show) return null;
  return <div className="opening-loader" role="status" aria-label="Opening DS Agro Tourism & Resort">
    <button onClick={() => { sessionStorage.setItem("ds-loader-seen-v2", "1"); setShow(false); }} aria-label="Skip opening animation">Skip</button>
    <div className="loader-ripple" /><div className="loader-seed" /><div className="loader-stem"><i /><i /></div>
    <p>From soil</p><strong>DS</strong><p>to serenity</p>
  </div>;
}

export function Header({ currentPath = "/" }: { currentPath?: string }) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const onScroll = () => setCompact(scrollY > 80);
    onScroll(); addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  return <header className={`site-header ${compact ? "is-compact" : ""}`}>
    <a className="brand" href={sitePath("/")} aria-label="DS Agro Tourism home"><span className="brand-mark">DS</span><span>Agro Tourism <small>& Resort</small></span></a>
    <nav className="desktop-nav" aria-label="Main navigation">{nav.map(([label, href]) => <a className={currentPath === href ? "current-link" : ""} aria-current={currentPath === href ? "page" : undefined} href={sitePath(href)} key={href}>{label}</a>)}</nav>
    <a className="nav-cta" href={whatsapp("Hello DS Agro Tourism & Resort, I would like to plan a visit.")} target="_blank" rel="noreferrer">Plan your visit <span>↗</span></a>
    <button className={`menu-button ${open ? "open" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu"><span /><span /></button>
    {open && <div className="mobile-menu">
      <div className="menu-glow" />
      {nav.map(([label, href], index) => <a className={currentPath === href ? "current-link" : ""} aria-current={currentPath === href ? "page" : undefined} href={sitePath(href)} key={href} style={{ animationDelay: `${index * 55}ms` }}><span>0{index + 1}</span>{label}</a>)}
      <div className="menu-socials"><a href={contact.instagram} target="_blank" rel="noreferrer"><SocialIcon type="ig" /> Instagram</a><a href={whatsapp("Hello DS Agro Tourism & Resort")}><SocialIcon type="wa" /> WhatsApp</a></div>
    </div>}
  </header>;
}

export function GlobalMotion() {
  const [progress, setProgress] = useState(0);
  const [up, setUp] = useState(false);
  useEffect(() => {
    const reveal = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("is-visible");
    }), { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(el => reveal.observe(el));
    const onScroll = () => {
      setProgress(scrollY / Math.max(document.body.scrollHeight - innerHeight, 1));
      setUp(scrollY > 500);
      document.documentElement.style.setProperty("--scroll-y", `${scrollY * .08}px`);
    };
    onScroll(); addEventListener("scroll", onScroll, { passive: true });
    return () => { reveal.disconnect(); removeEventListener("scroll", onScroll); };
  }, []);
  return <>
    <div className="progress" style={{ transform: `scaleX(${progress})` }} />
    <a className="floating-wa" href={whatsapp("Hello DS Agro Tourism & Resort, I would like to plan a visit.")} target="_blank" rel="noreferrer" aria-label="WhatsApp DS Agro Tourism"><SocialIcon type="wa" /><span>Enquire</span></a>
    <button className={`back-top ${up ? "show" : ""}`} onClick={() => scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">↑</button>
  </>;
}

export function Footer() {
  return <footer>
    <div className="footer-orbit one" /><div className="footer-orbit two" />
    <div className="footer-top">
      <div className="footer-brand"><span className="brand-mark">DS</span><h3>Agro Tourism<br /><small>& Resort</small></h3><p>Escape the city. Experience nature. Live luxury.</p></div>
      <div><p className="footer-label">Explore</p>{nav.map(([label, href]) => <a href={sitePath(href)} key={href}>{label}</a>)}</div>
      <div><p className="footer-label">Connect</p><a href={`tel:+91${contact.phones[0]}`}>{contact.displayWhatsapp}</a><a href={contact.maps} target="_blank" rel="noreferrer">Google Maps ↗</a>
        <div className="social-row">
          <a className="social-button" href={whatsapp("Hello DS Agro Tourism & Resort")} target="_blank" rel="noreferrer" aria-label="WhatsApp"><SocialIcon type="wa" /></a>
          <a className="social-button" href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><SocialIcon type="ig" /></a>
          <span className="social-button pending" title="Official Facebook link pending" aria-label="Facebook link pending"><SocialIcon type="fb" /></span>
        </div>
      </div>
    </div>
    <div className="footer-marquee"><div>ESCAPE THE CITY ✦ EXPERIENCE NATURE ✦ LIVE LUXURY ✦ FARM LIFE, ELEVATED ✦ WEEKENDS THAT STAY WITH YOU ✦ ESCAPE THE CITY ✦ EXPERIENCE NATURE ✦ LIVE LUXURY ✦ FARM LIFE, ELEVATED ✦ WEEKENDS THAT STAY WITH YOU ✦ </div></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} DS Agro Tourism & Resort</span><span>Facts, rates and availability confirmed directly by the resort.</span></div>
  </footer>;
}

function BookingPanel() {
  const [type, setType] = useState("Stay");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");
  const message = `Hello DS Agro Tourism & Resort, I would like to enquire about a ${type.toLowerCase()}.\nPreferred date: ${date || "To be decided"}\nGuests: ${guests}\nPlease share current availability, inclusions and pricing.`;
  return <div className="booking-panel reveal">
    <label><span>Visit type</span><select value={type} onChange={e => setType(e.target.value)}><option>Stay</option><option>Day outing</option><option>Celebration</option><option>Corporate outing</option></select></label>
    <label><span>Preferred date</span><input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
    <label><span>Guests</span><input type="number" min="1" value={guests} onChange={e => setGuests(e.target.value)} /></label>
    <a className="button button-gold pulse-button" href={whatsapp(message)} target="_blank" rel="noreferrer">Check on WhatsApp <b>↗</b></a>
  </div>;
}

const signatureMoments = [
  { label: "Private stays", title: "Wake up closer to nature", image: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1200&q=86" },
  { label: "Family escapes", title: "Trade screen time for green time", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=86" },
  { label: "Poolside leisure", title: "Long afternoons, beautifully unplanned", image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=86" },
  { label: "Open-air gatherings", title: "Celebrate with more room to breathe", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=86" },
];

const faqs = [
  ["How do I check availability?", "Send your preferred date, group size and visit type on WhatsApp. The resort team will confirm the current options directly."],
  ["Can we plan a family or corporate day outing?", "Yes. Share your expected group size and priorities so the team can suggest a suitable plan, subject to availability."],
  ["Are activities available every day?", "Activity access can vary by weather, age guidance, supervision and maintenance. Please confirm before travelling."],
  ["Where can I see current property photos?", "The official Instagram profile is the best source for current resort-specific images and recent guest moments."],
];

export function HomeExperience() {
  const [active, setActive] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const feature = experiences[active];
  return <>
    <FirstVisitLoader /><GlobalMotion /><a className="skip" href="#main">Skip to content</a><Header currentPath="/" />
    <main id="main" className="page-enter premium-home">
      <section className="hero hero-v2">
        <div className="hero-image" role="img" aria-label="Lush countryside at golden hour" /><div className="hero-shade" />
        <div className="hero-grid-lines" /><div className="sun-orb" /><div className="floating-leaf leaf-one">◆</div><div className="floating-leaf leaf-two">◆</div>
        <div className="hero-copy"><p className="eyebrow light hero-reveal delay-1">DS Agro Tourism & Resort</p><h1 className="hero-reveal delay-2">From city noise<br />to <em>natural luxury.</em></h1><p className="hero-lede hero-reveal delay-3">A premium countryside escape for slow stays, family adventures, poolside afternoons and unforgettable gatherings.</p>
          <div className="hero-actions hero-reveal delay-4"><a className="button button-gold pulse-button" href="#enquire">Plan your escape <b>↘</b></a><a className="text-link" href="#signature">Explore the resort <span>↓</span></a></div>
        </div>
        <div className="hero-stat-strip"><div><strong>Nature</strong><span>All around you</span></div><div><strong>Direct</strong><span>WhatsApp planning</span></div><div><strong>Flexible</strong><span>Stays & day visits</span></div></div>
        <div className="hero-note"><span>From soil</span><i /><span>to serenity</span></div>
      </section>

      <div className="energy-marquee"><div>Luxury Stay ✦ Day Outing ✦ Swimming Pool ✦ Horse Riding ✦ Farm Experience ✦ Family Time ✦ Traditional Food ✦ Celebrations ✦ Luxury Stay ✦ Day Outing ✦ Swimming Pool ✦ Horse Riding ✦ Farm Experience ✦ Family Time ✦ Traditional Food ✦ Celebrations ✦ </div></div>
      <div id="enquire" className="booking-wrap"><BookingPanel /></div>

      <section className="intro section reveal" id="story">
        <div><p className="eyebrow">A different pace</p><h2>Come back to<br />what weekends<br /><em>should feel like.</em></h2></div>
        <div className="intro-copy"><p className="large-copy">Not just a place to stay—a space to breathe, reconnect and create stories worth carrying home.</p><p>DS Agro Tourism & Resort blends the openness of farm life with thoughtful comfort. Arrive for the day, stay overnight, gather with family or plan a team escape. Every visit is shaped through a direct conversation with the resort.</p><a className="arrow-link" href={sitePath("/experiences")}>Discover every experience <span>→</span></a></div>
      </section>

      <section id="signature" className="signature-section section reveal">
        <div className="signature-heading"><div><p className="eyebrow">Signature moments</p><h2>Choose the feeling<br /><em>you came for.</em></h2></div><p>Four ways to experience DS Agro—each designed around nature, togetherness and time that finally slows down.</p></div>
        <div className="signature-grid">{signatureMoments.map((item, index) => <a className={`signature-card signature-${index + 1}`} href={sitePath(index === 0 ? "/stay" : index === 3 ? "/celebrations" : "/experiences")} key={item.title} style={{ backgroundImage: `linear-gradient(0deg,rgba(8,28,18,.82),transparent 62%),url("${item.image}")` }}><span>0{index + 1} · {item.label}</span><h3>{item.title}</h3><b>Explore ↗</b></a>)}</div>
      </section>

      <section className="experience-stage reveal"><div className="experience-image" style={{ backgroundImage: `linear-gradient(90deg,rgba(17,36,26,.1),rgba(17,36,26,.72)),url("${feature.image}")` }} />
        <div className="experience-content"><p className="eyebrow light">Interactive escape selector</p>
          <div className="experience-tabs" role="tablist" aria-label="Experience selector">{experiences.map((item, index) => <button role="tab" aria-selected={active === index} onClick={() => setActive(index)} key={item.name}><span>0{index + 1}</span>{item.name}</button>)}</div>
          <div className="experience-detail"><p>{feature.eyebrow}</p><h3 key={feature.name} className="content-swap">{feature.copy}</h3><a href={whatsapp(`Hello DS Agro Tourism & Resort, I am interested in ${feature.name}. Please share more details.`)} target="_blank" rel="noreferrer">Enquire about this <span>↗</span></a></div>
        </div>
      </section>

      <section className="story-banner reveal"><div className="story-banner-image" /><div className="story-banner-copy"><p className="eyebrow light">Farm life, reimagined</p><h2>The luxury of<br /><em>having nowhere else to be.</em></h2><p>Wake slowly. Swim longer. Eat together. Watch the light change. The best moments here do not need a schedule.</p><a className="button button-cream" href={sitePath("/day-outing")}>Plan a day outing <b>→</b></a></div></section>

      <section className="day section reveal"><div className="day-heading"><p className="eyebrow">A day at DS</p><h2>Follow the light.</h2><p>From first light to the glow of evening, make space for the moments that city life rushes past.</p></div>
        <div className="day-grid"><article className="day-card morning"><div><span>Morning</span><h3>Wake with the land</h3></div></article><article className="day-card afternoon"><div><span>Afternoon</span><h3>Cool off. Slow down.</h3></div></article><article className="day-card evening"><div><span>Golden hour</span><h3>Gather into evening</h3></div></article></div>
      </section>

      <section className="trust-section section reveal"><div><p className="eyebrow">Simple planning</p><h2>No confusing forms.<br /><em>Just a real conversation.</em></h2></div><div className="trust-steps"><article><span>01</span><h3>Share your plan</h3><p>Tell us the date, group size and kind of visit you have in mind.</p></article><article><span>02</span><h3>Get current details</h3><p>The resort confirms availability, inclusions and pricing directly.</p></article><article><span>03</span><h3>Arrive ready</h3><p>Receive route guidance and practical information before travelling.</p></article></div></section>

      <section className="gather reveal"><div className="gather-image" /><div className="gather-copy"><p className="eyebrow light">Gatherings</p><h2>More room for<br /><em>what matters.</em></h2><p>Family milestones, group outings and corporate days feel different with open sky above and nature all around.</p><a className="button button-cream" href={sitePath("/celebrations")}>Imagine your gathering <b>→</b></a></div></section>

      <section className="faq-section section reveal"><div className="faq-intro"><p className="eyebrow">Before you visit</p><h2>Questions,<br /><em>answered simply.</em></h2><a href={whatsapp("Hello DS Agro Tourism & Resort, I have a question about planning my visit.")} target="_blank" rel="noreferrer">Ask on WhatsApp ↗</a></div><div className="faq-list">{faqs.map(([question, answer], index) => <article className={openFaq === index ? "open" : ""} key={question}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}><span>0{index + 1}</span>{question}<b>{openFaq === index ? "−" : "+"}</b></button><p>{answer}</p></article>)}</div></section>

      <section className="instagram-cta reveal"><div><p className="eyebrow light">See what is happening now</p><h2>Current moments live<br /><em>on Instagram.</em></h2><p>For recent property-specific photos, guest moments and updates, visit the official DS Agro profile.</p><a className="button button-gold" href={contact.instagram} target="_blank" rel="noreferrer">Open Instagram <b>↗</b></a></div></section>

      <section className="final-cta reveal"><div className="cta-spark one">✦</div><div className="cta-spark two">✦</div><p className="eyebrow">Begin your escape</p><h2>Your weekend deserves<br /><em>more than a stay.</em></h2><div><a className="button button-dark pulse-button" href={whatsapp("Hello DS Agro Tourism & Resort, I would like to know more about visiting the resort.")} target="_blank" rel="noreferrer">WhatsApp us <b>↗</b></a><a className="button button-outline" href={contact.maps} target="_blank" rel="noreferrer">Get directions <b>↗</b></a></div></section>
    </main>
    <Footer />
    <div className="mobile-actions"><a href={`tel:+91${contact.phones[0]}`}>Call</a><a href={whatsapp("Hello DS Agro Tourism & Resort, I would like to plan a visit.")}>WhatsApp</a><a href={contact.maps}>Directions</a></div>
  </>;
}
