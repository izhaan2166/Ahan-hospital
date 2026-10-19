export type Speciality = {
  slug: string;
  name: string;
  /** One line used on cards and in metadata. */
  summary: string;
  /** Opening paragraphs on the detail page. */
  overview: string[];
  conditions: string[];
  services: string[];
  /** Short icon key rendered by SpecialityIcon. */
  icon: SpecialityIcon;
};

export type SpecialityIcon =
  | "heart"
  | "brain"
  | "bone"
  | "mother"
  | "child"
  | "cell"
  | "stomach"
  | "kidney";

export type Doctor = {
  slug: string;
  name: string;
  title: string;
  specialitySlugs: string[];
  qualifications: string[];
  experienceYears: number;
  languages: string[];
  bio: string[];
  interests: string[];
  /** Consultation days, for display only. */
  availability: string;
  image?: {
    src: string;
    alt: string;
  };
  featured?: boolean;
};
