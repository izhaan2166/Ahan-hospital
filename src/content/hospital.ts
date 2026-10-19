const unsplash = (id: string) => `https://images.unsplash.com/${id}`;

export const images = {
  atrium: {
    src: unsplash("photo-1586773860363-8ec8703e6aa5"),
    alt: "Sunlit hospital atrium with tall windows and a warm wooden wall",
  },
  lobby: {
    src: unsplash("photo-1578991624414-276ef23a534f"),
    alt: "Reception lounge with teal sofas and a bright front desk",
  },
  corridor: {
    src: unsplash("photo-1583953458882-302655b5c376"),
    alt: "Wide, light-filled hospital corridor with polished floors",
  },
  waiting: {
    src: unsplash("photo-1719155483042-20d5763ea0b1"),
    alt: "Two visitors talking in a hospital waiting area",
  },
  ward: {
    src: unsplash("photo-1778151270902-cb0ca572f2ee"),
    alt: "Private patient room with an adjustable bed and monitoring equipment",
  },
  room: {
    src: unsplash("photo-1791092893254-09427ef98d62"),
    alt: "Recovery room with a large window and natural light",
  },
} as const;

export const commitments = [
  {
    title: "One team, one plan",
    body: "Specialists meet to agree your plan together, so you are not passed from clinic to clinic.",
  },
  {
    title: "Time to talk",
    body: "Consultations are booked with room for questions. You leave with a written summary of what was decided.",
  },
  {
    title: "Clear costs",
    body: "Our patient-services desk explains estimates and insurance before planned treatment, not after.",
  },
] as const;

export const facilities = [
  { title: "24-hour emergency", body: "Emergency physicians, a resuscitation bay and a direct line to the cath lab and stroke team." },
  { title: "Critical care", body: "Medical, surgical, cardiac and neonatal intensive care units staffed around the clock." },
  { title: "Imaging", body: "MRI, CT, digital X-ray, ultrasound and mammography on the ground floor." },
  { title: "Laboratory", body: "Pathology and microbiology with most routine results reported the same day." },
  { title: "Day surgery", body: "Modular operating theatres and a day-care unit for procedures that do not need an overnight stay." },
  { title: "Pharmacy", body: "An in-house pharmacy open 24 hours, with medicines explained at the counter." },
] as const;

export const about = {
  story: [
    "Ahan means dawn. We chose the name because a hospital visit often begins at a difficult moment, and our job is to make the next one better.",
    "Ahan Hospitals brings eight specialities, diagnostics and emergency care into one building in Banjara Hills, Hyderabad. Families can see a cardiologist, have a scan and collect medicines without crossing the city.",
    "We are built around a simple idea: good medicine is a conversation. Doctors explain, nurses listen, and every patient leaves knowing what happens next.",
  ],
  values: [
    { title: "Listen first", body: "We ask about your life, not only your symptoms, before we recommend anything." },
    { title: "Explain clearly", body: "Every diagnosis and option is explained in plain language, in the language you are most comfortable with." },
    { title: "Work as one team", body: "Doctors, nurses, therapists and pharmacists plan care together and share one record." },
    { title: "Respect your time", body: "We publish consultation hours, keep waiting areas calm and tell you when delays happen." },
  ],
} as const;
