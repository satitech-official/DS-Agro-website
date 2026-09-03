# Official photography update

> Historical report for the previous release. The new [visual-upgrade report](VISUAL_UPGRADE.md) supersedes the Premium ambiguity, static hero, 33-image default archive and absence of dining photography described below. Its live database import status is documented separately; do not treat old verification results as proof of the new release.

## Source and selection

Source: the client-provided [DS Agro Photos & Videos folder](https://drive.google.com/drive/folders/1bEb07Syc1IHbetRBCaDkFKujTsRPOX4j).

All 83 available photographs in the supplied ranges were inspected using contact sheets. DSC02938 was absent from the supplied Photos folder. The web imports are 2400-pixel JPEG derivatives obtained from Drive, not the original full-size DSLR downloads. No AI-generated resort photographs were used.

| Accommodation | Confirmed source range | Cover | Supporting photographs |
| --- | --- | --- | --- |
| Bungalow | DSC02934–DSC02959 | DSC02959 | DSC02934, DSC02939, DSC02945, DSC02948, DSC02951, DSC02952, DSC02956 |
| Super Deluxe | DSC02998–DSC03005 | DSC03001 | DSC02998, DSC03002, DSC03004 |
| Deluxe | DSC03040–DSC03076 | DSC03041 | DSC03045, DSC03048, DSC03050, DSC03052, DSC03055, DSC03064, DSC03066, DSC03068, DSC03070, DSC03075 |
| Premium | Unconfirmed | Not assigned | DSC02960–DSC02972 was supplied as both Premium and Super Deluxe. Folder labels and room appearance did not resolve that conflict. |
| Dormitory / Additional Dormitories | Unconfirmed | Not assigned | No verified bunk-bed photography was identified. |

The 23 imported accommodation photographs are traceable to original filenames and Drive IDs in `data/photo-sources.json`. Unconfirmed exports remain outside the public website. Premium/Dormitory show “Photo awaiting verification” until the owner supplies a correct image; a bungalow bedroom or shared resort facility is not presented as one of these rooms.

Super Deluxe has only three supporting photographs: the small source range contains near-duplicate frames, so the album is not padded with unrelated rooms.

## Website changes

- Removed the stock Pexels homepage video and stock Unsplash CSS backgrounds.
- Homepage hero now uses the existing official `resort-wide.webp` aerial photograph. Other homepage panels use verified Super Deluxe, countryside, turf, private bungalow veranda and pool/lawn images.
- Rooms has correctly mapped covers and expandable room albums, preserving the existing room counts, capacities, rates and enquiry flow.
- Booking uses the same cover resolver as Rooms. Existing database seed images are corrected; an administrator's custom HTTPS cover takes precedence. A deliberately cleared cover stays cleared.
- Gallery has six filters and 33 unique photographs: Resort & Aerial Views (5), Bungalow (7), Super Deluxe (3), Deluxe (10), Activities & Outdoors (6), Amenities & Shared Spaces (2). The gallery hero is separate.
- Gallery lightbox supports previous/next, arrow keys, Escape, full-image framing and focus return to the originating button.
- Private bungalow spaces are not labelled as a shared restaurant. Verified restaurant/food photography remains unavailable.
- Existing route structure, typography, palette and visual-story animations are retained. Room detail routes were not invented: albums live in the existing Rooms page.

## Storage and optimization

New accommodation assets are checked into `public/images/ds-agro/{bungalow,super-deluxe,deluxe}`. Existing official property/activity photographs remain in `public/resort`. No runtime Google Drive preview URLs or new storage vendor are used.

- WebP, longest edge up to 2200 pixels, quality 84; EXIF orientation normalized.
- 640/1200-edge variants, quality 82, never upscaled.
- 23 full-size accommodation exports plus 46 responsive variants total approximately 6.5 MB. Largest new full-size file is approximately 538 KB.
- Native responsive `picture/srcset` works with GitHub Pages static export. Actual pixel widths come from `data/photo-dimensions.json`.
- Galleries/cards are lazy loaded, with fixed image containers to avoid layout shifts. The above-the-fold hero uses eager loading/high fetch priority; the entire gallery is not preloaded.
- Original legacy files have not been deleted. Unused newly generated variants were moved into ignored local working storage.

## Admin usage

Open Admin → Inventory → a room → **Manage room photographs**.

- Preview the current cover; replace it by upload or HTTPS URL.
- Add room-album photographs with descriptions.
- Remove a cover or an album reference.
- Change **Display order** and select **Save order**; lower numbers appear first.
- **Import verified room album** adds the confirmed local collection without overwriting existing image records.

Open Admin → Gallery for the existing add/edit/visibility/category/order controls. Uploads now have an actual pre-save preview. **Import official resort photos** adds missing verified photographs and archives retired legacy local images. Hidden records and custom uploads are preserved.

Room albums and public Gallery are separate catalogs, matching the existing database architecture. New uploads use the existing `gallery` Storage bucket and existing admin-only policies. Replacing/removing a reference keeps the original stored file, preventing accidental deletion of an image shared by a room cover or gallery.

## Safe release and verification

The release followed asset-first deployment: website assets were published before changing database image paths. Only media fields in `rooms`, `room_images` and `gallery` were imported. The original full booking seed migration was not rerun, because it also updates business data.

The existing Supabase project was paused and was resumed on 3 September 2026. Its status returned to ACTIVE_HEALTHY. No plan upgrade, database reset, credential change or new project was involved.

Automated checks include production export, lint, TypeScript, source-range mapping, distinct covers, no duplicate gallery URLs, real image/variant file existence, custom-cover precedence, GitHub Pages prefix handling, preserved business content and protected admin source contracts. GitHub Actions now runs lint and exported-site tests before deployment.

### Verified on 3 September 2026

- GitHub Pages deployed commit `2e7ddf7` successfully: [deployment run](https://github.com/satitech-official/DS-Agro-website/actions/runs/33724456277).
- All 36 full-size URLs used by the three confirmed room covers and the 33-image public gallery returned HTTP 200 with `image/webp` content before database import.
- Production database now contains 33 Published gallery records and 20 room-album photographs (Bungalow 7, Super Deluxe 3, Deluxe 10). Seventeen retired legacy gallery records were Archived, not deleted. Original files remain recoverable.
- Three confirmed room covers were updated. The three unverified Premium/Dormitory cover references were cleared instead of presenting unrelated rooms. Conditional updates preserved any concurrently edited custom cover.
- Before/after database fingerprints matched for room business fields, bookings, customers and manual inventory blocks. Both existing bookings were preserved; no test booking was submitted.
- Public-role database checks returned exactly 33 gallery images and 20 room-album images, with zero Hidden/Archived rows visible. Existing admin-only media/storage write policies were inspected and left unchanged.
- Production mobile gallery filtering showed exactly 10 Deluxe photos. Lightbox image loading, next-image control, Escape close and focus return passed. Tablet room albums expanded with correct counts and photographs. No horizontal overflow or browser errors were observed in these checks.
- Live mobile availability and room selection were checked against the resumed Supabase service. Room prices and available counts remained intact. No booking submission or payment was made during QA.
- Production export, lint, TypeScript and 16 automated tests passed. The new tests also cover hidden/archived records, empty managed galleries, URL deduplication, uploaded-image preservation and consistent official imports.

### Remaining owner checks

The signed-out live Admin page redirects to the login screen as expected. No authenticated administrator session was available in the accessible browser (Chrome was unavailable), so actual admin upload/save/delete interactions have **not** been claimed as browser-tested. Sign in to the in-app Admin page to complete that final hands-on check; no password or account reset is necessary.

The booking journey is an inquiry flow, not an immediate paid reservation. There is no implemented Razorpay checkout in the inspected application; no payment transaction is claimed or tested.

Premium/Dormitory category confirmation is still required from the owner. Live login/upload testing requires an authenticated administrator session; database/read-only availability checks do not by themselves prove a complete authenticated browser workflow.
