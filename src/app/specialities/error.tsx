"use client";

import { RouteError } from "@/components/composite/route-error";

export default function SpecialitiesError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} what="speciality information" />;
}
