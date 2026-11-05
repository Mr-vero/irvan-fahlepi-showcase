"use client";

import { useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { QUESTIONS, scoreQuiz, type Family } from "@/lib/data";
import { leave, useReveal } from "@/lib/motion";

export default function Quiz({ onDone }: { onDone: (family: Family) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Family[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const ref = useReveal<HTMLDivElement>([index]);
  const question = QUESTIONS[index];

  const choose = (optionIndex: number) => {
    if (picked !== null) return;
    setPicked(optionIndex);
    const family = question.options[optionIndex].family;
    const next = [...answers, family];
    track("survey_answer", { question: index + 1, family });

    leave(ref.current, () => {
      setPicked(null);
      if (next.length === QUESTIONS.length) {
        const result = scoreQuiz(next);
        track("survey_complete", { family: result });
        onDone(result);
      } else {
        setAnswers(next);
        setIndex(index + 1);
      }
    });
  };

  return (
    <div className="screen quiz" ref={ref}>
      <div className="progress" data-reveal>
        <span className="progress-label">
          {String(index + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}
        </span>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={index + 1}
          aria-label="Question progress"
        >
          <div className="progress-fill" style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} />
        </div>
      </div>
      <h2 className="question" data-reveal>
        {question.prompt}
      </h2>
      <ul className="options">
        {question.options.map((o, i) => (
          <li key={o.label} data-reveal>
            <button
              className={`option${picked === i ? " is-picked" : ""}`}
              onClick={() => choose(i)}
              disabled={picked !== null}
            >
              <span className="option-index">{String.fromCharCode(65 + i)}</span>
              {o.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
