const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function resortImage(name: string) {
  return `${basePath}/resort/${name}`;
}

function officialStayImage(category: string, name: string) {
  return `${basePath}/images/ds-agro/${category}/${name}`;
}

export const accommodationMedia = {
  bungalow: {
    cover: officialStayImage("bungalow", "ds-agro-bungalow-exterior.webp"),
    gallery: [
      officialStayImage("bungalow", "ds-agro-bungalow-living-wide.webp"),
      officialStayImage("bungalow", "ds-agro-bungalow-living-overview.webp"),
      officialStayImage("bungalow", "ds-agro-bungalow-king-bedroom.webp"),
      officialStayImage("bungalow", "ds-agro-bungalow-garden-bedroom.webp"),
      officialStayImage("bungalow", "ds-agro-bungalow-kitchenette.webp"),
      officialStayImage("bungalow", "ds-agro-bungalow-lounge.webp"),
      officialStayImage("bungalow", "ds-agro-bungalow-veranda.webp"),
    ],
  },
  superDeluxe: {
    cover: officialStayImage("super-deluxe", "ds-agro-super-deluxe-room-cover.webp"),
    gallery: [
      officialStayImage("super-deluxe", "ds-agro-super-deluxe-bathroom.webp"),
      officialStayImage("super-deluxe", "ds-agro-super-deluxe-room-angle.webp"),
      officialStayImage("super-deluxe", "ds-agro-super-deluxe-room-wide.webp"),
    ],
  },
  deluxe: {
    cover: officialStayImage("deluxe", "ds-agro-deluxe-room-cover.webp"),
    gallery: [
      officialStayImage("deluxe", "ds-agro-deluxe-king-room-angle.webp"),
      officialStayImage("deluxe", "ds-agro-deluxe-king-room-front.webp"),
      officialStayImage("deluxe", "ds-agro-deluxe-room-storage.webp"),
      officialStayImage("deluxe", "ds-agro-deluxe-twin-room-angle.webp"),
      officialStayImage("deluxe", "ds-agro-deluxe-twin-room-wide.webp"),
      officialStayImage("deluxe", "ds-agro-deluxe-room-window.webp"),
      officialStayImage("deluxe", "ds-agro-deluxe-room-complete.webp"),
      officialStayImage("deluxe", "ds-agro-deluxe-twin-room-entry.webp"),
      officialStayImage("deluxe", "ds-agro-deluxe-twin-room-storage.webp"),
      officialStayImage("deluxe", "ds-agro-deluxe-twin-room-window.webp"),
    ],
  },
} as const;

export const roomCoverBySlug: Record<string, string> = {
  "deluxe-room": accommodationMedia.deluxe.cover,
  "super-deluxe-room": accommodationMedia.superDeluxe.cover,
  "2-bhk-villa": accommodationMedia.bungalow.cover,
};

export const roomCategoryBySlug: Record<string, string> = {
  "deluxe-room": "deluxe", "super-deluxe-room": "super-deluxe", "2-bhk-villa": "bungalow",
};

const legacyRoomCovers = new Set([
  "deluxe-room.webp", "room-white.webp", "premium-room.webp",
  "dormitory.webp", "dormitory-wide.webp", "villa-exterior.webp",
]);

export function resolveMediaUrl(value: string) {
  if (/^(https?:|blob:)/i.test(value)) return value;
  const path = "/" + value.replace(/^\/+/, "");
  return basePath && (path === basePath || path.startsWith(basePath + "/")) ? path : basePath + path;
}

// Replace only known seed photos. An administrator's custom cover always wins.
// An empty string deliberately clears a cover; null means no cover configured yet.
export function resolveRoomCover(slug: string, current?: string | null): string | null {
  if (current === "") return null;
  if (current) {
    const path = current.replace(basePath + "/resort/", "/resort/");
    const legacy = path.match(/^\/?resort\/([^/]+)$/);
    if (!legacy || !legacyRoomCovers.has(legacy[1])) return resolveMediaUrl(current);
  }
  return roomCoverBySlug[slug] ?? null;
}

export const resortImages = {
  aerial: resortImage("aerial.webp"),
  resortWide: resortImage("resort-wide.webp"),
  poolLawn: resortImage("pool-lawn.webp"),
  turf: resortImage("turf-aerial.webp"),
  horseArena: resortImage("horse-arena-aerial.webp"),
  deluxe: accommodationMedia.deluxe.cover,
  villa: accommodationMedia.bungalow.cover,
  villaLiving: accommodationMedia.bungalow.gallery[0],
  veranda: resortImage("dining-area.webp"),
  bathroom: accommodationMedia.superDeluxe.gallery[0],
  lounge: accommodationMedia.bungalow.gallery[5],
  horseRiding: resortImage("horse-riding.webp"),
  roomWhite: accommodationMedia.superDeluxe.cover,
  roomWhiteAlt: accommodationMedia.superDeluxe.gallery[1],
  suiteLiving: accommodationMedia.bungalow.gallery[1],
  villaGarden: accommodationMedia.bungalow.gallery[6],
  deluxeComplete: accommodationMedia.deluxe.gallery[6],
  horseTrack: resortImage("horse-track.webp"),
  horseAction: resortImage("horse-action.webp"),
  horsePortrait: resortImage("horse-portrait.webp"),
  countryAerial: resortImage("country-aerial.webp"),
  estateAerial: resortImage("estate-aerial.webp"),
  farmFields: resortImage("farm-fields.webp"),
  turfClose: resortImage("turf-close.webp"),
  turfTop: resortImage("turf-top.webp"),
  resortAerialTwo: resortImage("resort-aerial-two.webp"),
  resortAerialThree: resortImage("resort-aerial-three.webp"),
} as const;

export const contact = {
  whatsapp: "918149428126",
  displayWhatsapp: "+91 81494 28126",
  phones: ["8149428126", "8407911909", "7798911909", "7507911909"],
  instagram: "https://www.instagram.com/dsagrotourismresort_official",
  maps: "https://maps.app.goo.gl/4N9MusUsVUeHSG9E8",
};

export const nav = [
  ["Home", "/"], ["Book", "/booking"], ["Rooms", "/stay"], ["Amenities", "/amenities"],
  ["Activities", "/experiences"], ["Day Outing", "/day-outing"],
  ["T&C", "/terms"], ["Gallery", "/gallery"], ["Contact", "/contact"],
] as const;

export const roomInventory = [
  { slug: "deluxe-room", name: "Deluxe Room", count: "6 rooms", detail: "Up to 2 guests per room" },
  { slug: "super-deluxe-room", name: "Super Deluxe Room", count: "2 rooms", detail: "Up to 2 guests per room" },
  { slug: "premium-room", name: "Premium Room", count: "2 rooms", detail: "King-size bed · Up to 4 guests per rate card" },
  { slug: "dormitory", name: "Dormitory", count: "2 bunk beds", detail: "Current dormitory setup" },
  { slug: "additional-dormitories", name: "Additional Dormitories", count: "2 units", detail: "Expected to be ready within 1 month" },
  { slug: "2-bhk-villa", name: "2 BHK Villa / DS Bungalow", count: "1 villa", detail: "Up to 10 guests per rate card" },
] as const;

export const stayRates = [
  { room: "Deluxe Room", occupancy: "2 pax", cpWeekday: "₹2,999", cpWeekend: "₹3,499", mapWeekday: "₹4,499", mapWeekend: "₹5,499" },
  { room: "Super Deluxe Room", occupancy: "2 pax", cpWeekday: "₹3,999", cpWeekend: "₹4,499", mapWeekday: "₹5,499", mapWeekend: "₹6,499" },
  { room: "Premium Room", occupancy: "4 pax", cpWeekday: "₹5,999", cpWeekend: "₹6,999", mapWeekday: "₹9,599", mapWeekend: "₹10,599" },
  { room: "2 BHK Villa / DS Bungalow", occupancy: "10 pax", cpWeekday: "₹11,999", cpWeekend: "₹12,999", mapWeekday: "₹20,499", mapWeekend: "₹21,499" },
  { room: "Dormitory", occupancy: "Package", cpWeekday: "₹7,200", cpWeekend: "₹8,000", mapWeekday: "₹11,199", mapWeekend: "₹11,999" },
] as const;

export const amenities = [
  "Swimming pool with attached deck", "Gym", "Kids play area",
  "Air-conditioned rooms", "Ample parking", "Restaurant",
] as const;

export const activities = [
  "Boating", "Swimming", "Indoor games", "Rain dance",
  "Turf", "ATV ride", "Tyre climbing", "Horse riding",
] as const;

export const dayOutingRates = [
  { days: "Monday - Friday", veg: "₹850", nonVeg: "₹1,050" },
  { days: "Saturday - Sunday", veg: "₹950", nonVeg: "₹1,150" },
] as const;

export const dayOutingIncludes = ["Rain dance", "Swimming pool", "Trampoline", "Activities"] as const;

export const terms = [
  "Check-in: 2:00 PM.",
  "Check-out: 11:00 AM.",
  "Dormitory package is without breakfast.",
  "Weekend (Saturday and Sunday) room bookings are subject to an additional ₹1,000 charge.",
  "Extra bed: ₹1,000 per bed.",
  "Turf: ₹1,000 per hour.",
  "Children aged 12 years and above will be charged full price.",
  "Children aged 6-11 years will be charged 50% of the package price.",
  "Villa Combo Offer includes breakfast, hi-tea, lunch or dinner, activities and amenities.",
  "Extra person charges apply as per resort policy.",
  "Festival and New Year bookings are non-changeable and non-refundable.",
  "Cancellation 30 days before check-in is 100% refundable.",
  "Cancellation 15 days before check-in is 50% refundable.",
  "Cancellation within 7 days of check-in is non-refundable.",
  "100% advance payment is required for guaranteed booking confirmation.",
  "Taxes are applicable as per prevailing rules.",
  "Visa, Mastercard and RuPay cards are accepted.",
  "Pets are not allowed.",
  "Management reserves the right to revise tariffs and package inclusions without prior notice.",
] as const;

export const experiences = [
  { name: "Comfortable stays", eyebrow: "Rooms", copy: "Choose from rooms, dormitory accommodation and a 2 BHK villa for your group.", image: resortImages.roomWhite },
  { name: "Poolside afternoons", eyebrow: "Amenities", copy: "Slow down by the swimming pool and attached deck with your family and friends.", image: resortImages.poolLawn },
  { name: "Outdoor adventures", eyebrow: "Activities", copy: "Horse riding, boating, rain dance, turf games and more bring the outdoors alive.", image: resortImages.horseTrack },
  { name: "Group escapes", eyebrow: "Day outing", copy: "Plan a complete day with food, swimming, rain dance, trampoline and activities.", image: resortImages.resortWide },
] as const;

export type GalleryCategory = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  images: { image: string; label: string; copy: string }[];
};

export const galleryCategories: GalleryCategory[] = [
  {
    id: "resort-views",
    title: "Resort & Aerial Views",
    eyebrow: "The setting",
    description: "See the complete property, surrounding farms, lawns and countryside from different aerial perspectives.",
    images: [

      { image: resortImages.aerial, label: "Across the fields", copy: "A wide countryside view around DS Agro Tourism & Resort." },
      { image: resortImages.countryAerial, label: "Country approach", copy: "The resort and its road connection through the fields." },
      { image: resortImages.farmFields, label: "Farm landscape", copy: "A top-down view of the agricultural setting." },
      { image: resortImages.resortAerialTwo, label: "Resort from above", copy: "The complete property framed by green fields." },
      { image: resortImages.resortAerialThree, label: "A wider perspective", copy: "Another distinct aerial angle across the resort grounds." },
    ],
  },
  {
    id: "bungalow",
    title: "Bungalow",
    eyebrow: "Private stay",
    description: "Step inside the real DS Bungalow, from its bedrooms and shared living area to the private veranda.",
    images: [
      { image: accommodationMedia.bungalow.gallery[0], label: "Bungalow living room", copy: "A wide view of the bungalow's generous shared living space." },
      { image: accommodationMedia.bungalow.gallery[1], label: "Living area overview", copy: "Seating and open floor space for families and groups." },
      { image: accommodationMedia.bungalow.gallery[2], label: "Bungalow king bedroom", copy: "A bright private bedroom inside the DS Bungalow." },
      { image: accommodationMedia.bungalow.gallery[3], label: "Garden-facing bedroom", copy: "A second bungalow bedroom overlooking resort greenery." },
      { image: accommodationMedia.bungalow.gallery[4], label: "Bungalow kitchenette", copy: "A compact preparation area within the bungalow." },
      { image: accommodationMedia.bungalow.gallery[5], label: "Bungalow lounge", copy: "Comfortable seating for time together indoors." },
      { image: accommodationMedia.bungalow.gallery[6], label: "Private veranda", copy: "An outdoor sitting area beside the bungalow." },
    ],
  },
  {
    id: "super-deluxe",
    title: "Super Deluxe",
    eyebrow: "Upgraded room",
    description: "Explore the private Super Deluxe room, its bedroom views and attached bathroom.",
    images: [
      { image: accommodationMedia.superDeluxe.gallery[1], label: "Super Deluxe room angle", copy: "A clear angled view of the bed and writing desk." },
      { image: accommodationMedia.superDeluxe.gallery[2], label: "Super Deluxe room", copy: "A second wide view of the verified Super Deluxe accommodation." },
      { image: accommodationMedia.superDeluxe.gallery[0], label: "Super Deluxe bathroom", copy: "The attached bathroom serving the Super Deluxe room." },
    ],
  },
  {
    id: "deluxe",
    title: "Deluxe Rooms",
    eyebrow: "Six rooms",
    description: "Explore distinct king and twin-bed layouts across the Deluxe room collection.",
    images: [
      { image: accommodationMedia.deluxe.gallery[0], label: "Deluxe king room", copy: "A bright king-bed room with a garden-facing window." },
      { image: accommodationMedia.deluxe.gallery[1], label: "Deluxe king bed", copy: "A centered view of the king-bed headboard and bedside tables." },
      { image: accommodationMedia.deluxe.gallery[2], label: "Deluxe room storage", copy: "Wardrobe, desk and room circulation shown together." },
      { image: accommodationMedia.deluxe.gallery[3], label: "Deluxe twin room", copy: "A twin-bed configuration photographed from the entrance." },
      { image: accommodationMedia.deluxe.gallery[4], label: "Deluxe twin room wide view", copy: "A complete view of one of the twin-bed Deluxe rooms." },
      { image: accommodationMedia.deluxe.gallery[5], label: "Deluxe room by the window", copy: "Natural light across a second Deluxe room interior." },
      { image: accommodationMedia.deluxe.gallery[6], label: "Deluxe room complete view", copy: "Bed, television, desk and entrance visible in one frame." },
      { image: accommodationMedia.deluxe.gallery[7], label: "Deluxe twin room entry", copy: "A twin-bed room with storage and entrance in view." },
      { image: accommodationMedia.deluxe.gallery[8], label: "Deluxe twin room storage", copy: "Twin beds paired with wardrobe and dressing storage." },
      { image: accommodationMedia.deluxe.gallery[9], label: "Deluxe twin room window", copy: "A second twin-bed layout beside the garden-facing window." },
    ],
  },
  {
    id: "activities-outdoors",
    title: "Activities & Outdoors",
    eyebrow: "Things to do",
    description: "Move through horse-riding moments, the dedicated arena and different views of the resort turf.",
    images: [
      { image: resortImages.horseRiding, label: "Horse riding", copy: "A real riding moment at the resort." },
      { image: resortImages.horseArena, label: "Horse arena", copy: "The complete riding arena from above." },

      { image: resortImages.horseAction, label: "Training moment", copy: "A supervised activity moment inside the arena." },
      { image: resortImages.horsePortrait, label: "Meet the horse", copy: "A closer look at the resort's horse-riding experience." },
      { image: resortImages.turfClose, label: "Turf and play zone", copy: "The sports turf surrounded by resort greenery." },
      { image: resortImages.turfTop, label: "Turf from above", copy: "A clear top-down view of the full play area." },
    ],
  },
  {
    id: "amenities-spaces",
    title: "Amenities & Shared Spaces",
    eyebrow: "Around the resort",
    description: "Browse the pool, lawns and sports facilities around the property.",
    images: [
      { image: resortImages.poolLawn, label: "Pool and lawn", copy: "Open green space next to the pool and stay areas." },
      { image: resortImages.turf, label: "Outdoor facilities", copy: "The turf and activity zone within the resort." },


    ],
  },
];

export type Page = {
  title: string;
  kicker: string;
  intro: string;
  image: string;
  variant: "stay" | "timeline" | "adventure" | "dining" | "celebration" | "gallery" | "contact";
  visualTitle: string;
  visuals: { image: string; label: string; copy: string }[];
  sections: { title: string; body: string }[];
};

export const pages: Record<string, Page> = {
  stay: {
    title: "Stay close to nature.", kicker: "Rooms", variant: "stay",
    intro: "Six Deluxe rooms, two Super Deluxe rooms, two Premium rooms, dormitory accommodation and a 2 BHK villa give couples, families and groups room to settle in.",
    image: accommodationMedia.bungalow.gallery[3],
    visualTitle: "Rest. Reconnect. Repeat.",
    visuals: [
      { image: accommodationMedia.deluxe.gallery[6], label: "Deluxe Room", copy: "A spacious room for up to two guests." },
      { image: accommodationMedia.bungalow.gallery[5], label: "2 BHK Villa / DS Bungalow", copy: "A private two-bedroom bungalow for families and groups." },
      { image: resortImages.roomWhiteAlt, label: "Super Deluxe Room", copy: "An upgraded private room for couples and small families." },
    ],
    sections: [
      { title: "A room for every escape", body: "Choose from Deluxe, Super Deluxe and Premium rooms, a dormitory setup and the 2 BHK Villa / DS Bungalow." },
      { title: "Confirm before you travel", body: "Send your dates and group size on WhatsApp to confirm current availability, applicable inclusions and the final payable tariff." },
    ],
  },
  amenities: {
    title: "Comfort comes naturally.", kicker: "Amenities", variant: "adventure",
    intro: "From the swimming pool and gym to family-friendly spaces, dining and parking, the essentials for an easy getaway are close at hand.",
    image: resortImages.poolLawn,
    visualTitle: "Everything within reach.",
    visuals: [
      { image: resortImages.lounge, label: "Indoor comfort", copy: "Air-conditioned spaces for easy conversation and downtime." },
      { image: resortImages.bathroom, label: "Attached facilities", copy: "Clean facilities within the accommodation." },
      { image: resortImages.villaGarden, label: "Bungalow veranda", copy: "A private outdoor seating space alongside the bungalow." },
    ],
    sections: [
      { title: "For every kind of day", body: "Swim, work out, dine, play or simply take your time in the resort's open spaces." },
      { title: "Plan with confidence", body: "Please confirm maintenance schedules and access to individual amenities for your selected date." },
    ],
  },
  "day-outing": {
    title: "One day. A world away.", kicker: "Day Outing", variant: "timeline",
    intro: "Choose a weekday or weekend outing with veg or non-veg meals, plus rain dance, swimming pool, trampoline and activities.",
    image: resortImages.resortAerialThree,
    visualTitle: "A day that keeps unfolding.",
    visuals: [
      { image: resortImages.countryAerial, label: "01 · Arrive", copy: "Leave the city pace at the gate." },
      { image: resortImages.turf, label: "02 · Play", copy: "Make room for movement, activities and laughter." },
      { image: resortImages.poolLawn, label: "03 · Gather", copy: "Close the day together beside the pool and open lawn." },
    ],
    sections: [
      { title: "Made for groups", body: "Day outings are suited to families, friends, schools, colleges and corporate teams, subject to direct confirmation." },
      { title: "Share your plan", body: "Send the preferred date, group size and meal choice on WhatsApp so the team can confirm the final arrangement." },
    ],
  },
  experiences: {
    title: "Feel alive outdoors.", kicker: "Activities", variant: "adventure",
    intro: "Boating, swimming, indoor games, rain dance, turf, ATV ride, tyre climbing and horse riding bring energy to every visit.",
    image: resortImages.horseArena,
    visualTitle: "Choose your kind of alive.",
    visuals: [
      { image: resortImages.horseRiding, label: "Horse riding", copy: "A guided outdoor experience, subject to supervision." },
      { image: resortImages.turfClose, label: "Turf games", copy: "Bring friendly competition into the day." },
      { image: resortImages.horseAction, label: "Outdoor activity", copy: "A supervised moment inside the riding arena." },
    ],
    sections: [
      { title: "Nature, at your pace", body: "Choose an energetic day or a slower escape and shape the outing around the people you are bringing." },
      { title: "Safety comes first", body: "Activity access may vary by age, weather, maintenance and supervision. Confirm operating guidance before your visit." },
    ],
  },
  terms: {
    title: "Clear plans. Easy stays.", kicker: "Terms & Conditions", variant: "contact",
    intro: "Review the current timings, charges, child policy, cancellation terms and booking conditions before confirming your visit.",
    image: resortImages.lounge,
    visualTitle: "Know before you go.",
    visuals: [
      { image: resortImages.bathroom, label: "Plan ahead", copy: "Confirm room details, dates and guest count." },
      { image: resortImages.deluxeComplete, label: "Check the stay", copy: "Review room policies and applicable charges." },
      { image: resortImages.resortAerialThree, label: "Arrive ready", copy: "Keep the latest confirmation with your group." },
    ],
    sections: [
      { title: "Tariffs may change", body: "Management may revise rates and package inclusions without prior notice. The resort team's written confirmation is final for your booking." },
      { title: "Questions are welcome", body: "If any condition is unclear, contact the resort before making the advance payment." },
    ],
  },
  dining: {
    title: "Gather around the table.", kicker: "Dining", variant: "dining",
    intro: "Traditional food and the warmth of eating together are central to the experience. Current meal formats and dietary requests are confirmed directly.",
    image: resortImages.countryAerial,
    visualTitle: "Made to be shared.",
    visuals: [
      { image: resortImages.poolLawn, label: "Time outdoors", copy: "Unwind beside the pool and garden before or after a meal." },
      { image: resortImages.veranda, label: "Bungalow veranda", copy: "A private sitting area beside the bungalow, not the resort restaurant." },
      { image: resortImages.villaLiving, label: "Bungalow living room", copy: "A shared lounge within the private bungalow." },
    ],
    sections: [
      { title: "Food with a sense of place", body: "Expect a dining story rooted in freshness, familiar flavours and generous hospitality." },
      { title: "Plan for your group", body: "Share veg, non-veg and dietary preferences in your enquiry so the team can recommend suitable options." },
    ],
  },
  celebrations: {
    title: "Celebrate beneath open skies.", kicker: "Gatherings", variant: "celebration",
    intro: "From family milestones to group occasions, begin with a conversation about your date, guest count, food and space requirements.",
    image: resortImages.resortAerialTwo,
    visualTitle: "Every reason deserves a setting.",
    visuals: [
      { image: resortImages.poolLawn, label: "Open-air occasions", copy: "Let nature become part of the atmosphere." },
      { image: resortImages.villaLiving, label: "Bungalow lounge", copy: "Time together inside the private bungalow." },
      { image: resortImages.resortWide, label: "Resort setting", copy: "A green property with space for shared memories." },
    ],
    sections: [
      { title: "Your occasion, considered", body: "Tell us the event, date and expected guest count to understand the suitable spaces and possibilities." },
      { title: "Clear, direct planning", body: "Food, décor, activities and other arrangements are confirmed directly for your event." },
    ],
  },
  gallery: {
    title: "A glimpse of the escape.", kicker: "Gallery", variant: "gallery",
    intro: "Explore real photographs supplied by DS Agro Tourism & Resort, from comfortable rooms and group stays to outdoor experiences and the surrounding landscape.",
    image: resortImages.estateAerial,
    visualTitle: "See the real place.",
    visuals: [],
    sections: [
      { title: "Property photographs", body: "The featured photographs were supplied for DS Agro Tourism & Resort's website update." },
      { title: "See more", body: "Visit the official Instagram account for recent guest moments, resort updates and new photographs." },
    ],
  },
  contact: {
    title: "Your escape starts here.", kicker: "Contact", variant: "contact",
    intro: "Speak directly with the DS Agro Tourism & Resort team for availability, inclusions, pricing and route guidance.",
    image: resortImages.villa,
    visualTitle: "One conversation away.",
    visuals: [
      { image: resortImages.farmFields, label: "Find your way", copy: "Use the verified Google Maps route." },
      { image: resortImages.roomWhite, label: "Plan the stay", copy: "Tell us your date and group size." },
      { image: resortImages.roomWhiteAlt, label: "Arrive ready", copy: "Let the team guide the practical details." },
    ],
    sections: [
      { title: "WhatsApp", body: "+91 81494 28126 - the primary number for visit and booking enquiries." },
      { title: "Call the team", body: "81494 28126 · 84079 11909 · 77989 11909 · 75079 11909" },
    ],
  },
};

function assertUniqueImages(label: string, images: readonly string[]) {
  if (new Set(images).size !== images.length) {
    throw new Error(`Duplicate resort image detected in ${label}.`);
  }
}

Object.entries(pages).forEach(([slug, page]) => {
  assertUniqueImages(`${slug} page`, [page.image, ...page.visuals.map((visual) => visual.image)]);
});

assertUniqueImages("homepage experience selector", experiences.map((experience) => experience.image));

const categorizedGalleryImages = galleryCategories.flatMap((category) => category.images.map((photo) => photo.image));
assertUniqueImages("categorized gallery", [pages.gallery.image, ...categorizedGalleryImages]);
