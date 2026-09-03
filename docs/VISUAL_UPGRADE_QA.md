# Visual upgrade verification

The initial local production-browser sweep passed all 12 routes at 1920 × 1080, with no page errors, broken loaded images, off-screen main headings or horizontal overflow. Additional 1440-pixel checks passed Home, Rooms, Amenities, Activities, Day Outing and Dining. The 390 × 844 homepage showed the correctly selected, playing mobile film and legible booking/discovery controls.

The first-visit test identified a late-hydration overlay on a resource-constrained browser. This was fixed using server-rendered intro markup, a pre-hydration session gate and a CSS safety timeout. The final browser trace shows the intro present at 94 ms, leaving at 2694 ms and removed at 3120 ms. The real desktop video reached readyState 4, with no browser errors.

The final responsive sweep passed 84 route/viewport combinations: Home, Rooms, Amenities, Activities, Day Outing, Dining, Celebrations, Contact, Terms, Gallery, Booking and Admin Login at 1920 × 1080, 1440 × 900, 1024 × 768, 768 × 1024, 430 × 932, 390 × 844 and 360 × 800. No horizontal overflow, main-heading overflow, blank page or framework error overlay was detected; per-route browser error lists were empty. This is desktop Chromium responsive emulation, not a claim of physical iOS/Android device testing.

Production build, lint, TypeScript and all 22 automated tests pass. The media audit checks 41 distinct non-gallery marketing slots. All referenced photographs/responsive derivatives exist, and imported full-size files remain below 1 MiB.

Supabase project access is denied to the current connector. Live media import and authenticated admin media CRUD are **not verified or completed** in this upgrade. Local browser checks use actual public reads where available, not a simulated authenticated administrator.

No booking submission, payment, credential reset, database migration or production data mutation was performed.

## Interaction checks

- Public managed Gallery: 32 visible photos after the retired near-duplicate is filtered. Opening, next/previous arrows, keyboard navigation, synthetic touch swipe, Escape close and focus return passed with decoded images.
- Deluxe live room album opened correctly. Premium's six-photo default album opened correctly in an explicitly simulated public-read failure; the live Premium album remains empty until imported. Its verified default cover already resolves correctly from the live room record.
- Reduced motion and emulated Save-Data: no video source assigned; official poster loaded. Reduced-motion first-visit branding was visible immediately. The CSS safety animation explicitly overrides the site's global reduced-motion animation reset, so it also dismisses without application JavaScript.
- Video requests deliberately blocked: official poster remains visible, no permanently visible loader. Skip intro clears the overlay/restores scrolling; reload in the same session does not replay it. Mobile video plays after normal reload.
- Read-only availability for 4–5 September 2026 returned the existing available room types. Bungalow, Deluxe, Premium and Super Deluxe each showed its own correct thumbnail. Dormitory kept its unverified-photo placeholder. No reservation was submitted.

Feature deployment: [GitHub Actions run 33741475097](https://github.com/satitech-official/DS-Agro-website/actions/runs/33741475097), commit `58c4116`. A final reduced-motion safety hardening and this verification report follow in a separate commit. Live verification is reported with the final handoff.
