import Image from "next/image";
import Link from "next/link";
import type { Doctor, Speciality } from "@/content/types";
import { DoctorPortrait } from "@/components/composite/doctor-portrait";
import { SpecialityIcon } from "@/components/composite/speciality-icon";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

export function ArrowIcon({ className = "size-4" }: { className?: string }) {
  return <Icon name="arrow" className={className} />;
}

type SpecialityCardProps = {
  speciality: Speciality;
  photo?: { src: string; alt: string };
  headingLevel?: "h2" | "h3";
  className?: string;
};

/** Centre-of-excellence card: photo, name, one line, and the whole card links. */
export function SpecialityCard({ speciality, photo, headingLevel = "h3", className }: SpecialityCardProps) {
  const Heading = headingLevel;
  return (
    <Link
      href={`/specialities/${speciality.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition hover:shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-teal-50">
        {photo ? (
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 290px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
        <span className="absolute bottom-3 left-3 flex size-10 items-center justify-center rounded-xl bg-white/95 text-teal-700 shadow-sm">
          <SpecialityIcon icon={speciality.icon} className="size-5" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Heading className="text-lg font-bold text-ink">{speciality.name}</Heading>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-faint">{speciality.summary}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-teal-700">
          Explore <ArrowIcon className="size-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

type DoctorCardProps = {
  doctor: Doctor;
  specialityNames: string[];
  headingLevel?: "h2" | "h3";
  className?: string;
};

export function DoctorCard({ doctor, specialityNames, headingLevel = "h3", className }: DoctorCardProps) {
  const Heading = headingLevel;
  return (
    <article className={cn("flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white", className)}>
      <div className="relative">
        <DoctorPortrait doctor={doctor} sizes="(min-width: 1024px) 290px, (min-width: 640px) 45vw, 90vw" className="aspect-square" />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-teal-700">
          {doctor.experienceYears} yrs experience
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold tracking-wider text-dawn-700 uppercase">{specialityNames.join(", ")}</p>
        <Heading className="mt-1.5 text-lg font-bold text-ink">
          <Link href={`/doctors/${doctor.slug}`} className="hover:text-teal-700 hover:underline">
            {doctor.name}
          </Link>
        </Heading>
        <p className="mt-1 text-sm text-ink-faint">{doctor.title}</p>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-soft">
          <Icon name="globe" className="size-4 shrink-0" />
          <span>{doctor.languages.slice(0, 3).join(", ")}</span>
        </p>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link
            href={`/appointments?doctor=${doctor.slug}`}
            className="flex min-h-11 items-center justify-center rounded-full bg-teal-700 px-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            Book<span className="sr-only"> an appointment with {doctor.name}</span>
          </Link>
          <Link
            href={`/doctors/${doctor.slug}`}
            className="flex min-h-11 items-center justify-center rounded-full border border-line-strong px-3 text-sm font-bold text-ink hover:border-teal-700"
          >
            Profile<span className="sr-only"> of {doctor.name}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
