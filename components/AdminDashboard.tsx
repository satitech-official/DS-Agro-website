"use client";

import { useEffect, useMemo, useState } from "react";
import { appHref, getSupabaseClient } from "../lib/supabase";

type Booking = {
  id: string; booking_reference: string; customer_name: string; phone: string; visit_type: string;
  check_in: string; check_out: string; total_guests: number; rooms_requested: number;
  room_name_snapshot: string | null; booking_status: string; payment_status: string; created_at: string;
};
type Room = { id: string; name: string; total_units: number; status: string };
const bookingStatuses = ["New Inquiry", "WhatsApp Contacted", "Pending", "Confirmed", "Checked In", "Checked Out", "Cancelled", "No Show"];

export function AdminDashboard() {
  const [ready, setReady] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const client = getSupabaseClient();
    if (!client) return setError("Admin service is not configured.");
    setRefreshing(true);
    const { data: userData } = await client.auth.getUser();
    if (!userData.user) return window.location.replace(appHref("/admin/login/"));
    const { data: admin } = await client.from("admins").select("display_name, role, active").eq("user_id", userData.user.id).maybeSingle();
    if (!admin?.active) {
      await client.auth.signOut();
      return window.location.replace(appHref("/admin/login/"));
    }
    setAdminName(admin.display_name || userData.user.email || "Admin");
    const [bookingResult, roomResult] = await Promise.all([
      client.from("bookings").select("id,booking_reference,customer_name,phone,visit_type,check_in,check_out,total_guests,rooms_requested,room_name_snapshot,booking_status,payment_status,created_at").order("created_at", { ascending: false }).limit(100),
      client.from("rooms").select("id,name,total_units,status").order("name"),
    ]);
    if (bookingResult.error || roomResult.error) setError(bookingResult.error?.message || roomResult.error?.message || "Dashboard could not be loaded.");
    setBookings((bookingResult.data ?? []) as Booking[]);
    setRooms((roomResult.data ?? []) as Room[]);
    setReady(true);
    setRefreshing(false);
  }

  useEffect(() => { queueMicrotask(load); }, []);

  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      inquiries: bookings.filter((booking) => booking.booking_status === "New Inquiry").length,
      arrivals: bookings.filter((booking) => booking.check_in === today && ["Confirmed", "Checked In"].includes(booking.booking_status)).length,
      active: bookings.filter((booking) => ["Pending", "Confirmed", "Checked In"].includes(booking.booking_status)).length,
      rooms: rooms.filter((room) => room.status === "Active").reduce((total, room) => total + room.total_units, 0),
    };
  }, [bookings, rooms]);

  async function updateStatus(id: string, status: string) {
    const client = getSupabaseClient();
    if (!client) return;
    setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, booking_status: status } : booking));
    const { error: updateError } = await client.from("bookings").update({ booking_status: status }).eq("id", id);
    if (updateError) { setError(updateError.message); await load(); }
  }

  async function signOut() {
    await getSupabaseClient()?.auth.signOut();
    window.location.replace(appHref("/admin/login/"));
  }

  if (!ready) return <main className="admin-loading"><span>DS</span><p>{error || "Loading secure dashboard…"}</p></main>;

  return <main className="admin-dashboard">
    <aside className="admin-sidebar"><a className="admin-brand" href={appHref("/")}><span>DS</span><strong>Agro Tourism<small>& Resort</small></strong></a><nav><a className="active" href="#overview">Overview</a><a href="#bookings">Bookings</a><a href="#inventory">Inventory</a></nav><button onClick={signOut}>Sign out</button></aside>
    <section className="admin-content"><header><div><p>Resort management</p><h1>Good day, {adminName}.</h1></div><div><button onClick={load} disabled={refreshing}>{refreshing ? "Refreshing…" : "Refresh data"}</button><a href={appHref("/booking/")} target="_blank">Open booking page ↗</a></div></header>{error && <p className="admin-error" role="alert">{error}</p>}
      <section id="overview" className="admin-metrics"><article><span>New inquiries</span><strong>{metrics.inquiries}</strong><small>Awaiting first response</small></article><article><span>Today&apos;s arrivals</span><strong>{metrics.arrivals}</strong><small>Confirmed / checked in</small></article><article><span>Active bookings</span><strong>{metrics.active}</strong><small>Pending through checked in</small></article><article><span>Active room units</span><strong>{metrics.rooms}</strong><small>Live inventory total</small></article></section>
      <section id="bookings" className="admin-card"><div className="admin-section-head"><div><p>Booking inquiries</p><h2>Latest requests</h2></div><span>{bookings.length} records loaded</span></div>{bookings.length === 0 ? <div className="empty-state"><strong>No booking inquiries yet.</strong><p>New website submissions will appear here automatically.</p></div> : <div className="admin-table-wrap"><table><thead><tr><th>Reference / Guest</th><th>Visit</th><th>Stay</th><th>Guests</th><th>Status</th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id}><td><strong>{booking.booking_reference}</strong><small>{booking.customer_name} · {booking.phone}</small></td><td>{booking.visit_type}<small>{booking.room_name_snapshot || "Room pending"}</small></td><td>{booking.check_in}<small>to {booking.check_out}</small></td><td>{booking.total_guests}<small>{booking.rooms_requested} room(s)</small></td><td><select value={booking.booking_status} onChange={(event) => updateStatus(booking.id, event.target.value)}>{bookingStatuses.map((status) => <option key={status}>{status}</option>)}</select><small>{booking.payment_status}</small></td></tr>)}</tbody></table></div>}</section>
      <section id="inventory" className="admin-card"><div className="admin-section-head"><div><p>Room inventory</p><h2>Current configuration</h2></div><span>Availability subtracts confirmed bookings and manual blocks</span></div><div className="admin-inventory">{rooms.map((room) => <article key={room.id}><span>{room.status}</span><strong>{room.name}</strong><p>{room.total_units} unit{room.total_units === 1 ? "" : "s"}</p></article>)}</div></section>
    </section>
  </main>;
}
