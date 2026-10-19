"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import type { DirectoryOption } from "@/lib/content";
import { Icon } from "@/components/ui/icon";
import { SEARCH_HANDOFF_KEY } from "@/components/sections/doctor-directory";

/**
 * Homepage doctor search. Only the speciality slug goes in the URL; any free
 * text is handed to the directory through session storage.
 */
export function HeroSearch({ specialities }: { specialities: DirectoryOption[] }) {
  const router = useRouter();
  const [speciality, setSpeciality] = useState("");
  const [query, setQuery] = useState("");
  const specialityId = useId();
  const queryId = useId();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (query.trim()) sessionStorage.setItem(SEARCH_HANDOFF_KEY, query.trim());
      else sessionStorage.removeItem(SEARCH_HANDOFF_KEY);
    } catch {
      // Without storage the directory opens with the speciality filter only.
    }
    router.push(speciality ? `/doctors?speciality=${encodeURIComponent(speciality)}` : "/doctors");
  };

  return (
    <form onSubmit={onSubmit} role="search" aria-label="Find a doctor" className="mt-3 grid gap-3 p-2 md:grid-cols-[1fr_1.4fr_auto]">
      <div className="flex flex-col rounded-2xl bg-sand px-4 py-3">
        <label htmlFor={specialityId} className="text-xs font-bold tracking-wide text-ink-faint uppercase">
          Speciality
        </label>
        <select
          id={specialityId}
          value={speciality}
          onChange={(e) => setSpeciality(e.target.value)}
          className="mt-1 cursor-pointer bg-transparent font-semibold outline-none"
        >
          <option value="">All specialities</option>
          {specialities.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col rounded-2xl bg-sand px-4 py-3">
        <label htmlFor={queryId} className="text-xs font-bold tracking-wide text-ink-faint uppercase">
          Doctor, condition or treatment
        </label>
        <input
          id={queryId}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={80}
          autoComplete="off"
          placeholder="For example, knee pain or Dr. Mehta"
          className="mt-1 bg-transparent font-semibold outline-none placeholder:font-normal placeholder:text-ink-faint"
        />
      </div>
      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-dawn-500 px-8 py-4 font-bold text-teal-950 hover:bg-dawn-300"
      >
        <Icon name="search" /> Search
      </button>
    </form>
  );
}
