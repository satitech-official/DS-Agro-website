"use client";

import { useEffect, useState } from "react";
import { galleryCategories, resolveMediaUrl, resolveRoomCover, roomCategoryBySlug, roomInventory } from "../data/site";
import { getSupabaseClient } from "../lib/supabase";
import { ResortPhoto } from "./ResortPhoto";

type LiveRoom = { id: string; slug: string; cover_image: string | null; room_images: { image_url: string; alt_text: string; display_order: number }[] };

export function StayRoomCards() {
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;
    let active = true;
    Promise.resolve(client.from("rooms").select("id,slug,cover_image,room_images(image_url,alt_text,display_order)"))
      .then(({ data, error }) => { if (active && !error) setLiveRooms((data ?? []) as LiveRoom[]); })
      .catch(() => { /* Keep the verified local photos; never invent availability. */ });
    return () => { active = false; };
  }, []);
  return <div className="room-inventory" id="room-details-title">
    {roomInventory.map((room, index) => {
      const live = liveRooms.find(item => item.slug === room.slug);
      const category = galleryCategories.find(item => item.id === roomCategoryBySlug[room.slug]);
      // A successful read is authoritative, including an intentionally empty album.
      const album = live ? [...live.room_images].sort((a, b) => a.display_order - b.display_order).map(item => ({ image: item.image_url, label: item.alt_text })) : category?.images ?? [];
      return <article className="detail-card" key={room.slug}>
        <div className="stay-room-photo"><ResortPhoto src={resolveRoomCover(room.slug, live?.cover_image)} alt={`${room.name} at DS Agro Tourism & Resort`} sizes="(max-width: 900px) 88vw, 28vw" /></div>
        <span>0{index + 1}</span><h3>{room.name}</h3><strong>{room.count}</strong><p>{room.detail}</p>
        {album.length > 0 && <details className="room-album"><summary>View room photographs ({album.length})</summary><div>{album.map(photo => <figure key={photo.image}><div className="room-album-photo"><ResortPhoto src={resolveMediaUrl(photo.image)} alt={photo.label} contain /></div><figcaption>{photo.label}</figcaption></figure>)}</div></details>}
      </article>;
    })}
  </div>;
}
