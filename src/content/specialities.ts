import type { Speciality } from "./types";

export const specialities: Speciality[] = [
  {
    slug: "cardiology",
    name: "Cardiology",
    icon: "heart",
    summary: "Heart rhythm, coronary and structural heart care, from first ECG to cardiac rehabilitation.",
    overview: [
      "Our cardiology team looks after the whole heart: chest pain and breathlessness, high blood pressure, rhythm problems and heart failure.",
      "Diagnosis, the cath lab, cardiac surgery referral and rehabilitation sit on the same floor, so most patients see one team from first test to follow-up.",
    ],
    conditions: ["Coronary artery disease", "Heart attack recovery", "Arrhythmia and palpitations", "Heart failure", "High blood pressure", "Valve disease"],
    services: ["ECG, echocardiography and stress testing", "Coronary angiography and angioplasty", "Holter and blood-pressure monitoring", "Pacemaker clinic", "Cardiac rehabilitation"],
  },
  {
    slug: "neurosciences",
    name: "Neurosciences",
    icon: "brain",
    summary: "Stroke, epilepsy, headache and movement disorders, with rapid imaging on site.",
    overview: [
      "Neurologists and neurosurgeons work together on conditions of the brain, spine and nerves.",
      "A stroke pathway links the emergency department directly to CT and MRI, because minutes matter when the brain is short of blood.",
    ],
    conditions: ["Stroke", "Epilepsy and seizures", "Migraine and chronic headache", "Parkinson's disease", "Neuropathy", "Spine and disc problems"],
    services: ["Stroke pathway with 24-hour imaging", "EEG and nerve-conduction studies", "Epilepsy clinic", "Memory and movement-disorder clinics", "Spine surgery"],
  },
  {
    slug: "orthopaedics",
    name: "Orthopaedics",
    icon: "bone",
    summary: "Joint replacement, sports injuries and fracture care, with physiotherapy in the same building.",
    overview: [
      "From a sprained ankle to a hip replacement, our orthopaedic surgeons treat bones, joints, ligaments and muscles.",
      "Physiotherapists join the plan before surgery, so recovery starts with a clear goal and a programme you can follow at home.",
    ],
    conditions: ["Knee and hip arthritis", "Sports and ligament injuries", "Fractures", "Back and neck pain", "Shoulder problems", "Osteoporosis"],
    services: ["Knee and hip replacement", "Arthroscopic surgery", "Fracture clinic", "Sports medicine", "Physiotherapy and rehabilitation"],
  },
  {
    slug: "obstetrics-gynaecology",
    name: "Obstetrics & Gynaecology",
    icon: "mother",
    summary: "Pregnancy, birth and women's health at every stage of life.",
    overview: [
      "Our obstetricians, midwives and gynaecologists care for women through pregnancy, birth and beyond.",
      "Labour suites are next to the neonatal unit, and high-risk pregnancies are reviewed jointly with fetal-medicine specialists.",
    ],
    conditions: ["Normal and high-risk pregnancy", "Fertility concerns", "Menstrual disorders", "PCOS", "Fibroids and endometriosis", "Menopause"],
    services: ["Antenatal and postnatal care", "Labour and delivery suites", "Fetal medicine and scans", "Minimally invasive gynaecological surgery", "Well-woman checks"],
  },
  {
    slug: "paediatrics",
    name: "Paediatrics",
    icon: "child",
    summary: "Care for newborns, children and teenagers, including a level III neonatal unit.",
    overview: [
      "Children are not small adults. Our paediatricians, children's nurses and play specialists are trained to care for them as they are.",
      "Parents can stay with their child on the ward, and the neonatal unit looks after babies who arrive early or need extra support.",
    ],
    conditions: ["Fever and infections", "Asthma and allergies", "Growth and development concerns", "Newborn jaundice", "Childhood vaccinations", "Adolescent health"],
    services: ["Neonatal intensive care", "Paediatric emergency care", "Vaccination clinic", "Developmental assessment", "Child nutrition"],
  },
  {
    slug: "oncology",
    name: "Oncology",
    icon: "cell",
    summary: "Cancer diagnosis, chemotherapy and surgery, planned by a tumour board for each patient.",
    overview: [
      "Every new cancer diagnosis is discussed at a weekly tumour board, where medical, surgical and radiation specialists agree a plan together.",
      "A nurse navigator stays with each patient through treatment, as the one person to call with questions.",
    ],
    conditions: ["Breast cancer", "Lung cancer", "Head and neck cancer", "Gastrointestinal cancers", "Blood cancers", "Gynaecological cancers"],
    services: ["Multidisciplinary tumour board", "Day-care chemotherapy", "Surgical oncology", "Palliative and supportive care", "Cancer screening"],
  },
  {
    slug: "gastroenterology",
    name: "Gastroenterology",
    icon: "stomach",
    summary: "Digestive and liver care, from endoscopy to long-term management of IBD.",
    overview: [
      "Our gastroenterologists diagnose and treat problems of the stomach, intestines, liver and pancreas.",
      "Most endoscopies are done as day procedures, with results discussed before you go home.",
    ],
    conditions: ["Acid reflux and ulcers", "Irritable bowel syndrome", "Crohn's disease and ulcerative colitis", "Fatty liver and hepatitis", "Gallstones", "Pancreatitis"],
    services: ["Upper GI endoscopy and colonoscopy", "ERCP", "Liver clinic", "IBD clinic", "Nutrition counselling"],
  },
  {
    slug: "nephrology-urology",
    name: "Nephrology & Urology",
    icon: "kidney",
    summary: "Kidney, bladder and prostate care, including dialysis and stone treatment.",
    overview: [
      "Nephrologists and urologists share one department, so kidney disease, stones and prostate problems are treated without being passed between clinics.",
      "The dialysis unit runs in the morning and evening so patients can keep working.",
    ],
    conditions: ["Chronic kidney disease", "Kidney stones", "Urinary tract infections", "Enlarged prostate", "Bladder control problems", "High blood pressure from kidney disease"],
    services: ["Haemodialysis", "Laser stone treatment", "Prostate clinic", "Urodynamic studies", "Kidney transplant assessment"],
  },
];
