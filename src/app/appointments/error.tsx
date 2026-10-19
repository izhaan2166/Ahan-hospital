"use client";

import { RouteError } from "@/components/composite/route-error";

export default function AppointmentsError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} what="the appointment form" />;
}
