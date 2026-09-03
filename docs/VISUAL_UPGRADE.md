# Cinematic visual upgrade — 3 September 2026

This report supersedes the earlier photography release. The forest-green, warm-cream and gold design, route structure and business features are retained. This is an official-media and presentation update, not a redesign.

**Release boundary:** the website/assets and admin import controls can be deployed independently. The current Supabase connector does not have access to DS Agro project `ndlgcanimwpkuuqqotym`. No production database records were changed in this upgrade. The 57-image collection and Premium room album described below are the new **verified defaults**, not a claim that the live managed catalogs have already been imported. Custom covers, deliberately removed covers and empty managed albums remain authoritative.

## 1. First-visit loader

- A gold seed falls into a fine soil line, followed by a ripple, roots, growing stem, unfolding leaves, sunrise halo and DS brand reveal.
- A short organic wipe reveals the already-loading hero video. Skip intro remains available.
- Session storage prevents replay during ordinary navigation; restricted storage has an in-memory fallback.
- Server-rendered introduction and a tiny pre-hydration session check prevent a late overlay appearing on slow devices. A CSS safety deadline also removes the overlay if application JavaScript fails to start.
- Normal exit is approximately 3.0–3.4 seconds including transition, without waiting indefinitely for video. Reduced motion uses a short branded fade and an official still photograph.

## 2. Official hero film

Both source clips are genuine client-supplied DS Agro footage from the [official drone folder](https://drive.google.com/drive/folders/1dAh-ndATvF1zHm4TD7o6LhKWL_-JOCIs). No stock resort, generated property or Pexels video is used.

| Source | What it shows |
| --- | --- |
| [DJI_20260807131702_0080_D.MP4](https://drive.google.com/file/d/1RCwGDEc_xGIrT2VwUiceESYSoQayxhI8/view) | Slow aerial orbit/reveal of the actual property |
| [DJI_20260807131142_0073_D.MP4](https://drive.google.com/file/d/13kfHSzC44CNa9wgLktxAxh5mwaPL0vY-/view) | Glide across the actual swimming pool |

The 4K/60 fps sources are trimmed into a 12.4-second circular sequence with restrained 0.8-second dissolves, including the wrap back to the opening shot.

| Export | Dimensions | Format | Duration | Bytes |
| --- | --- | --- | --- | --- |
| `public/video/ds-agro-hero.mp4` | 1920 × 1080 | H.264 MP4, 30 fps, no audio | 12.4 s | 8,177,398 (~7.80 MiB) |
| `public/video/ds-agro-hero-mobile.mp4` | 720 × 720, centre crop | H.264 MP4, 30 fps, no audio | 12.4 s | 2,618,698 (~2.50 MiB) |

Only the appropriate encode is assigned at startup. Playback is muted, inline and looping, with metadata preload and fast-start MP4 headers. The film pauses offscreen, in background tabs and when the guest selects Pause film. Reduced-motion/Save-Data preferences disable video loading; a failed load or blocked autoplay leaves the official poster visible. No native player controls or perpetual spinner are shown.

Fallback/poster: `public/resort/resort-aerial-three.webp`. All URLs follow `NEXT_PUBLIC_BASE_PATH`, including GitHub Pages' `/DS-Agro-website/` prefix. Raw source videos remain outside the public build.

## 3. New Drive imports

23 new DSLR selections:

`DSC02961.JPG`, `DSC02963.JPG`, `DSC02965.JPG`, `DSC02968.JPG`, `DSC02969.JPG`, `DSC02970.JPG`, `DSC02972.JPG`, `DSC02994.JPG`, `DSC03006.JPG`, `DSC03009.JPG`, `DSC03015.JPG`, `DSC03017.JPG`, `DSC03025.JPG`, `DSC03028.JPG`, `DSC03033.JPG`, `DSC03037.JPG`, `DSC03040.JPG`, `DSC03077.JPG`, `DSC03081.JPG`, `DSC03088.JPG`, `DSC03090.JPG`, `DSC03094.JPG`, `DSC03096.JPG`.

Additional official sources:

- `IMG_4311.heic` — real ATV.
- `DJI_20260807123911_0050_D.MP4` — high-resolution Drive preview still of turf/pond.
- `DJI_20260807124241_0058_D.MP4` — palm canopy, frame at 1.000 seconds of the original 4K video.
- `DJI_20260807124208_0057_D.MP4` — garden arrival, frame at 1.000 seconds of the original 4K video.
- `DJI_20260807122807_0038_D.MP4` — green estate, frame at 1.000 seconds of the original 4K video.

The DSLR/photo downloads were high-resolution Drive derivatives, not unmodified full-size camera originals. The complete available room ranges were reviewed using contact sheets; DSC02938 was absent. The supplied brief resolves the earlier Premium/Super Deluxe label conflict, and the verified Premium set stays separate from the confirmed Super Deluxe range.

For every imported photo, the original filename, Drive ID, optimized path, dimensions, exact hash, assigned marketing slots, room album and Gallery categories are recorded in [MEDIA_MANIFEST.json](MEDIA_MANIFEST.json). Legacy assets whose original camera filename was not recorded are explicitly marked as such, not assigned invented provenance.

## 4–7. Room photography

| Category | Cover | Curated supporting album |
| --- | --- | --- |
| Premium | DSC02965 | DSC02961 bed detail; DSC02963 bathroom; DSC02968 seating/beds; DSC02969 room front; DSC02970 seating; DSC02972 storage |
| Bungalow / 2 BHK Villa | DSC02959 exterior | DSC02934 living wide; DSC02939 living overview; DSC02945 king bedroom; DSC02948 garden bedroom; DSC02951 kitchenette; DSC02952 lounge; DSC02956 veranda |
| Super Deluxe | DSC03001 | DSC02998 bathroom; DSC03004 wide room |
| Deluxe | DSC03041 | DSC03045, DSC03048, DSC03050, DSC03052, DSC03055, DSC03064, DSC03066, DSC03068, DSC03070, DSC03075 |

DSC03002 was removed from new Super Deluxe defaults because it closely repeats the cover angle. Its file is retained for recovery. The existing live room-album reference is not silently deleted; the administrator can remove that reference using the existing room media control.

Dedicated `accommodationMedia.premium`, `premium-room` cover/category mapping and the shared cover resolver now serve Rooms, Booking and admin previews. Existing room albums remain on the Rooms page, with anchors for each category; no unrelated new room routes were invented. Gallery and room albums share an accessible full-frame lightbox with captions, count, previous/next, arrow keys, Escape, swipe and focus return.

Dormitory photographs are still unverified. Those entries retain the honest pending-photo treatment instead of borrowing another room's image.

## 8. Repeated photographs corrected

| Previous repetition | New intentional allocation |
| --- | --- |
| `pool-lawn.webp` across Home, Amenities, Day Outing, Dining and Celebrations | Kept only in the Gallery archive. Home pool: DSC03006; Home gathering: DSC03088; Amenities hero: DSC03017; Day Outing pool: DSC03015; Dining hero: DSC03077; Celebrations story: DSC03028/DSC03096 |
| Bungalow lounge across Stay, Amenities and Terms | DSC02952 retained only for the Bungalow-related Stay story. Amenities: real gym/pool/pavilion. Terms: calm farm landscape, no decorative room story |
| Bungalow cover and Super Deluxe photos on Contact | Contact uses destination aerial, countryside, resort overview and a distinct garden-arrival video still |
| Similar Super Deluxe cover/alternate angle | Keep DSC03001 cover, DSC03004 wide and DSC02998 bathroom; retire DSC03002 from default/public Gallery presentation |
| Country/aerial photos recycled between many pages | Each of the 41 registered non-gallery marketing slots now has a distinct path, source identity and file hash |
| Private Bungalow imagery used to suggest shared dining | Replace with verified restaurant, dining table, terrace and service photographs |

`npm run check:media` fails the build on duplicate source IDs or identical file hashes across registered marketing slots. The full default Gallery also has no repeated image URL. Intentional exceptions: the complete Gallery/room archive, a room's matching Booking thumbnail/admin preview, the video fallback states and admin branding.

## 9. Context corrected

- Stay hero: DSC03040 accommodation exterior, not one room's card cover.
- Amenities: DSC03025 actual gym, DSC03009 pool deck, DSC02994 pavilion.
- Dining: DSC03077 restaurant; DSC03081 table detail; DSC03033 terrace; DSC03094 dining/service setting. No private Bungalow veranda is called a restaurant.
- Contact: destination/arrival imagery rather than bedrooms or bathrooms.
- Terms: nature-led hero and a clean policy body without unnecessary Bungalow photographs.
- Activities: distinct horse, turf and ATV views. Day Outing has its own activity/pool sequence.
- Home's eight marketing photographs differ from the other marketing allocations. The normal hero is official moving film.

## 10. Files changed

The exhaustive repository-relative file list, including every responsive WebP derivative, is in [VISUAL_UPGRADE_FILES.txt](VISUAL_UPGRADE_FILES.txt).

Main implementation areas: `data/site.ts`; source/dimensions manifests; Home, inner stories, room cards, Booking, Gallery and admin media components; `FirstVisitLoader`, `HeroVideo`, `PhotoLightbox`; `app/visual-upgrade.css`; build-time media audit/manifest utilities and tests. Rates, availability, booking records, auth, payment logic, database schema, RLS and credentials are not changed by this media upgrade.

## 11. Performance and image handling

- 28 additional photographs, each with full-size, 1200-edge and 640-edge WebP versions: 84 new image assets.
- Full-size photographs use up to a 2200-pixel longest edge, quality 84; smaller variants use quality 82, without upscaling. Every imported full-size file is below 1 MiB; the largest is the ATV photo at 988,892 bytes.
- The existing static-export-compatible `picture/srcset` architecture is retained. Native image sizes are recorded in `data/photo-dimensions.json`; noncritical photos are lazy loaded and containers reserve layout space.
- The homepage's former CSS photographic panels now use responsive image variants. The Gallery is not globally preloaded.
- No raw camera JPG/HEIC or large source MP4 is deployed. No runtime dependency on Drive image previews is introduced.
- Video has no audio track and no artificial decorative sun/leaf layer competing with the real scene. Motion is subtle, with reduced-motion support.

## 12. Verification and remaining production import

Production export, lint, TypeScript, 22 automated tests and the duplicate-media audit pass before release. Tests include correct source ranges/categories, custom cover precedence, deliberate removal, authoritative empty galleries, base-path handling, existing business content, protected admin entry points and bounded media sizes.

Actual browser verification and final deployment evidence are recorded in [VISUAL_UPGRADE_QA.md](VISUAL_UPGRADE_QA.md). Passing source-contract tests is not described as a complete authenticated admin test. No fake booking or payment is submitted during media QA.

### Required once DS Agro Supabase access is restored

Use the existing authorized admin account; do not reset passwords or share service-role keys.

1. After the website deployment succeeds, open Admin → Gallery → **Import official resort photos**. The new default archive has 57 photographs in ten verified categories: Resort/Aerial 5, Bungalow 8, Super Deluxe 3, Deluxe 11, Activities 7, Amenities 6, Premium 7, Dining 5, Celebrations 3, Nature 2. Missing verified assets are added; existing hidden/custom records are kept. Retired published local Gallery entries are archived, not deleted.
2. Admin → Inventory → Premium Room → Manage room photographs → **Use verified official cover** (explicitly confirms replacement), then **Import verified room album** (six supporting photos).
3. In Super Deluxe's existing room album, remove the DSC03002/`ds-agro-super-deluxe-room-angle.webp` reference if still present. The stored file is retained.
4. Verify public Rooms, Booking thumbnails, Premium Gallery filtering, and an authenticated upload/save/order/remove workflow.

An empty string in `cover_image` means the administrator deliberately removed the cover. It is not overwritten automatically. Null/known legacy defaults resolve to the new verified cover. A successful empty room-album or public-Gallery read is authoritative and is not silently repopulated by the frontend.

Until those imports are authorized, the deployed marketing pages/video can show the upgrade while the live managed Gallery and room albums still show their previously saved records. This limitation is intentional protection of administrator edits, not a completed database sync.
