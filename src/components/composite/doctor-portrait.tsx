"use client";

import Image from "next/image";
import { useState } from "react";
import type { Doctor } from "@/content/types";
import { cn } from "@/lib/utils/cn";

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

type Props = {
  doctor: Pick<Doctor, "name" | "image">;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/**
 * Doctor photo with a branded initials fallback for a missing or broken image,
 * so a profile never shows a broken-image icon.
 */
export function DoctorPortrait({ doctor, sizes, className, priority }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = doctor.image && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-teal-50", className)}>
      {showImage ? (
        <Image
          src={doctor.image!.src}
          alt={doctor.image!.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          role="img"
          aria-label={`Portrait unavailable for ${doctor.name}`}
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-50 to-dawn-50"
        >
          <span aria-hidden="true" className="font-display text-5xl font-semibold text-teal-800">
            {initials(doctor.name)}
          </span>
        </div>
      )}
    </div>
  );
}
