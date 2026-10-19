import type { SpecialityIcon as IconKey } from "@/content/types";

const paths: Record<IconKey, React.ReactNode> = {
  heart: <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Zm-4-9h2.5l1-2 2 4 1-2H16" />,
  brain: (
    <path d="M9.5 4a2.5 2.5 0 0 0-2.45 2A3 3 0 0 0 5 9a3 3 0 0 0 .4 4.5A3 3 0 0 0 8 18a2.5 2.5 0 0 0 4 .5V5a2.5 2.5 0 0 0-2.5-1Zm5 0A2.5 2.5 0 0 1 16.95 6 3 3 0 0 1 19 9a3 3 0 0 1-.4 4.5A3 3 0 0 1 16 18a2.5 2.5 0 0 1-4 .5" />
  ),
  bone: <path d="M8 4.5a2.5 2.5 0 0 0-3.5 3.5 2.5 2.5 0 0 0 3.5 3.5l5 5a2.5 2.5 0 0 0 3.5 3.5 2.5 2.5 0 0 0 3.5-3.5 2.5 2.5 0 0 0-3.5-3.5l-5-5A2.5 2.5 0 0 0 8 4.5Z" />,
  mother: <path d="M12 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm-4 18v-5l-1.5-1L9 9h6l1 3a3.5 3.5 0 0 1-2 6.3V21" />,
  child: <path d="M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-5 9 5-1.5 5 1.5M9 21l1-6.5h4L15 21M10.5 6h.01M13.5 6h.01" />,
  cell: <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-6.5 0h.01M18 15.5h.01M15.5 5.5h.01" />,
  stomach: <path d="M9 3v4a3 3 0 0 0 3 3h1a5 5 0 0 1 5 5v0a6 6 0 0 1-6 6H8a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3h4" />,
  kidney: <path d="M9 4C6 4 4 7 4 11s2 9 5 9 3-3 3-5-1.5-2.5-1.5-4S12 8 12 7 11 4 9 4Zm6 0c3 0 5 3 5 7s-2 9-5 9M12 15h3" />,
};

export function SpecialityIcon({ icon, className = "size-6" }: { icon: IconKey; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[icon]}
    </svg>
  );
}
