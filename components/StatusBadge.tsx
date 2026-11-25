import type { ApplicationStatus } from "@/lib/types";

const STYLES: Record<ApplicationStatus, { bg: string; fg: string; label: string }> = {
  Pending: { bg: "var(--accent-soft)", fg: "var(--accent-text)", label: "Pending Review" },
  Assessed: { bg: "var(--accent-soft)", fg: "var(--accent-text)", label: "Assessed" },
  Shortlisted: { bg: "var(--success-soft)", fg: "var(--success)", label: "Shortlisted" },
  Interview_Booked: { bg: "var(--success-soft)", fg: "var(--success)", label: "Interview Booked" },
  Rejected: { bg: "var(--danger-soft)", fg: "var(--danger)", label: "Not Selected" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const s = STYLES[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}
