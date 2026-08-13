"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { galleryCategoryLabel, galleryCategoryOptions, galleryRecordSelect, resolveGalleryImageUrl, type GalleryRecord } from "../lib/gallery";
import { appHref, getSupabaseClient } from "../lib/supabase";

type DashboardTab = "overview" | "bookings" | "inventory" | "gallery";

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

type GalleryDraft = {
  title: string;
  category: string;
  image_url: string;
  description: string;
  status: GalleryRecord["status"];
  featured: boolean;
  display_order: number;
};

const bookingStatuses = ["New Inquiry", "WhatsApp Contacted", "Pending", "Confirmed", "Checked In", "Checked Out", "Cancelled", "No Show"];
const paymentStatuses = ["Not Requested", "Pending", "Advance Paid", "Partially Paid", "Fully Paid", "Refunded"];
const blockReasons = ["Maintenance", "Owner Use", "Renovation", "Cleaning", "Private Event", "Operational Issue", "Manual Block"];
const galleryStatuses: GalleryRecord["status"][] = ["Published", "Hidden", "Archived"];
const dashboardTabs: DashboardTab[] = ["overview", "bookings", "inventory", "gallery"];
const emptyGalleryDraft: GalleryDraft = {
  title: "",
  category: galleryCategoryOptions[0]?.id ?? "resort-views",
  image_url: "",
  description: "",
  status: "Published",
  featured: false,
  display_order: 10,
};

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

function galleryStoragePath(imageUrl: string) {
  const marker = "/storage/v1/object/public/gallery/";
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex < 0) return null;
  return decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
}

function galleryFileExtension(file: File) {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "";
}

function sortGallery(items: GalleryRecord[]) {
  return [...items].sort((a, b) => a.display_order - b.display_order || a.created_at.localeCompare(b.created_at));
}

export function AdminDashboard() {
  const [ready, setReady] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blocks, setBlocks] = useState<RoomBlock[]>([]);
  const [gallery, setGallery] = useState<GalleryRecord[]>([]);
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
  const [galleryDraft, setGalleryDraft] = useState<GalleryDraft>({ ...emptyGalleryDraft });
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryFileKey, setGalleryFileKey] = useState(0);
  const [editingGalleryId, setEditingGalleryId] = useState("");
  const [savingGallery, setSavingGallery] = useState(false);
  const [deletingGalleryId, setDeletingGalleryId] = useState("");

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
    const [bookingResult, roomResult, blockResult, galleryResult] = await Promise.all([
      client.from("bookings").select("id,booking_reference,customer_name,phone,email,whatsapp_number,city,visit_type,check_in,check_out,adults,children,infants,total_guests,rooms_requested,room_name_snapshot,occasion,interests,special_request,estimated_amount,booking_status,payment_status,source,admin_notes,created_at").order("created_at", { ascending: false }).limit(100),
      client.from("rooms").select("id,name,total_units,status").order("name"),
      client.from("room_blocks").select("id,room_id,start_date,end_date,blocked_units,reason,notes,created_at").order("start_date", { ascending: true }),
      client.from("gallery").select(galleryRecordSelect).order("display_order", { ascending: true }),
    ]);
    const loadError = bookingResult.error || roomResult.error || blockResult.error || galleryResult.error;
    if (loadError) setError(loadError.message || "Dashboard could not be loaded.");
    setBookings((bookingResult.data ?? []) as Booking[]);
    setRooms((roomResult.data ?? []) as Room[]);
    setBlocks((blockResult.data ?? []) as RoomBlock[]);
    setGallery(sortGallery((galleryResult.data ?? []) as GalleryRecord[]));
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

  function resetGalleryEditor() {
    setGalleryDraft({ ...emptyGalleryDraft, display_order: (gallery.at(-1)?.display_order ?? 0) + 10 });
    setGalleryFile(null);
    setGalleryFileKey((current) => current + 1);
    setEditingGalleryId("");
  }

  function editGalleryItem(item: GalleryRecord) {
    setGalleryDraft({
      title: item.title,
      category: item.category,
      image_url: item.image_url,
      description: item.description ?? "",
      status: item.status,
      featured: item.featured,
      display_order: item.display_order,
    });
    setGalleryFile(null);
    setGalleryFileKey((current) => current + 1);
    setEditingGalleryId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveGalleryItem(event: FormEvent) {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client) return setError("Admin service is not configured.");

    const currentItem = gallery.find((item) => item.id === editingGalleryId);
    const title = galleryDraft.title.trim();
    let imageUrl = galleryDraft.image_url.trim();
    if (!title) return setError("Add a title for the gallery image.");
    if (!galleryFile && !imageUrl) return setError("Choose an image file or provide an HTTPS image URL.");
    if (!galleryFile && imageUrl !== currentItem?.image_url && !/^https:\/\//i.test(imageUrl)) {
      return setError("New image URLs must begin with https://. You can also upload a file directly.");
    }

    let uploadedPath = "";
    if (galleryFile) {
      const extension = galleryFileExtension(galleryFile);
      if (!extension) return setError("Use a JPG, PNG or WebP image.");
      if (galleryFile.size > 10 * 1024 * 1024) return setError("The image must be 10 MB or smaller.");
      uploadedPath = `uploads/${crypto.randomUUID()}.${extension}`;
      setSavingGallery(true);
      setError("");
      setNotice("");
      const { error: uploadError } = await client.storage.from("gallery").upload(uploadedPath, galleryFile, {
        cacheControl: "31536000",
        contentType: galleryFile.type,
        upsert: false,
      });
      if (uploadError) {
        setSavingGallery(false);
        return setError(uploadError.message || "Image upload failed.");
      }
      imageUrl = client.storage.from("gallery").getPublicUrl(uploadedPath).data.publicUrl;
    } else {
      setSavingGallery(true);
      setError("");
      setNotice("");
    }

    const payload = {
      title,
      category: galleryDraft.category,
      image_url: imageUrl,
      thumbnail_url: null,
      media_type: "image",
      description: galleryDraft.description.trim() || null,
      featured: galleryDraft.featured,
      display_order: Math.max(0, Math.round(galleryDraft.display_order || 0)),
      status: galleryDraft.status,
    };
    const result = editingGalleryId
      ? await client.from("gallery").update(payload).eq("id", editingGalleryId).select(galleryRecordSelect).single()
      : await client.from("gallery").insert(payload).select(galleryRecordSelect).single();

    if (result.error || !result.data) {
      if (uploadedPath) await client.storage.from("gallery").remove([uploadedPath]);
      setSavingGallery(false);
      return setError(result.error?.message || "Gallery update was not saved.");
    }

    const saved = result.data as GalleryRecord;
    setGallery((items) => sortGallery(editingGalleryId
      ? items.map((item) => item.id === saved.id ? saved : item)
      : [...items, saved]));

    const oldStoragePath = currentItem ? galleryStoragePath(currentItem.image_url) : null;
    const newStoragePath = galleryStoragePath(saved.image_url);
    let cleanupWarning = "";
    if (oldStoragePath && oldStoragePath !== newStoragePath) {
      const { error: cleanupError } = await client.storage.from("gallery").remove([oldStoragePath]);
      if (cleanupError) cleanupWarning = " The old stored file could not be removed automatically.";
    }
    setNotice(`${editingGalleryId ? "Gallery image updated" : "Gallery image added"} successfully.${cleanupWarning}`);
    setSavingGallery(false);
    resetGalleryEditor();
  }

  async function deleteGalleryItem(item: GalleryRecord) {
    if (!window.confirm(`Delete “${item.title}” from the website gallery?`)) return;
    const client = getSupabaseClient();
    if (!client) return;
    setDeletingGalleryId(item.id);
    setError("");
    setNotice("");
    const { data, error: deleteError } = await client.from("gallery").delete().eq("id", item.id).select("id").single();
    if (deleteError || !data) {
      setDeletingGalleryId("");
      return setError(deleteError?.message || "Gallery image could not be deleted.");
    }

    const storagePath = galleryStoragePath(item.image_url);
    const storageResult = storagePath ? await client.storage.from("gallery").remove([storagePath]) : null;
    setGallery((items) => items.filter((galleryItem) => galleryItem.id !== item.id));
    if (editingGalleryId === item.id) resetGalleryEditor();
    setNotice(`“${item.title}” deleted from the gallery.${storageResult?.error ? " The database entry was removed, but the stored file needs manual cleanup." : ""}`);
    setDeletingGalleryId("");
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
      : activeTab === "inventory"
        ? { eyebrow: "Room operations", title: "Inventory workspace" }
        : { eyebrow: "Website content", title: "Gallery workspace" };

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
      <header><div><p>{headerCopy.eyebrow}</p><h1>{headerCopy.title}</h1></div><div><button onClick={load} disabled={refreshing}>{refreshing ? "Refreshing…" : "Refresh data"}</button><a href={appHref(activeTab === "gallery" ? "/gallery/" : "/booking/")} target="_blank" rel="noreferrer">Open {activeTab === "gallery" ? "gallery" : "booking page"} ↗</a></div></header>
      <div className="admin-alert-stack" aria-live="polite">{error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status">{notice}</p>}</div>

      {activeTab === "overview" && <div id="overview" className="admin-tab-panel">
        <section className="admin-metrics"><article><span>New inquiries</span><strong>{metrics.inquiries}</strong><small>Awaiting first response</small></article><article><span>Today&apos;s arrivals</span><strong>{metrics.arrivals}</strong><small>Confirmed / checked in</small></article><article><span>Active bookings</span><strong>{metrics.active}</strong><small>Pending through checked in</small></article><article><span>Active room units</span><strong>{metrics.rooms}</strong><small>Live inventory total</small></article></section>
        <section className="admin-card admin-overview-actions"><div className="admin-section-head"><div><p>Quick actions</p><h2>Manage today&apos;s work</h2></div><span>Live Supabase data</span></div><div><a href="#bookings" onClick={() => setActiveTab("bookings")}><span>01</span><strong>Review booking inquiries</strong><small>Contact guests and update booking or payment status.</small></a><a href="#inventory" onClick={() => setActiveTab("inventory")}><span>02</span><strong>Check room availability</strong><small>Review dates, add manual blocks and protect room stock.</small></a><a href="#gallery" onClick={() => setActiveTab("gallery")}><span>03</span><strong>Update website gallery</strong><small>Add, edit, arrange, publish or remove gallery images.</small></a></div></section>
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

      {activeTab === "gallery" && <div id="gallery" className="admin-tab-panel">
        <section className="admin-card">
          <div className="admin-section-head"><div><p>Gallery editor</p><h2>{editingGalleryId ? "Edit gallery image" : "Add a gallery image"}</h2></div><span>JPG, PNG or WebP · maximum 10 MB</span></div>
          <div className="admin-gallery-editor">
            <form className="admin-gallery-form" onSubmit={saveGalleryItem}>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Image title</span><input value={galleryDraft.title} onChange={(event) => setGalleryDraft((draft) => ({ ...draft, title: event.target.value }))} maxLength={100} placeholder="e.g. Poolside evening" required /></label>
                <label className="admin-field"><span>Category</span><select value={galleryDraft.category} onChange={(event) => setGalleryDraft((draft) => ({ ...draft, category: event.target.value }))}>{galleryCategoryOptions.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}</select></label>
              </div>
              <label className="admin-field"><span>Description</span><textarea value={galleryDraft.description} onChange={(event) => setGalleryDraft((draft) => ({ ...draft, description: event.target.value }))} maxLength={300} placeholder="A short caption shown below the image" /></label>
              <div className="admin-form-grid">
                <label className="admin-field"><span>{editingGalleryId ? "Replace image (optional)" : "Upload image"}</span><input key={galleryFileKey} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setGalleryFile(event.target.files?.[0] ?? null)} /></label>
                <label className="admin-field"><span>HTTPS image URL (alternative)</span><input type="url" value={galleryDraft.image_url} onChange={(event) => setGalleryDraft((draft) => ({ ...draft, image_url: event.target.value }))} placeholder="https://…" /></label>
              </div>
              <div className="admin-gallery-settings">
                <label className="admin-field"><span>Visibility</span><select value={galleryDraft.status} onChange={(event) => setGalleryDraft((draft) => ({ ...draft, status: event.target.value as GalleryRecord["status"] }))}>{galleryStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
                <label className="admin-field"><span>Display order</span><input type="number" min={0} max={9999} value={galleryDraft.display_order} onChange={(event) => setGalleryDraft((draft) => ({ ...draft, display_order: Number(event.target.value) }))} required /></label>
                <label className="admin-gallery-check"><input type="checkbox" checked={galleryDraft.featured} onChange={(event) => setGalleryDraft((draft) => ({ ...draft, featured: event.target.checked }))} /><span>Mark as featured</span></label>
              </div>
              <p className="admin-gallery-help">Published images appear on the public Gallery page. Hidden and Archived items remain saved but are not shown to visitors. Lower display-order numbers appear first.</p>
              <div className="admin-gallery-form-actions"><button className="button button-dark" disabled={savingGallery}>{savingGallery ? "Saving gallery…" : editingGalleryId ? "Save gallery changes" : "Add to gallery"}<b>→</b></button>{editingGalleryId && <button type="button" onClick={resetGalleryEditor} disabled={savingGallery}>Cancel edit</button>}</div>
            </form>
            <aside className="admin-gallery-preview">
              <span>{editingGalleryId ? "Current preview" : "New image"}</span>
              {galleryDraft.image_url ? <div style={{ backgroundImage: `url("${resolveGalleryImageUrl(galleryDraft.image_url)}")` }} role="img" aria-label={galleryDraft.title || "Gallery image preview"} /> : <div className="empty"><b>{galleryFile ? galleryFile.name : "Choose an image"}</b><small>{galleryFile ? "The selected file will be uploaded when you save." : "A preview appears here for saved images and URLs."}</small></div>}
              <strong>{galleryDraft.title || "Image title"}</strong><small>{galleryCategoryLabel(galleryDraft.category)} · {galleryDraft.status}</small>
            </aside>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-section-head"><div><p>Website gallery</p><h2>Manage current images</h2></div><span>{gallery.filter((item) => item.status === "Published").length} published · {gallery.length} total</span></div>
          {gallery.length === 0 ? <div className="empty-state"><strong>No gallery images yet.</strong><p>Use the form above to add the first image.</p></div> : <div className="admin-gallery-grid">{gallery.map((item) => <article key={item.id} className={item.status !== "Published" ? "not-published" : ""}>
            <div className="admin-gallery-thumb" style={{ backgroundImage: `url("${resolveGalleryImageUrl(item.image_url)}")` }} role="img" aria-label={item.title} />
            <div className="admin-gallery-copy"><span>{item.status} · Order {item.display_order}</span><strong>{item.title}</strong><p>{galleryCategoryLabel(item.category)}</p><small>{item.description || "No description"}</small></div>
            <div className="admin-gallery-actions"><button type="button" onClick={() => editGalleryItem(item)}>Edit</button><button type="button" className="danger" disabled={deletingGalleryId === item.id} onClick={() => deleteGalleryItem(item)}>{deletingGalleryId === item.id ? "Deleting…" : "Delete"}</button></div>
          </article>)}</div>}
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
