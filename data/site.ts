export const contact = {
  whatsapp: "918149428126",
  displayWhatsapp: "+91 81494 28126",
  phones: ["8149428126", "8407911909", "7798911909", "7507911909"],
  instagram: "https://www.instagram.com/dsagrotourismresort_official",
  maps: "https://maps.app.goo.gl/4N9MusUsVUeHSG9E8",
};

export const nav = [
  ["Home", "/"], ["Stay", "/stay"], ["Day Outing", "/day-outing"],
  ["Experiences", "/experiences"], ["Dining", "/dining"],
  ["Celebrations", "/celebrations"], ["Gallery", "/gallery"], ["Contact", "/contact"],
] as const;

export const experiences = [
  { name: "Slow stays", eyebrow: "Stay", copy: "Wake to softer light, open skies and a day that asks nothing of you.", image: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1800&q=85" },
  { name: "Poolside afternoons", eyebrow: "Water", copy: "An easy afternoon shaped by sunlight, water and unhurried family time.", image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1800&q=85" },
  { name: "Farm life, elevated", eyebrow: "Nature", copy: "Step closer to the land and rediscover the pleasure of simple things.", image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1800&q=85" },
  { name: "Gather beneath open skies", eyebrow: "Celebrations", copy: "Bring your people together for occasions that deserve room to breathe.", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1800&q=85" },
] as const;

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
    title: "Stay close to nature.", kicker: "Accommodation", variant: "stay",
    intro: "A restful base for families, friends and groups. Exact room categories, occupancy and amenities are confirmed directly by the resort team.",
    image: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1800&q=85",
    visualTitle: "Rest. Reconnect. Repeat.",
    visuals: [
      { image: "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1200&q=82", label: "Unhurried mornings", copy: "A calm beginning with nature close by." },
      { image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=82", label: "Space to settle in", copy: "Comfort for the people you travel with." },
      { image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=82", label: "Slow evenings", copy: "Let the day end without a schedule." },
    ],
    sections: [
      { title: "A quieter rhythm", body: "Plan a restorative overnight escape with generous time for the pool, outdoor experiences and shared meals." },
      { title: "Details, confirmed personally", body: "Send your dates and group size on WhatsApp. The team will share current accommodation choices, inclusions and pricing without artificial availability claims." },
    ],
  },
  "day-outing": {
    title: "One day. A world away.", kicker: "Day outing", variant: "timeline",
    intro: "Build a day around food, water, nature and time together. Timings and inclusions are confirmed for your selected date.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1800&q=85",
    visualTitle: "A day that keeps unfolding.",
    visuals: [
      { image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=82", label: "01 · Arrive", copy: "Leave the city pace at the gate." },
      { image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=82", label: "02 · Play", copy: "Make room for water, movement and laughter." },
      { image: "https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=1200&q=82", label: "03 · Gather", copy: "Close the day together under open skies." },
    ],
    sections: [
      { title: "Shape your day", body: "Tell us your group size, preferred date and the experiences that matter most. We will help you plan the flow." },
      { title: "Made for groups", body: "Suitable for family circles, school and college groups, and corporate teams—subject to direct confirmation." },
    ],
  },
  experiences: {
    title: "Feel alive outdoors.", kicker: "Experiences", variant: "adventure",
    intro: "Pool time, horse riding, farm life and outdoor activities are part of the resort story. Availability, supervision and age guidance are confirmed before your visit.",
    image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1800&q=85",
    visualTitle: "Choose your kind of alive.",
    visuals: [
      { image: "https://images.unsplash.com/photo-1553284966-19b8815c7817?auto=format&fit=crop&w=1200&q=82", label: "Horse riding", copy: "A confident outdoor experience, subject to supervision." },
      { image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=82", label: "Explore outside", copy: "Follow curiosity through a greener world." },
      { image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=82", label: "Open landscapes", copy: "Slow down enough to notice the land." },
    ],
    sections: [
      { title: "Nature, at your pace", body: "Choose an energetic day or a slower escape. Every enquiry starts with the people you are bringing and the memories you want to make." },
      { title: "Safety comes first", body: "Activity access may vary by age, weather and supervision. Please confirm current operating guidance with the resort." },
    ],
  },
  dining: {
    title: "Gather around the table.", kicker: "Dining", variant: "dining",
    intro: "Traditional food and the warmth of eating together are central to the experience. Current meal formats and dietary requests are confirmed directly.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=85",
    visualTitle: "Made to be shared.",
    visuals: [
      { image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=82", label: "Fresh flavours", copy: "Food that feels generous, familiar and alive." },
      { image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=82", label: "Shared tables", copy: "The best meals bring everyone closer." },
      { image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=82", label: "Rooted in place", copy: "A story of ingredients, tradition and warmth." },
    ],
    sections: [
      { title: "Food with a sense of place", body: "Expect a dining story rooted in freshness, familiar flavours and generous hospitality." },
      { title: "Plan for your group", body: "Share dietary preferences and group requirements in your enquiry so the team can recommend suitable options." },
    ],
  },
  celebrations: {
    title: "Celebrate beneath open skies.", kicker: "Gatherings", variant: "celebration",
    intro: "From family milestones to group occasions, begin with a conversation. Event types, capacities, décor and food arrangements are confirmed to fit your plan.",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1800&q=85",
    visualTitle: "Every reason deserves a setting.",
    visuals: [
      { image: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=82", label: "Milestones", copy: "Create a moment that feels entirely your own." },
      { image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=82", label: "Open-air occasions", copy: "Let nature become part of the atmosphere." },
      { image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=82", label: "Togetherness", copy: "A gathering shaped around your people." },
    ],
    sections: [
      { title: "Your occasion, considered", body: "Tell us the event, date and expected guest count. We will help you understand the suitable spaces and possibilities." },
      { title: "Clear, direct planning", body: "No preset promises or invented packages—just a direct enquiry that gives the team what they need to respond well." },
    ],
  },
  gallery: {
    title: "A glimpse of the escape.", kicker: "Gallery", variant: "gallery",
    intro: "The imagery below is experience inspiration, not a representation of the property. Visit the official Instagram for current, property-specific photographs.",
    image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1800&q=85",
    visualTitle: "Move through the mood.",
    visuals: [
      { image: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=82", label: "Nature", copy: "Greenery and open-air calm." },
      { image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=82", label: "Stay", copy: "Quiet, considered comfort." },
      { image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=82", label: "Gatherings", copy: "Moments made to be remembered." },
    ],
    sections: [
      { title: "See the real place", body: "Our official Instagram is the best source for current guest moments, resort spaces and recent experiences." },
      { title: "Bring your own story", body: "Every gathering looks different. Start with your group, occasion and preferred date." },
    ],
  },
  contact: {
    title: "Your escape starts here.", kicker: "Contact", variant: "contact",
    intro: "Speak directly with the DS Agro Tourism & Resort team for current availability, inclusions, pricing and route guidance.",
    image: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1800&q=85",
    visualTitle: "One conversation away.",
    visuals: [
      { image: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1200&q=82", label: "Find your way", copy: "Use the verified Google Maps route." },
      { image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=82", label: "Plan the escape", copy: "Tell us your date and group size." },
      { image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=82", label: "Arrive lighter", copy: "Let the team guide the practical details." },
    ],
    sections: [
      { title: "WhatsApp", body: "+91 81494 28126 — the primary number for visit and booking enquiries." },
      { title: "Call the team", body: "81494 28126 · 84079 11909 · 77989 11909 · 75079 11909" },
    ],
  },
};
