import { site } from "@/config/site";

export type WhatsAppContext =
  | { kind: "general" }
  | { kind: "speciality"; specialityName: string }
  | { kind: "doctor"; doctorName: string; specialityName?: string };

/**
 * Prefilled enquiry text. It names only the speciality or doctor being asked
 * about, never anything about the patient.
 */
export function whatsappMessage(context: WhatsAppContext): string {
  switch (context.kind) {
    case "general":
      return "Hello Ahan Hospitals, I have a general enquiry.";
    case "speciality":
      return `Hello Ahan Hospitals, I would like to know more about ${context.specialityName}.`;
    case "doctor":
      return context.specialityName
        ? `Hello Ahan Hospitals, I would like to ask about consultations with ${context.doctorName} (${context.specialityName}).`
        : `Hello Ahan Hospitals, I would like to ask about consultations with ${context.doctorName}.`;
  }
}

export function whatsappUrl(context: WhatsAppContext, number: string = site.contact.whatsappE164): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessage(context))}`;
}
