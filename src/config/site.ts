/**
 * Hospital-wide details. Edit this file to change contact information,
 * opening hours and directions across the site.
 *
 * Ahan Hospitals is fictional. The phone and WhatsApp number is the site
 * owner's; the address and email are demonstration values.
 */
export const site = {
  name: "Ahan Hospitals",
  shortName: "Ahan",
  tagline: "Specialist care, close to home",
  description:
    "Ahan Hospitals is a multispeciality hospital in Hyderabad offering cardiology, neurosciences, orthopaedics, women's health, paediatrics, oncology and more under one roof.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  timeZone: "Asia/Kolkata",
  contact: {
    phoneDisplay: "+91 81483 08344",
    phoneE164: "+918148308344",
    emergencyDisplay: "+91 81483 08344",
    emergencyE164: "+918148308344",
    whatsappE164: "918148308344",
    email: "care@ahanhospitals.example",
  },
  address: {
    street: "Plot 21, Road No. 12, Banjara Hills",
    city: "Hyderabad",
    region: "Telangana",
    postalCode: "500034",
    country: "IN",
    countryName: "India",
  },
  directions: {
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Road+No.+12+Banjara+Hills+Hyderabad",
    landmarks: [
      "Five minutes from the Road No. 12 metro feeder stop",
      "Two kilometres from Panjagutta junction",
      "Rajiv Gandhi International Airport is about 40 minutes by road",
    ],
    parking: "Free visitor parking in the basement, with drop-off at the main entrance.",
  },
  hours: [
    { label: "Emergency and pharmacy", days: "Every day", time: "Open 24 hours", opens: "00:00", closes: "23:59", dayCodes: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] },
    { label: "Outpatient consultations", days: "Monday to Saturday", time: "8:00 am to 8:00 pm", opens: "08:00", closes: "20:00", dayCodes: ["Mo", "Tu", "We", "Th", "Fr", "Sa"] },
    { label: "Outpatient consultations", days: "Sunday", time: "9:00 am to 1:00 pm", opens: "09:00", closes: "13:00", dayCodes: ["Su"] },
    { label: "Laboratory and imaging", days: "Monday to Saturday", time: "7:00 am to 9:00 pm", opens: "07:00", closes: "21:00", dayCodes: ["Mo", "Tu", "We", "Th", "Fr", "Sa"] },
  ],
} as const;

export type Site = typeof site;

export const navigation = [
  { href: "/specialities", label: "Specialities" },
  { href: "/doctors", label: "Doctors" },
  { href: "/health-checkups", label: "Health check-ups" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact & visit" },
] as const;
