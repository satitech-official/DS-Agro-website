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

type Page = { title: string; kicker: string; intro: string; image: string; sections: { title: string; body: string }[] };
export const pages: Record<string, Page> = {
  stay: { title: "Stay close to nature.", kicker: "Accommodation", intro: "A restful base for families, friends and groups. Exact room categories, occupancy and amenities are confirmed directly by the resort team.", image: experiences[0].image, sections: [
    { title: "A quieter rhythm", body: "Plan a restorative overnight escape with generous time for the pool, outdoor experiences and shared meals." },
    { title: "Details, confirmed personally", body: "Send your dates and group size on WhatsApp. The team will share current accommodation choices, inclusions and pricing without artificial availability claims." },
  ]},
  "day-outing": { title: "One day. A world away.", kicker: "Day outing", intro: "Build a day around food, water, nature and time together. Timings and inclusions are confirmed for your selected date.", image: experiences[1].image, sections: [
    { title: "Shape your day", body: "Tell us your group size, preferred date and the experiences that matter most. We will help you plan the flow." },
    { title: "Made for groups", body: "Suitable for family circles, school and college groups, and corporate teams—subject to direct confirmation." },
  ]},
  experiences: { title: "Feel alive outdoors.", kicker: "Experiences", intro: "Pool time, horse riding, farm life and outdoor activities are part of the resort story. Availability, supervision and age guidance are confirmed before your visit.", image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1800&q=85", sections: [
    { title: "Nature, at your pace", body: "Choose an energetic day or a slower escape. Every enquiry starts with the people you are bringing and the memories you want to make." },
    { title: "Safety comes first", body: "Activity access may vary by age, weather and supervision. Please confirm current operating guidance with the resort." },
  ]},
  dining: { title: "Gather around the table.", kicker: "Dining", intro: "Traditional food and the warmth of eating together are central to the experience. Current meal formats and dietary requests are confirmed directly.", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=85", sections: [
    { title: "Food with a sense of place", body: "Expect a dining story rooted in freshness, familiar flavours and generous hospitality." },
    { title: "Plan for your group", body: "Share dietary preferences and group requirements in your enquiry so the team can recommend suitable options." },
  ]},
  celebrations: { title: "Celebrate beneath open skies.", kicker: "Gatherings", intro: "From family milestones to group occasions, begin with a conversation. Event types, capacities, décor and food arrangements are confirmed to fit your plan.", image: experiences[3].image, sections: [
    { title: "Your occasion, considered", body: "Tell us the event, date and expected guest count. We will help you understand the suitable spaces and possibilities." },
    { title: "Clear, direct planning", body: "No preset promises or invented packages—just a direct enquiry that gives the team what they need to respond well." },
  ]},
  gallery: { title: "A glimpse of the escape.", kicker: "Gallery", intro: "The imagery below is experience inspiration, not a representation of the property. Visit the official Instagram for current, property-specific photographs.", image: experiences[2].image, sections: [
    { title: "See the real place", body: "Our official Instagram is the best source for current guest moments, resort spaces and recent experiences." },
    { title: "Bring your own story", body: "Every gathering looks different. Start with your group, occasion and preferred date." },
  ]},
  contact: { title: "Your escape starts here.", kicker: "Contact", intro: "Speak directly with the DS Agro Tourism & Resort team for current availability, inclusions, pricing and route guidance.", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85", sections: [
    { title: "WhatsApp", body: "+91 81494 28126 — the primary number for visit and booking enquiries." },
    { title: "Call the team", body: "81494 28126 · 84079 11909 · 77989 11909 · 75079 11909" },
  ]},
};
