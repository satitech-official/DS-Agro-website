"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { appHref, getSupabaseClient } from "../lib/supabase";

type DashboardTab = "overview" | "bookings" | "inventory";

type Booking = {
  id: string;
  booking_reference: string;
  customer_name: string;
  phone: string;
  email: string | null;
  whatsapp_number: string | null;
  city: string | null;
  visit_type: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  infants: number;
  total_guests: number;
  rooms_requested: number;
  room_name_snapshot: string | null;
  occasion: string | null;
  interests: string[];
  special_request: string | null;
  estimated_amount: number | string | null;
  booking_status: string;
  payment_status: string;
  source: string;
  admin_notes: string | null;
  created_at: string;
};

type Room = {
  id: string;
  name: string;
  total_units: number;
  status: string;
};

type RoomBlock = {
  id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  blocked_units: number;
  reason: string;
  notes: string | null;
  created_at: string;
};

type Availability = {
  room_id: string;
  name: string;
  total_units: number;
  available_units: number;
  is_available: boolean;
};

const bookingStatuses = ["New Inquiry", "WhatsApp Contacted", "Pending", "Confirmed", "Checked In", "Checked Out", "Cancelled", "No Show"];
const paymentStatuses = ["Not Requested", "Pending", "Advance Paid", "Partially Paid", "Fully Paid", "Refunded"];
const blockReasons = ["Maintenance", "Owner Use", "Renovation", "Cleaning", "Private Event", "Operational Issue", "Manual Block"];
const dashboardTabs: DashboardTab[] = ["overview", "bookings", "inventory"];

function dashboardTabFromHash(): DashboardTab {
  const requested = window.location.hash.replace(/^#/, "") as DashboardTab;
  return dashboardTabs.includes(requested) ? requested : "overview";
}

function localDate(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function whatsappNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

function whatsappHref(booking: Booking) {
  const phone = whatsappNumber(booking.whatsapp_number || booking.phone);
  const message = `Hello ${booking.customer_name}, this is DS Agro Tourism & Resort regarding inquiry ${booking.booking_reference} for ${booking.check_in} to ${booking.check_out}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function money(value: number | string | null) {
  if (value === null || value === "") return "Not estimated";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
}

export function AdminDashboard() {
  const [ready, setReady] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blocks, setBlocks] = useState<RoomBlock[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [savingBookingId, setSavingBookingId] = useState("");
  const [expandedBookingId, setExpandedBookingId] = useState("");
  const [minimumDate, setMinimumDate] = useState("");
  const [availabilityStart, setAvailabilityStart] = useState("");
  const [availabilityEnd, setAvailabilityEnd] = useState("");
  const [roomsRequested, setRoomsRequested] = useState(1);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [blockRoomId, setBlockRoomId] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockedUnits, setBlockedUnits] = useState(1);
  const [blockReason, setBlockReason] = useState("Manual Block");
  const [blockNotes, setBlockNotes] = useState("");
  const [savingBlock, setSavingBlock] = useState(false);
  const [deletingBlockId, setDeletingBlockId] = useState("");

  async function load() {
    const client = getSupabaseClient();
    if (!client) return setError("Admin service is not configured.");
    setRefreshing(true);
    setError("");
    const { data: userData } = await client.auth.getUser();
    if (!userData.user) return window.location.replace(appHref("/admin/login/"));
    const { data: admin } = await client.from("admins").select("display_name, role, active").eq("user_id", userData.user.id).maybeSingle();
    if (!admin?.active) {
      await client.auth.signOut();
      return window.location.replace(appHref("/admin/login/"));
    }
    setAdminName(admin.display_name || userData.user.email || "Admin");
    const [bookingResult, roomResult, blockResult] = await Promise.all([
      client.from("bookings").select("id,booking_reference,customer_name,phone,email,whatsapp_number,city,visit_type,check_in,check_out,adults,children,infants,total_guests,rooms_requested,room_name_snapshot,occasion,interests,special_request,estimated_amount,booking_status,payment_status,source,admin_notes,created_at").order("created_at", { ascending: false }).limit(100),
      client.from("rooms").select("id,name,total_units,status").order("name"),
      client.from("room_blocks").select("id,room_id,start_date,end_date,blocked_units,reason,notes,created_at").order("start_date", { ascending: true }),
    ]);
    const loadError = bookingResult.error || roomResult.error || blockResult.error;
    if (loadError) setError(loadError.message || "Dashboard could not be loaded.");
    setBookings((bookingResult.data ?? []) as Booking[]);
    setRooms((roomResult.data ?? []) as Room[]);
    setBlocks((blockResult.data ?? []) as RoomBlock[]);
    const firstActiveRoom = (roomResult.data ?? []).find((room) => room.status === "Active");
    setBlockRoomId((current) => current || firstActiveRoom?.id || "");
    setReady(true);
    setRefreshing(false);
  }

  useEffect(() => {
    const start = localDate(1);
    const end = localDate(2);
    queueMicrotask(() => {
      setMinimumDate(localDate(0));
      setAvailabilityStart(start);
      setAvailabilityEnd(end);
      setBlockStart(start);
      setBlockEnd(end);
    });
  }, []);

  useEffect(() => {
    const syncTab = () => setActiveTab(dashboardTabFromHash());
    queueMicrotask(syncTab);
    window.addEventListener("hashchange", syncTab);
    return () => window.removeEventListener("hashchange", syncTab);
  }, []);

  useEffect(() => { queueMicrotask(load); }, []);

  const metrics = useMemo(() => {
    const today = localDate(0);
    return {
      inquiries: bookings.filter((booking) => booking.booking_status === "New Inquiry").length,
      arrivals: bookings.filter((booking) => booking.check_in === today && ["Confirmed", "Checked In"].includes(booking.booking_status)).length,
      active: bookings.filter((booking) => ["Pending", "Confirmed", "Checked In"].includes(booking.booking_status)).length,
      rooms: rooms.filter((room) => room.status === "Active").reduce((total, room) => total + room.total_units, 0),
    };
  }, [bookings, rooms]);

  const activeRooms = useMemo(() => rooms.filter((room) => room.status === "Active"), [rooms]);

  async function updateBookingField(booking: Booking, field: "booking_status" | "payment_status", value: string) {
    const client = getSupabaseClient();
    if (!client) return;
    setSavingBookingId(booking.id);
    setError("");
    setNotice("");
    const { data, error: updateError } = await client.from("bookings")
      .update({ [field]: value })
      .eq("id", booking.id)
      .select("id,booking_status,payment_status")
      .single();
    if (updateError || !data) {
      setError(updateError?.message || "Booking update was not saved.");
      setSavingBookingId("");
      return;
    }
    setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, booking_status: data.booking_status, payment_status: data.payment_status } : item));
    setNotice(`${booking.booking_reference} ${field === "booking_status" ? "booking" : "payment"} status saved as ${value}.`);
    setSavingBookingId("");
  }

  async function checkAvailability(event?: FormEvent) {
    event?.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;
    if (!availabilityStart || !availabilityEnd || availabilityEnd <= availabilityStart) {
      return setError("Choose a valid date range; the end date must be after the start date.");
    }
    setCheckingAvailability(true);
    setError("");
    const { data, error: availabilityError } = await client.rpc("get_room_availability", {
      p_check_in: availabilityStart,
      p_check_out: availabilityEnd,
      p_rooms_requested: roomsRequested,
    });
    if (availabilityError) {
      setError(availabilityError.message);
      setAvailability([]);
    } else {
      setAvailability((data ?? []) as Availability[]);
    }
    setCheckingAvailability(false);
  }

  async function addRoomBlock(event: FormEvent) {
    event.preventDefault();
    const client = getSupabaseClient();
    const selectedRoom = rooms.find((room) => room.id === blockRoomId);
    if (!client || !selectedRoom) return setError("Select an active room first.");
    if (!blockStart || !blockEnd || blockEnd <= blockStart) return setError("Block end date must be after the start date.");
    if (blockedUnits < 1 || blockedUnits > selectedRoom.total_units) return setError(`Blocked units must be between 1 and ${selectedRoom.total_units}.`);
    setSavingBlock(true);
    setError("");
    setNotice("");
    const { data, error: blockError } = await client.from("room_blocks").insert({
      room_id: blockRoomId,
      start_date: blockStart,
      end_date: blockEnd,
      blocked_units: blockedUnits,
      reason: blockReason,
      notes: blockNotes.trim() || null,
    }).select("id,room_id,start_date,end_date,blocked_units,reason,notes,created_at").single();
    if (blockError || !data) {
      setError(blockError?.message || "Room block was not saved.");
      setSavingBlock(false);
      return;
    }
    setBlocks((current) => [...current, data as RoomBlock].sort((a, b) => a.start_date.localeCompare(b.start_date)));
    setBlockNotes("");
    setNotice(`${selectedRoom.name} blocked successfully for ${blockStart} to ${blockEnd}.`);
    setSavingBlock(false);
    if (availabilityStart && availabilityEnd) await checkAvailability();
  }

  async function removeRoomBlock(block: RoomBlock) {
    const room = rooms.find((item) => item.id === block.room_id);
    if (!window.confirm(`Remove the ${room?.name || "room"} block for ${block.start_date} to ${block.end_date}?`)) return;
    const client = getSupabaseClient();
    if (!client) return;
    setDeletingBlockId(block.id);
    setError("");
    setNotice("");
    const { data, error: deleteError } = await client.from("room_blocks").delete().eq("id", block.id).select("id").single();
    if (deleteError || !data) {
      setError(deleteError?.message || "Room block could not be removed.");
      setDeletingBlockId("");
      return;
    }
    setBlocks((current) => current.filter((item) => item.id !== block.id));
    setNotice(`${room?.name || "Room"} block removed.`);
    setDeletingBlockId("");
    if (availabilityStart && availabilityEnd) await checkAvailability();
  }

  async function signOut() {
    await getSupabaseClient()?.auth.signOut();
    window.location.replace(appHref("/admin/login/"));
  }

  if (!ready) return <main className="admin-loading"><span>DS</span><p>{error || "Loading secure dashboard…"}</p></main>;

  const headerCopy = activeTab === "overview"
    ? { eyebrow: "Resort management", title: `Good day, ${adminName}.` }
    : activeTab === "bookings"
      ? { eyebrow: "Guest operations", title: "Booking workspace" }
      : { eyebrow: "Room operations", title: "Inventory workspace" };

  return <main className="admin-dashboard">
    <aside className="admin-sidebar">
      <a className="admin-brand" href={appHref("/")}><span>DS</span><strong>Agro Tourism<small>& Resort</small></strong></a>
      <nav aria-label="Admin sections">
        {dashboardTabs.map((tab) => <a key={tab} className={activeTab === tab ? "active" : ""} href={`#${tab}`} aria-current={activeTab === tab ? "page" : undefined} onClick={() => setActiveTab(tab)}>{tab[0].toUpperCase() + tab.slice(1)}</a>)}
      </nav>
      <button onClick={signOut}>Sign out</button>
    </aside>
    <section className="admin-content">
      <nav className="admin-mobile-tabs" aria-label="Admin sections">
        {dashboardTabs.map((tab) => <a key={tab} className={activeTab === tab ? "active" : ""} href={`#${tab}`} aria-current={activeTab === tab ? "page" : undefined} onClick={() => setActiveTab(tab)}>{tab[0].toUpperCase() + tab.slice(1)}</a>)}
      </nav>
      <header><div><p>{headerCopy.eyebrow}</p><h1>{headerCopy.title}</h1></div><div><button onClick={load} disabled={refreshing}>{refreshing ? "Refreshing…" : "Refresh data"}</button><a href={appHref("/booking/")} target="_blank" rel="noreferrer">Open booking page ↗</a></div></header>
      <div className="admin-alert-stack" aria-live="polite">{error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status">{notice}</p>}</div>

      {activeTab === "overview" && <div id="overview" className="admin-tab-panel">
        <section className="admin-metrics"><article><span>New inquiries</span><strong>{metrics.inquiries}</strong><small>Awaiting first response</small></article><article><span>Today&apos;s arrivals</span><strong>{metrics.arrivals}</strong><small>Confirmed / checked in</small></article><article><span>Active bookings</span><strong>{metrics.active}</strong><small>Pending through checked in</small></article><article><span>Active room units</span><strong>{metrics.rooms}</strong><small>Live inventory total</small></article></section>
        <section className="admin-card admin-overview-actions"><div className="admin-section-head"><div><p>Quick actions</p><h2>Manage today&apos;s work</h2></div><span>Live Supabase data</span></div><div><a href="#bookings" onClick={() => setActiveTab("bookings")}><span>01</span><strong>Review booking inquiries</strong><small>Contact guests and update booking or payment status.</small></a><a href="#inventory" onClick={() => setActiveTab("inventory")}><span>02</span><strong>Check room availability</strong><small>Review dates, add manual blocks and protect room stock.</small></a></div></section>
      </div>}

      {activeTab === "bookings" && <section id="bookings" className="admin-card admin-tab-panel">
        <div className="admin-section-head"><div><p>Booking inquiries</p><h2>Latest requests</h2></div><span>{bookings.length} records loaded</span></div>
        {bookings.length === 0 ? <div className="empty-state"><strong>No booking inquiries yet.</strong><p>New website submissions will appear here automatically.</p></div> : <div className="admin-table-wrap"><table><thead><tr><th>Reference / Guest</th><th>Visit</th><th>Stay</th><th>Guests</th><th>Status</th><th>Actions</th></tr></thead><tbody>{bookings.map((booking) => {
          const expanded = expandedBookingId === booking.id;
          return <BookingRows key={booking.id} booking={booking} expanded={expanded} saving={savingBookingId === booking.id} onToggle={() => setExpandedBookingId(expanded ? "" : booking.id)} onStatus={(value) => updateBookingField(booking, "booking_status", value)} onPayment={(value) => updateBookingField(booking, "payment_status", value)} />;
        })}</tbody></table></div>}
      </section>}

      {activeTab === "inventory" && <div id="inventory" className="admin-tab-panel">
        <section className="admin-card">
          <div className="admin-section-head"><div><p>Date-wise availability</p><h2>Check live room stock</h2></div><span>Pending, confirmed and checked-in bookings are deducted</span></div>
          <form className="admin-inventory-toolbar" onSubmit={checkAvailability}>
            <label className="admin-field"><span>From / check-in</span><input type="date" min={minimumDate} value={availabilityStart} onChange={(event) => setAvailabilityStart(event.target.value)} required /></label>
            <label className="admin-field"><span>To / check-out</span><input type="date" min={availabilityStart || minimumDate} value={availabilityEnd} onChange={(event) => setAvailabilityEnd(event.target.value)} required /></label>
            <label className="admin-field"><span>Rooms required</span><input type="number" min={1} max={20} value={roomsRequested} onChange={(event) => setRoomsRequested(Number(event.target.value))} required /></label>
            <button className="button button-dark" disabled={checkingAvailability}>{checkingAvailability ? "Checking…" : "Check availability"}<b>→</b></button>
          </form>
          {availability.length > 0 ? <div className="admin-availability-grid">{availability.map((room) => <article key={room.room_id} className={room.is_available ? "available" : "unavailable"}><span>{room.is_available ? "Available" : "Not available"}</span><strong>{room.name}</strong><p><b>{room.available_units}</b> of {room.total_units} units free</p></article>)}</div> : <p className="admin-inventory-hint">Choose dates and select <strong>Check availability</strong> to see live stock.</p>}
        </section>

        <section className="admin-card">
          <div className="admin-section-head"><div><p>Room configuration</p><h2>Current room units</h2></div><span>{metrics.rooms} active units</span></div>
          <div className="admin-inventory">{rooms.map((room) => <article key={room.id}><span>{room.status}</span><strong>{room.name}</strong><p>{room.total_units} unit{room.total_units === 1 ? "" : "s"}</p></article>)}</div>
        </section>

        <section className="admin-card">
          <div className="admin-section-head"><div><p>Manual inventory control</p><h2>Block room dates</h2></div><span>Maintenance, private use or operational holds</span></div>
          <div className="admin-block-layout">
            <form className="admin-block-form" onSubmit={addRoomBlock}>
              <label className="admin-field"><span>Room</span><select value={blockRoomId} onChange={(event) => { setBlockRoomId(event.target.value); setBlockedUnits(1); }} required><option value="" disabled>Select room</option>{activeRooms.map((room) => <option key={room.id} value={room.id}>{room.name} ({room.total_units})</option>)}</select></label>
              <div className="admin-form-grid"><label className="admin-field"><span>Block from</span><input type="date" min={minimumDate} value={blockStart} onChange={(event) => setBlockStart(event.target.value)} required /></label><label className="admin-field"><span>Block until</span><input type="date" min={blockStart || minimumDate} value={blockEnd} onChange={(event) => setBlockEnd(event.target.value)} required /></label></div>
              <div className="admin-form-grid"><label className="admin-field"><span>Units</span><input type="number" min={1} max={rooms.find((room) => room.id === blockRoomId)?.total_units || 1} value={blockedUnits} onChange={(event) => setBlockedUnits(Number(event.target.value))} required /></label><label className="admin-field"><span>Reason</span><select value={blockReason} onChange={(event) => setBlockReason(event.target.value)}>{blockReasons.map((reason) => <option key={reason}>{reason}</option>)}</select></label></div>
              <label className="admin-field"><span>Notes (optional)</span><textarea value={blockNotes} onChange={(event) => setBlockNotes(event.target.value)} placeholder="Add an internal note" maxLength={500} /></label>
              <button className="button button-dark" disabled={savingBlock}>{savingBlock ? "Saving block…" : "Block selected dates"}<b>→</b></button>
            </form>
            <div className="admin-block-list"><h3>Current manual blocks</h3>{blocks.length === 0 ? <div className="empty-state"><strong>No manual blocks.</strong><p>All active room stock is currently controlled only by booking status.</p></div> : blocks.map((block) => { const room = rooms.find((item) => item.id === block.room_id); return <article key={block.id}><div><span>{block.reason}</span><strong>{room?.name || "Room"}</strong><p>{block.start_date} → {block.end_date} · {block.blocked_units} unit{block.blocked_units === 1 ? "" : "s"}</p>{block.notes && <small>{block.notes}</small>}</div><button onClick={() => removeRoomBlock(block)} disabled={deletingBlockId === block.id}>{deletingBlockId === block.id ? "Removing…" : "Remove"}</button></article>; })}</div>
          </div>
        </section>
      </div>}
    </section>
  </main>;
}

function BookingRows({ booking, expanded, saving, onToggle, onStatus, onPayment }: { booking: Booking; expanded: boolean; saving: boolean; onToggle: () => void; onStatus: (value: string) => void; onPayment: (value: string) => void }) {
  return <>
    <tr><td><strong>{booking.booking_reference}</strong><small>{booking.customer_name} · {booking.phone}</small></td><td>{booking.visit_type}<small>{booking.room_name_snapshot || "Room pending"}</small></td><td>{booking.check_in}<small>to {booking.check_out}</small></td><td>{booking.total_guests}<small>{booking.rooms_requested} room(s)</small></td><td><select aria-label={`Booking status for ${booking.booking_reference}`} value={booking.booking_status} disabled={saving} onChange={(event) => onStatus(event.target.value)}>{bookingStatuses.map((status) => <option key={status}>{status}</option>)}</select><small>{saving ? "Saving…" : booking.payment_status}</small></td><td><div className="admin-row-actions"><button type="button" onClick={onToggle} aria-expanded={expanded}>{expanded ? "Hide details" : "View details"}</button><a href={whatsappHref(booking)} target="_blank" rel="noreferrer">WhatsApp ↗</a></div></td></tr>
    {expanded && <tr className="admin-booking-details-row"><td colSpan={6}><div className="admin-booking-details">
      <div className="admin-detail-grid">
        <article><span>Contact</span><strong>{booking.customer_name}</strong><a href={`tel:${booking.phone}`}>{booking.phone}</a>{booking.email && <a href={`mailto:${booking.email}`}>{booking.email}</a>}<small>{booking.city || "City not supplied"}</small></article>
        <article><span>Guest breakdown</span><strong>{booking.total_guests} guests</strong><p>{booking.adults} adults · {booking.children} children · {booking.infants} infants</p><small>{booking.rooms_requested} room(s) requested</small></article>
        <article><span>Inquiry context</span><strong>{booking.occasion || "General stay"}</strong><p>{booking.interests?.length ? booking.interests.join(", ") : "No activities selected"}</p><small>Source: {booking.source}</small></article>
        <article><span>Estimate</span><strong>{money(booking.estimated_amount)}</strong><p>{booking.special_request || "No special request"}</p><small>{booking.admin_notes || "No admin notes"}</small></article>
      </div>
      <div className="admin-detail-controls"><label className="admin-field"><span>Payment status</span><select value={booking.payment_status} disabled={saving} onChange={(event) => onPayment(event.target.value)}>{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><a className="button button-dark" href={whatsappHref(booking)} target="_blank" rel="noreferrer">Open WhatsApp<b>↗</b></a></div>
    </div></td></tr>}
  </>;
}
