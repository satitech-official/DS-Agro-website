"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { contact, resolveRoomCover, pageMedia } from "../data/site";
import { ResortPhoto } from "./ResortPhoto";
import { appHref, getSupabaseClient } from "../lib/supabase";
import { Footer, GlobalMotion, Header } from "./HomeExperience";

type Availability = {
  room_id: string;
  name: string;
  slug: string;
  category: string;
  room_type: string;
  short_description: string | null;
  max_guests: number | null;
  bed_type: string | null;
  base_price: number | null;
  weekend_price: number | null;
  cover_image: string | null;
  total_units: number;
  available_units: number;
  is_available: boolean;
};

type BookingForm = {
  visitType: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  rooms: number;
  roomId: string;
  occasion: string;
  interests: string[];
  specialRequest: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  consent: boolean;
};

const visitTypes = ["Luxury Stay", "Family Stay", "Couple Stay", "Day Outing", "Corporate Outing", "School / College Outing", "Celebration / Event", "Custom Visit"];
const interests = ["Swimming Pool", "Rain Dance", "Horse Riding", "Turf", "Boating", "Indoor Games", "ATV Ride", "Tyre Climbing"];
const steps = ["Visit", "Dates", "Room", "Preferences", "Details", "Review"];

function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function money(value: number | null) {
  return value == null ? "Rate on request" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function roomImage(room: Availability) {
  return resolveRoomCover(room.slug, room.cover_image);
}

export function BookingExperience() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [form, setForm] = useState<BookingForm>({
    visitType: "Luxury Stay",
    checkIn: localDate(1),
    checkOut: localDate(2),
    adults: 2,
    children: 0,
    infants: 0,
    rooms: 1,
    roomId: "",
    occasion: "",
    interests: [],
    specialRequest: "",
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    city: "",
    consent: false,
  });

  const selectedRoom = availability.find((room) => room.room_id === form.roomId);
  const totalGuests = form.adults + form.children + form.infants;
  const nights = Math.max(1, Math.round((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000));
  const estimatedRoomTotal = selectedRoom?.base_price ? selectedRoom.base_price * form.rooms * nights : null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const date = params.get("checkIn");
    const guests = Number(params.get("adults"));
    const visitType = params.get("visitType");
    if (date && date >= localDate()) {
      const out = new Date(`${date}T12:00:00`);
      out.setDate(out.getDate() + 1);
      queueMicrotask(() => setForm((current) => ({ ...current, checkIn: date, checkOut: out.toISOString().slice(0, 10), adults: guests > 0 ? guests : current.adults, visitType: visitType || current.visitType })));
    }
  }, []);

  function update<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function toggleInterest(value: string) {
    setForm((current) => ({ ...current, interests: current.interests.includes(value) ? current.interests.filter((item) => item !== value) : [...current.interests, value] }));
  }

  function validate(currentStep: number) {
    if (currentStep === 1 && (!form.checkIn || !form.checkOut || form.checkIn < localDate() || form.checkOut <= form.checkIn)) return "Please choose a valid check-in and check-out date.";
    if (currentStep === 1 && (form.adults < 1 || form.rooms < 1)) return "At least one adult and one room are required.";
    if (currentStep === 2 && !form.roomId) return "Please select an available room category.";
    if (currentStep === 2 && selectedRoom?.max_guests && form.adults + form.children > selectedRoom.max_guests * form.rooms) return `Selected room capacity is ${selectedRoom.max_guests} guests per unit.`;
    if (currentStep === 4 && form.name.trim().length < 2) return "Please enter your full name.";
    if (currentStep === 4 && !/^[0-9+ -]{10,18}$/.test(form.phone)) return "Please enter a valid phone number.";
    if (currentStep === 4 && form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email address.";
    if (currentStep === 4 && !form.consent) return "Please accept the inquiry and privacy notice.";
    return "";
  }

  async function loadAvailability() {
    const client = getSupabaseClient();
    if (!client) throw new Error("Live booking service is not configured. Please contact the resort on WhatsApp.");
    const { data, error: rpcError } = await client.rpc("get_room_availability", {
      p_check_in: form.checkIn,
      p_check_out: form.checkOut,
      p_rooms_requested: form.rooms,
    });
    if (rpcError) throw rpcError;
    const rooms = (data ?? []) as Availability[];
    setAvailability(rooms);
    if (!rooms.some((room) => room.room_id === form.roomId && room.is_available)) update("roomId", "");
  }

  async function next() {
    const validation = validate(step);
    if (validation) return setError(validation);
    if (step === 1) {
      setLoading(true);
      try {
        await loadAvailability();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Availability could not be checked.");
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setStep((current) => Math.min(5, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const validation = validate(4);
    if (validation) return setError(validation);
    if (!selectedRoom) return setError("Please select a room again.");
    const client = getSupabaseClient();
    if (!client) return setError("Live booking service is not configured. Please contact the resort on WhatsApp.");
    setLoading(true);
    setError("");
    const token = crypto.randomUUID();
    const { data, error: rpcError } = await client.rpc("submit_booking_inquiry", {
      p_request_token: token,
      p_customer_name: form.name,
      p_phone: form.phone,
      p_email: form.email || null,
      p_whatsapp_number: form.whatsapp || form.phone,
      p_city: form.city || null,
      p_visit_type: form.visitType,
      p_check_in: form.checkIn,
      p_check_out: form.checkOut,
      p_adults: form.adults,
      p_children: form.children,
      p_infants: form.infants,
      p_room_id: form.roomId,
      p_rooms_requested: form.rooms,
      p_occasion: form.occasion || null,
      p_interests: form.interests,
      p_special_request: form.specialRequest || null,
    });
    if (rpcError) {
      setError(rpcError.message || "Your inquiry could not be submitted.");
      setLoading(false);
      return;
    }
    const result = (data?.[0] ?? {}) as { booking_reference?: string };
    const bookingReference = result.booking_reference || `DS-${token.slice(0, 8).toUpperCase()}`;
    const message = [
      `Hello DS Agro Tourism & Resort, I have submitted booking inquiry ${bookingReference}.`,
      `Visit: ${form.visitType}`,
      `Dates: ${form.checkIn} to ${form.checkOut}`,
      `Guests: ${form.adults} adults, ${form.children} children, ${form.infants} infants`,
      `Room: ${selectedRoom.name} × ${form.rooms}`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      "Please confirm final availability, inclusions, payable amount and payment instructions.",
    ].join("\n");
    setReference(bookingReference);
    setWhatsappUrl(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`);
    setLoading(false);
  }

  const summary = useMemo(() => [
    ["Visit type", form.visitType],
    ["Dates", `${form.checkIn} → ${form.checkOut} (${nights} night${nights > 1 ? "s" : ""})`],
    ["Guests", `${totalGuests} total · ${form.rooms} room${form.rooms > 1 ? "s" : ""}`],
    ["Room", selectedRoom?.name ?? "Not selected"],
    ["Interests", form.interests.join(", ") || "None selected"],
    ["Guest", `${form.name} · ${form.phone}`],
  ], [form, selectedRoom, nights, totalGuests]);

  return <>
    <GlobalMotion /><Header currentPath="/booking" />
    <main className="booking-page page-enter">
      <section className="booking-hero" style={{ backgroundImage: `linear-gradient(90deg,#0b2419e8,#0b24195f),url("${pageMedia.booking.hero}")` }}>
        <div><p className="eyebrow light">Direct resort inquiry</p><h1>Plan your<br /><em>perfect escape.</em></h1><p>Choose your dates and room using live resort inventory. Your request remains an inquiry until the DS Agro team confirms it.</p></div>
        <a href={appHref("/stay")}>View room details <span>↗</span></a>
      </section>

      <section className="booking-shell" aria-live="polite">
        <ol className="booking-steps" aria-label="Booking progress">
          {steps.map((label, index) => <li className={index === step ? "active" : index < step ? "done" : ""} key={label}><span>{index < step ? "✓" : index + 1}</span><small>{label}</small></li>)}
        </ol>

        {reference ? <div className="booking-success">
          <span className="success-mark">✓</span><p className="eyebrow">Inquiry saved</p><h2>Thank you, {form.name}.</h2>
          <p>Your reference is <strong>{reference}</strong>. This is not a confirmed booking yet. Continue on WhatsApp so the resort can confirm final availability, amount and payment instructions.</p>
          <a className="button button-gold" href={whatsappUrl} target="_blank" rel="noreferrer">Continue on WhatsApp <b>↗</b></a>
          <a className="booking-home-link" href={appHref("/")}>Return to home</a>
        </div> : <form onSubmit={submit}>
          {step === 0 && <div className="booking-stage"><p className="eyebrow">01 · Your visit</p><h2>What brings you to DS?</h2><div className="visit-options">{visitTypes.map((type) => <button type="button" className={form.visitType === type ? "selected" : ""} onClick={() => update("visitType", type)} key={type}><span>{type}</span><small>{type.includes("Stay") ? "Overnight experience" : type.includes("Outing") ? "Plan for your group" : "Tell us your vision"}</small></button>)}</div></div>}

          {step === 1 && <div className="booking-stage"><p className="eyebrow">02 · Dates & guests</p><h2>Shape the practical details.</h2><div className="booking-fields grid-two">
            <label><span>Check-in / visit date</span><input type="date" min={localDate()} value={form.checkIn} onChange={(e) => update("checkIn", e.target.value)} required /></label>
            <label><span>Check-out</span><input type="date" min={form.checkIn || localDate()} value={form.checkOut} onChange={(e) => update("checkOut", e.target.value)} required /></label>
            <label><span>Adults</span><input type="number" min="1" max="100" value={form.adults} onChange={(e) => update("adults", Number(e.target.value))} /></label>
            <label><span>Children (6–11)</span><input type="number" min="0" max="100" value={form.children} onChange={(e) => update("children", Number(e.target.value))} /></label>
            <label><span>Infants / under 6</span><input type="number" min="0" max="100" value={form.infants} onChange={(e) => update("infants", Number(e.target.value))} /></label>
            <label><span>Rooms required</span><input type="number" min="1" max="20" value={form.rooms} onChange={(e) => update("rooms", Number(e.target.value))} /></label>
          </div></div>}

          {step === 2 && <div className="booking-stage"><p className="eyebrow">03 · Live room availability</p><h2>Select an available stay.</h2><p className="booking-intro">Inventory shown below is calculated for {form.checkIn} to {form.checkOut}. Prices are starting rates and the resort confirms the final payable amount.</p><div className="room-choice-grid">{availability.map((room) => <button type="button" disabled={!room.is_available} className={`${form.roomId === room.room_id ? "selected" : ""} ${!room.is_available ? "unavailable" : ""}`} onClick={() => update("roomId", room.room_id)} key={room.room_id}>
            <span className="room-choice-image"><ResortPhoto src={roomImage(room)} alt={`${room.name} at DS Agro Tourism & Resort`} sizes="(max-width: 900px) 90vw, 30vw" /><small>{room.is_available ? `${room.available_units} unit${room.available_units === 1 ? "" : "s"} available` : "Unavailable for selected dates"}</small></span>
            <span className="room-choice-copy"><strong>{room.name}</strong><small>{room.bed_type || room.category} · up to {room.max_guests ?? "—"} guests</small><b>{money(room.base_price)} <i>/ weekday</i></b></span>
          </button>)}</div>{availability.length === 0 && <div className="empty-state">No active room inventory is available for these dates. Change the dates or contact the resort.</div>}</div>}

          {step === 3 && <div className="booking-stage"><p className="eyebrow">04 · Preferences</p><h2>Make the visit yours.</h2><div className="interest-grid">{interests.map((item) => <button type="button" className={form.interests.includes(item) ? "selected" : ""} onClick={() => toggleInterest(item)} key={item}><span>{form.interests.includes(item) ? "✓" : "+"}</span>{item}</button>)}</div><div className="booking-fields grid-two preference-fields"><label><span>Occasion</span><input value={form.occasion} onChange={(e) => update("occasion", e.target.value)} placeholder="Birthday, anniversary, team day…" maxLength={100} /></label><label><span>Special requests</span><textarea value={form.specialRequest} onChange={(e) => update("specialRequest", e.target.value)} placeholder="Food, accessibility or timing requests" maxLength={1000} /></label></div></div>}

          {step === 4 && <div className="booking-stage"><p className="eyebrow">05 · Your details</p><h2>Where should we reach you?</h2><div className="booking-fields grid-two"><label><span>Full name *</span><input value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" required /></label><label><span>Phone *</span><input value={form.phone} onChange={(e) => update("phone", e.target.value)} inputMode="tel" autoComplete="tel" required /></label><label><span>WhatsApp number</span><input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} inputMode="tel" placeholder="Same as phone if blank" /></label><label><span>Email</span><input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" /></label><label><span>City</span><input value={form.city} onChange={(e) => update("city", e.target.value)} autoComplete="address-level2" /></label></div><label className="consent"><input type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} /><span>I agree that this form creates an inquiry, not a confirmed booking. DS Agro Tourism & Resort may contact me about this request.</span></label></div>}

          {step === 5 && <div className="booking-stage"><p className="eyebrow">06 · Review</p><h2>One last look.</h2><div className="booking-review"><div>{summary.map(([label, value]) => <p key={label}><span>{label}</span><strong>{value}</strong></p>)}</div><aside><p>Estimated room subtotal</p><strong>{estimatedRoomTotal ? money(estimatedRoomTotal) : "Confirmed by resort"}</strong><small>Starting-rate estimate only. Meals, weekend tariff, extra guests, activities, taxes and packages can change the final amount.</small></aside></div><div className="inquiry-notice"><strong>Inquiry only</strong><p>Submitting does not reserve inventory or confirm your stay. The resort team will confirm availability, inclusions, amount and advance-payment terms directly.</p></div></div>}

          {error && <p className="booking-error" role="alert">{error}</p>}
          <div className="booking-navigation">{step > 0 && <button type="button" className="button button-outline" onClick={() => { setStep((current) => current - 1); setError(""); }}>Back</button>}{step < 5 ? <button type="button" className="button button-dark" onClick={next} disabled={loading}>{loading ? "Checking…" : "Continue"}<b>→</b></button> : <button type="submit" className="button button-gold" disabled={loading}>{loading ? "Submitting…" : "Submit inquiry"}<b>↗</b></button>}</div>
        </form>}
      </section>
    </main>
    <Footer />
  </>;
}
