"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { Doctor, Speciality } from "@/content/types";
import { DoctorCard } from "@/components/composite/cards";
import { EmptyState } from "@/components/composite/states";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/controls";

type Props = {
  doctors: Doctor[];
  specialities: Pick<Speciality, "slug" | "name">[];
  initialSpeciality?: string;
};

/**
 * The homepage search hands its free text over in session storage rather
 * than the URL, because a condition typed by a patient is health
 * information and must not end up in browser history or server logs.
 */
export const SEARCH_HANDOFF_KEY = "ahan:doctor-search";

const normalise = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

export function filterDoctors(
  doctors: Doctor[],
  specialities: Pick<Speciality, "slug" | "name">[],
  query: string,
  speciality: string,
): Doctor[] {
  const q = normalise(query);
  return doctors.filter((doctor) => {
    if (speciality && !doctor.specialitySlugs.includes(speciality)) return false;
    if (!q) return true;
    const specialityNames = specialities.filter((s) => doctor.specialitySlugs.includes(s.slug)).map((s) => s.name);
    const haystack = normalise([doctor.name, doctor.title, ...doctor.interests, ...specialityNames].join(" "));
    return q.split(/\s+/).every((term) => haystack.includes(term));
  });
}

export function DoctorDirectory({ doctors, specialities, initialSpeciality = "" }: Props) {
  const validInitial = specialities.some((s) => s.slug === initialSpeciality) ? initialSpeciality : "";
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const handedOver = sessionStorage.getItem(SEARCH_HANDOFF_KEY);
      if (handedOver) {
        sessionStorage.removeItem(SEARCH_HANDOFF_KEY);
        // Reading browser storage is only possible after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setQuery(handedOver.slice(0, 80));
      }
    } catch {
      // Storage can be unavailable (private mode); the search simply starts empty.
    }
  }, []);
  const [speciality, setSpeciality] = useState(validInitial);
  const searchId = useId();
  const specialityId = useId();

  const results = useMemo(() => filterDoctors(doctors, specialities, query, speciality), [doctors, specialities, query, speciality]);
  const namesFor = (doctor: Doctor) => specialities.filter((s) => doctor.specialitySlugs.includes(s.slug)).map((s) => s.name);
  const hasFilters = query !== "" || speciality !== "";
  const clear = () => {
    setQuery("");
    setSpeciality("");
  };

  return (
    <div>
      <form
        role="search"
        aria-label="Find a doctor"
        className="grid gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-soft)] md:grid-cols-[1.4fr_1fr_auto] md:items-end md:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor={searchId} className="text-sm font-semibold text-ink">
            Search by name or condition
          </label>
          <Input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="For example, knee replacement or Dr. Rao"
            maxLength={80}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={specialityId} className="text-sm font-semibold text-ink">
            Speciality
          </label>
          <Select id={specialityId} value={speciality} onChange={(event) => setSpeciality(event.target.value)}>
            <option value="">All specialities</option>
            {specialities.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <Button variant="ghost" onClick={clear} disabled={!hasFilters} className="md:mb-0.5">
          Clear filters
        </Button>
      </form>

      <p role="status" aria-live="polite" className="mt-8 text-sm text-ink-soft">
        {results.length === 1 ? "Showing 1 doctor" : `Showing ${results.length} doctors`}
        {speciality ? ` in ${specialities.find((s) => s.slug === speciality)?.name}` : ""}
      </p>

      {results.length > 0 ? (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((doctor) => (
            <li key={doctor.slug} className="flex">
              <DoctorCard doctor={doctor} specialityNames={namesFor(doctor)} headingLevel="h2" className="w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-6"
          title="No doctors match your search"
          actions={
            <>
              <Button variant="secondary" onClick={clear}>
                Clear filters
              </Button>
            </>
          }
        >
          Try a different name or condition, or choose another speciality. Our reception team can also help you find
          the right specialist.
        </EmptyState>
      )}
    </div>
  );
}
