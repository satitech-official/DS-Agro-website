"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { contact, experiences, nav } from "../data/site";

function whatsapp(message: string) {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <Link className="brand" href="/" aria-label="DS Agro Tourism home"><span className="brand-mark">DS</span><span>Agro Tourism <small>& Resort</small></span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">{nav.slice(1, 7).map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav>
    <a className="nav-cta" href={whatsapp("Hello DS Agro Tourism & Resort, I would like to plan a visit.")} target="_blank" rel="noreferrer">Plan your visit</a>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu"><span /><span /></button>
    {open && <div className="mobile-menu">{nav.map(([label, href], index) => <Link href={href} key={href}><span>0{index + 1}</span>{label}</Link>)}</div>}
  </header>;
}

function BookingPanel() {
  const [type, setType] = useState("Stay");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");
  const message = `Hello DS Agro Tourism & Resort, I would like to enquire about a ${type.toLowerCase()}.\nPreferred date: ${date || "To be decided"}\nGuests: ${guests}\nPlease share current availability, inclusions and pricing.`;
  return <div className="booking-panel">
    <label><span>Visit type</span><select value={type} onChange={e => setType(e.target.value)}><option>Stay</option><option>Day outing</option><option>Celebration</option><option>Corporate outing</option></select></label>
    <label><span>Preferred date</span><input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
    <label><span>Guests</span><input type="number" min="1" value={guests} onChange={e => setGuests(e.target.value)} /></label>
    <a className="button button-gold" href={whatsapp(message)} target="_blank" rel="noreferrer">Check on WhatsApp <b>↗</b></a>
  </div>;
}

export function HomeExperience() {
  const [active, setActive] = useState(0);
  const [scrolled, setScrolled] = useState(0);
  const feature = experiences[active];
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY / Math.max(document.body.scrollHeight - innerHeight, 1));
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <div className="progress" style={{ transform: `scaleX(${scrolled})` }} />
    <Header />
    <main id="main">
      <section className="hero">
        <div className="hero-image" role="img" aria-label="Lush countryside inspiration at golden hour" /><div className="hero-shade" />
        <div className="hero-copy"><p className="eyebrow light">DS Agro Tourism & Resort</p><h1>Escape the city.<br /><em>Return to yourself.</em></h1><p className="hero-lede">Nature-led stays, family adventures and celebrations shaped under open skies.</p>
          <div className="hero-actions"><a className="button button-gold" href="#enquire">Plan your visit <b>↘</b></a><a className="text-link" href="#story">Discover the story <span>↓</span></a></div>
        </div>
        <div className="hero-note"><span>From soil</span><i /><span>to serenity</span></div>
      </section>
      <div id="enquire" className="booking-wrap"><BookingPanel /></div>
      <section className="intro section" id="story">
        <div><p className="eyebrow">The escape</p><h2>A slower world,<br />waiting just beyond<br /><em>the everyday.</em></h2></div>
        <div className="intro-copy"><p className="large-copy">DS Agro Tourism & Resort brings together the openness of farm life and the comfort of a considered getaway.</p><p>Come for a stay, a day outdoors, time by the pool or a gathering with the people who matter. Every visit begins with a direct conversation, so the details fit your plan.</p><Link className="arrow-link" href="/experiences">Explore all experiences <span>→</span></Link></div>
      </section>
      <section className="experience-stage"><div className="experience-image" style={{ backgroundImage: `linear-gradient(90deg,rgba(17,36,26,.1),rgba(17,36,26,.72)),url("${feature.image}")` }} />
        <div className="experience-content"><p className="eyebrow light">Choose your escape</p>
          <div className="experience-tabs" role="tablist" aria-label="Experience selector">{experiences.map((item, index) => <button role="tab" aria-selected={active === index} onClick={() => setActive(index)} key={item.name}><span>0{index + 1}</span>{item.name}</button>)}</div>
          <div className="experience-detail"><p>{feature.eyebrow}</p><h3>{feature.copy}</h3><a href={whatsapp(`Hello DS Agro Tourism & Resort, I am interested in ${feature.name}. Please share more details.`)} target="_blank" rel="noreferrer">Enquire about this <span>↗</span></a></div>
        </div>
      </section>
      <section className="day section"><div className="day-heading"><p className="eyebrow">A day at DS</p><h2>Follow the light.</h2><p>From first light to the glow of evening, make space for the moments that city life rushes past.</p></div>
        <div className="day-grid"><article className="day-card morning"><div><span>Morning</span><h3>Wake with the land</h3></div></article><article className="day-card afternoon"><div><span>Afternoon</span><h3>Cool off. Slow down.</h3></div></article><article className="day-card evening"><div><span>Golden hour</span><h3>Gather into evening</h3></div></article></div>
        <p className="disclaimer">Images across this concept site are licensed experience inspiration and are not presented as photographs of DS Agro Tourism & Resort. Visit the official Instagram for current property imagery.</p>
      </section>
      <section className="gather"><div className="gather-image" /><div className="gather-copy"><p className="eyebrow light">Celebrations</p><h2>More room for<br /><em>what matters.</em></h2><p>Family milestones, group outings and corporate days feel different with open sky above and nature all around.</p><Link className="button button-cream" href="/celebrations">Imagine your gathering <b>→</b></Link></div></section>
      <section className="final-cta"><p className="eyebrow">Begin your escape</p><h2>Your weekend deserves<br /><em>more than a stay.</em></h2><div><a className="button button-dark" href={whatsapp("Hello DS Agro Tourism & Resort, I would like to know more about visiting the resort.")} target="_blank" rel="noreferrer">WhatsApp us <b>↗</b></a><a className="button button-outline" href={contact.maps} target="_blank" rel="noreferrer">Get directions <b>↗</b></a></div></section>
    </main>
    <footer><div className="footer-top"><div className="footer-brand"><span className="brand-mark">DS</span><h3>Agro Tourism<br /><small>& Resort</small></h3><p>Escape the city. Experience nature. Live luxury.</p></div><div><p className="footer-label">Explore</p>{nav.slice(1, 7).map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</div><div><p className="footer-label">Connect</p><a href={`tel:+91${contact.phones[0]}`}>{contact.displayWhatsapp}</a><a href={contact.instagram} target="_blank" rel="noreferrer">Instagram ↗</a><a href={contact.maps} target="_blank" rel="noreferrer">Google Maps ↗</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} DS Agro Tourism & Resort</span><span>Facts, rates and availability confirmed directly by the resort.</span></div></footer>
    <div className="mobile-actions"><a href={`tel:+91${contact.phones[0]}`}>Call</a><a href={whatsapp("Hello DS Agro Tourism & Resort, I would like to plan a visit.")}>WhatsApp</a><a href={contact.maps}>Directions</a></div>
  </>;
}
