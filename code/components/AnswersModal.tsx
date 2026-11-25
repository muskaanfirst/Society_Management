"use client";

import { Modal } from "./Modal";
import type { Application } from "@/lib/types";

export function AnswersModal({
  application,
  onClose,
}: {
  application: Application;
  onClose: () => void;
}) {
  return (
    <Modal title={`${application.studentName}'s Application`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {application.formAnswers?.map((qa, i) => (
          <div key={i}>
            <p className="text-xs font-medium text-muted">{qa.question}</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">{qa.answer}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
