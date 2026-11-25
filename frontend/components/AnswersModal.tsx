"use client";

import { Link2 } from "lucide-react";
import { Modal } from "./Modal";
import type { NonTechGradeRow } from "@/lib/types";

export function AnswersModal({
  row,
  onClose,
}: {
  row: NonTechGradeRow;
  onClose: () => void;
}) {
  return (
    <Modal title={`${row.studentName}'s Application`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {row.formAnswers?.map((qa, i) => (
          <div key={i}>
            <p className="text-xs font-medium text-muted">{qa.question}</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">{qa.answer}</p>
          </div>
        ))}
        {row.portfolioUrl && (
          <div>
            <p className="text-xs font-medium text-muted">Portfolio</p>
            <a
              href={row.portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-accent-text hover:brightness-90"
            >
              <Link2 className="h-3.5 w-3.5" /> {row.portfolioUrl}
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
}
