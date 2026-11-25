// Track A (Technical) proctored assessment question bank.
// No question bank exists elsewhere in the repo yet, so this is the source of
// truth /api/test-submit auto-grades against. correctIndex is 0-based into options.
export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const MCQ_BANK: MCQQuestion[] = [
  {
    id: "q1",
    question: "Which data structure uses LIFO (Last In, First Out) ordering?",
    options: ["Queue", "Stack", "Linked List", "Heap"],
    correctIndex: 1,
  },
  {
    id: "q2",
    question: "What is the time complexity of binary search on a sorted array?",
    options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
    correctIndex: 2,
  },
  {
    id: "q3",
    question: "In HTTP, which status code means 'Not Found'?",
    options: ["200", "301", "404", "500"],
    correctIndex: 2,
  },
  {
    id: "q4",
    question: "Which SQL clause filters rows before aggregation?",
    options: ["HAVING", "WHERE", "GROUP BY", "ORDER BY"],
    correctIndex: 1,
  },
  {
    id: "q5",
    question: "What does CSS 'flex: 1' do to a flex item?",
    options: [
      "Fixes its width to 1px",
      "Lets it grow/shrink to fill available space",
      "Hides it",
      "Makes it absolutely positioned",
    ],
    correctIndex: 1,
  },
  {
    id: "q6",
    question: "Which of these is NOT a JavaScript primitive type?",
    options: ["string", "boolean", "array", "number"],
    correctIndex: 2,
  },
  {
    id: "q7",
    question: "What does 'git rebase' primarily do, compared to 'git merge'?",
    options: [
      "Deletes commit history",
      "Rewrites commits onto a new base instead of creating a merge commit",
      "Pushes directly to the remote",
      "Creates a new branch automatically",
    ],
    correctIndex: 1,
  },
  {
    id: "q8",
    question: "In React, what triggers a component to re-render?",
    options: [
      "Changing a local variable not tied to state",
      "A change in state or props",
      "Scrolling the page",
      "Reloading the CSS file",
    ],
    correctIndex: 1,
  },
];
