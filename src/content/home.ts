/**
 * Homepage and health check-up content. Fictional values for a demonstration
 * hospital.
 */

const u = (id: string) => `https://images.unsplash.com/${id}`;

export const photos = {
  consultElderly: { src: u("photo-1758691462477-976f771224d8"), alt: "Doctor listening to an older patient in a bright consultation room" },
  consultElderly2: { src: u("photo-1758691462321-9b6c98c40f7e"), alt: "Doctor talking with an older man on a sofa" },
  consultCouple: { src: u("photo-1631217873436-b0fa88e71f0a"), alt: "Doctor going through results with a couple" },
  consultDesk: { src: u("photo-1758691462126-2ee47c8bf9e7"), alt: "Senior doctor explaining a diagnosis across his desk" },
  surgery: { src: u("photo-1579684288361-5c1a2957a700"), alt: "Surgical team operating under theatre lights" },
  imaging: { src: u("photo-1666214275172-ccc3b98e5519"), alt: "Patient entering a modern MRI scanner with a radiographer" },
  imaging2: { src: u("photo-1666214276389-393fb7dbc75c"), alt: "Radiographer preparing a patient for a scan" },
  paeds: { src: u("photo-1632053002928-1919605ee6f7"), alt: "Doctor examining a baby held by its mother" },
  paeds2: { src: u("photo-1708687045000-9dbb586ad1e2"), alt: "Smiling child with a doctor in a clinic" },
  nursing: { src: u("photo-1765896387387-0538bc9f997e"), alt: "Nurse sharing a laugh with an older patient" },
  maternity: { src: u("photo-1632053651899-3389100579fb"), alt: "Pregnant woman in a consultation with her doctor" },
  ultrasound: { src: u("photo-1706065264583-55f1a8549769"), alt: "Doctor reviewing an ultrasound scan on screen" },
  ambulance: { src: u("photo-1554734867-bf3c00a49371"), alt: "Ambulance with blue lights speeding to an emergency at night" },
  lab: { src: u("photo-1760074032600-36943c264fbf"), alt: "Laboratory specialists reviewing results together" },
  physio: { src: u("photo-1706353399656-210cca727a33"), alt: "Physiotherapist guiding a patient through a knee exercise" },
  nurse: { src: u("photo-1741707039536-113e200f9e0d"), alt: "Nurse in blue scrubs at the ward desk" },
  atrium: { src: u("photo-1586773860363-8ec8703e6aa5"), alt: "Sunlit hospital atrium" },
  lobby: { src: u("photo-1578991624414-276ef23a534f"), alt: "Bright reception lounge" },
  ward: { src: u("photo-1778151270902-cb0ca572f2ee"), alt: "Private patient room" },
} as const;

/** One photo per speciality slug, for centre-of-excellence cards. */
export const specialityPhotos: Record<string, { src: string; alt: string }> = {
  cardiology: photos.consultDesk,
  neurosciences: photos.imaging,
  orthopaedics: photos.physio,
  "obstetrics-gynaecology": photos.ultrasound,
  paediatrics: photos.paeds,
  oncology: photos.nursing,
  gastroenterology: photos.lab,
  "nephrology-urology": photos.imaging2,
};

export const healthPackages = [
  {
    slug: "essential",
    name: "Essential Health Check",
    price: 1999,
    tests: 38,
    for: "Adults under 40",
    includes: ["Complete blood count", "Blood sugar and lipid profile", "Liver, kidney and thyroid tests", "ECG and physician review"],
  },
  {
    slug: "comprehensive",
    name: "Comprehensive Health Check",
    price: 4999,
    tests: 72,
    for: "Adults over 40",
    includes: ["Everything in Essential", "HbA1c, vitamin D and B12", "Chest X-ray and abdominal ultrasound", "Eye, dental and dietitian review"],
    featured: true,
  },
  {
    slug: "heart",
    name: "Heart Check",
    price: 6499,
    tests: 24,
    for: "Family history or risk factors",
    includes: ["ECG and 2D echocardiogram", "Treadmill stress test", "Lipid profile and HbA1c", "Cardiologist consultation"],
  },
  {
    slug: "womens-wellness",
    name: "Women's Wellness",
    price: 3999,
    tests: 41,
    for: "Women of every age",
    includes: ["Pap smear and breast ultrasound", "Thyroid and bone health", "Iron and vitamin profile", "Gynaecologist consultation"],
  },
] as const;

export const stats = [
  { value: "250", label: "Beds, including 40 critical care" },
  { value: "8", label: "Centres of excellence" },
  { value: "24/7", label: "Emergency and ambulance" },
  { value: "9", label: "Languages spoken by our doctors" },
] as const;

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
