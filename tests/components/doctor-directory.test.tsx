import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Doctor } from "@/content/types";
import { DoctorDirectory } from "@/components/sections/doctor-directory";
import { DoctorPortrait } from "@/components/composite/doctor-portrait";

// next/image needs the Next.js runtime; a plain img is enough to test behaviour.
vi.mock("next/image", () => ({
  default: ({ fill: _fill, priority: _priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
    void _fill;
    void _priority;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const doctor = (slug: string, name: string, specialitySlugs: string[], interests: string[]): Doctor => ({
  slug,
  name,
  title: "Consultant",
  specialitySlugs,
  qualifications: ["MBBS"],
  experienceYears: 10,
  languages: ["English"],
  bio: ["Fictional test doctor."],
  interests,
  availability: "Monday",
  image: { src: `https://images.unsplash.com/photo-${slug}`, alt: `${name} portrait` },
});

const doctors = [
  doctor("a", "Dr. Asha Heart", ["cardiology"], ["Angioplasty"]),
  doctor("b", "Dr. Bina Heart", ["cardiology"], ["Echocardiography"]),
  doctor("c", "Dr. José Bones", ["orthopaedics"], ["Knee replacement"]),
];
const specialities = [
  { slug: "cardiology", name: "Cardiology" },
  { slug: "orthopaedics", name: "Orthopaedics" },
  { slug: "oncology", name: "Oncology" },
];

const cards = () => screen.queryAllByRole("article");

describe("DoctorDirectory", () => {
  it("filters by speciality and announces the result count", async () => {
    const user = userEvent.setup();
    render(<DoctorDirectory doctors={doctors} specialities={specialities} />);
    expect(cards()).toHaveLength(3);

    await user.selectOptions(screen.getByLabelText(/speciality/i), "cardiology");
    expect(cards()).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 2 doctors in Cardiology");
    expect(screen.queryByRole("link", { name: /josé bones/i })).not.toBeInTheDocument();
  });

  it("searches names and conditions, ignoring case and accents", async () => {
    const user = userEvent.setup();
    render(<DoctorDirectory doctors={doctors} specialities={specialities} />);

    await user.type(screen.getByLabelText(/search/i), "jose");
    expect(cards()).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Dr. José Bones" })).toHaveAttribute("href", "/doctors/c");

    await user.clear(screen.getByLabelText(/search/i));
    await user.type(screen.getByLabelText(/search/i), "KNEE");
    expect(cards()).toHaveLength(1);
  });

  it("shows an empty state when nothing matches and recovers when filters are cleared", async () => {
    const user = userEvent.setup();
    render(<DoctorDirectory doctors={doctors} specialities={specialities} />);

    await user.selectOptions(screen.getByLabelText(/speciality/i), "oncology");
    expect(cards()).toHaveLength(0);
    const empty = screen.getByRole("heading", { name: /no doctors match your search/i }).parentElement!;
    expect(screen.getByRole("status")).toHaveTextContent("Showing 0 doctors in Oncology");

    await user.click(within(empty).getByRole("button", { name: /clear filters/i }));
    expect(cards()).toHaveLength(3);
  });

  it("applies a valid speciality from the URL and ignores an unknown one", () => {
    const { unmount } = render(<DoctorDirectory doctors={doctors} specialities={specialities} initialSpeciality="orthopaedics" />);
    expect(cards()).toHaveLength(1);
    unmount();
    render(<DoctorDirectory doctors={doctors} specialities={specialities} initialSpeciality="not-real" />);
    expect(cards()).toHaveLength(3);
  });
});

describe("DoctorPortrait", () => {
  it("falls back to initials when the photo fails to load", () => {
    render(<DoctorPortrait doctor={doctors[0]} sizes="100px" />);
    fireEvent.error(screen.getByRole("img", { name: /asha heart portrait/i }));
    expect(screen.getByRole("img", { name: /portrait unavailable for dr\. asha heart/i })).toHaveTextContent("AH");
  });

  it("shows initials when no photo is configured", () => {
    render(<DoctorPortrait doctor={{ name: "Dr. Test Doctor" }} sizes="100px" />);
    expect(screen.getByRole("img", { name: /portrait unavailable/i })).toHaveTextContent("TD");
  });
});
