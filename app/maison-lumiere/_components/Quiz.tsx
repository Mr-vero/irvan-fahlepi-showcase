"use client";

import { useRef, useState } from "react";
import Photo from "@/components/Photo";
import { track } from "@/lib/analytics";
import { FAMILY_PHOTOS, QUESTIONS, scoreQuiz, type Family } from "@/lib/data";
import { leave, useReveal } from "@/lib/motion";
import type { Pick } from "./Experience";

type Props = { picks: Pick[]; onPick: (p: Pick) => void; onDone: (family: Family) => void };

export default function Quiz({ picks, onPick, onDone }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Family[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const ref = useReveal<HTMLDivElement>([index]);
  const question = QUESTIONS[index];

  const choose = (optionIndex: number) => {
    if (picked !== null) return;
    setPicked(optionIndex);
    const option = question.options[optionIndex];
    const next = [...answers, option.family];
    track("survey_answer", { question: index + 1, family: option.family });
    onPick({ photo: FAMILY_PHOTOS[option.family][index], label: option.label });

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
    <div className="ml-quiz">
      <ol className="ml-board" aria-label="Your moodboard">
        {QUESTIONS.map((_, i) => (
          <li key={i} className={picks[i] ? "is-filled" : undefined}>
            {picks[i] ? <Photo name={picks[i].photo} alt={picks[i].label} ratio={1} sizes="90px" /> : <span>{i + 1}</span>}
          </li>
        ))}
      </ol>
      <div
        className="ml-progress"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={QUESTIONS.length}
        aria-valuenow={index + 1}
        aria-label="Question progress"
        style={{ "--p": (index + 1) / QUESTIONS.length } as React.CSSProperties}
      />

      {QUESTIONS[index + 1] && (
        <div hidden>
          {QUESTIONS[index + 1].options.map((o) => (
            <Photo key={o.label} name={FAMILY_PHOTOS[o.family][index + 1]} alt="" ratio={1.15} sizes="(max-width: 700px) 45vw, 260px" priority />
          ))}
        </div>
      )}

      <div ref={ref} className="ml-question-wrap">
        <p className="ml-eyebrow" data-reveal>
          Question {index + 1} of {QUESTIONS.length}
        </p>
        <h2 className="ml-question" data-reveal>
          {question.prompt}
        </h2>
        <ul className="ml-options">
          {question.options.map((o, i) => (
            <li key={o.label} data-reveal>
              <button className={`ml-option${picked === i ? " is-picked" : ""}`} onClick={() => choose(i)} disabled={picked !== null}>
                <Photo name={FAMILY_PHOTOS[o.family][index]} alt="" ratio={1.15} sizes="(max-width: 700px) 45vw, 260px" priority />
                <span className="ml-option-label">
                  <i>{String.fromCharCode(65 + i)}</i>
                  {o.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
