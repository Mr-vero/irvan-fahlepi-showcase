import Photo from "@/components/Photo";

/**
 * A bone sheet with "IF" cut out of it, laid over three photographs. As the section scrolls, the sheet
 * scales up around a point inside the F, so the cut-out swallows the screen and the photos take over.
 * Without scroll timelines it simply stays as the monogram.
 */
export default function Monogram() {
  return (
    <section className="mono" aria-label="Irvan Fahlepi">
      <div className="mono-sticky">
        <div className="mono-photos" aria-hidden>
          <Photo name="redDress" alt="" sizes="44vw" priority />
          <Photo name="orange" alt="" sizes="22vw" priority />
          <Photo name="workshop" alt="" sizes="34vw" priority />
        </div>

        <svg className="mono-sheet" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <defs>
            <mask id="mono-cut" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="40000" height="40000">
              <rect x="-20000" y="-20000" width="40000" height="40000" fill="#fff" />
              {/* I */}
              <rect x="318" y="110" width="104" height="380" rx="6" fill="#000" />
              {/* F */}
              <rect x="458" y="110" width="104" height="380" rx="6" fill="#000" />
              <rect x="458" y="110" width="250" height="96" rx="6" fill="#000" />
              <rect x="458" y="258" width="200" height="88" rx="6" fill="#000" />
            </mask>
          </defs>
          <rect x="-20000" y="-20000" width="40000" height="40000" mask="url(#mono-cut)" className="mono-fill" />
        </svg>

        <div className="mono-copy">
          <p className="mono-kicker">Irvan Fahlepi — interactive developer</p>
          <h1 className="mono-title">
            Games, quizzes
            <br />
            &amp; stories people
            <br />
            actually <span>finish.</span>
          </h1>
        </div>

        <p className="mono-hint" aria-hidden>
          <span>↘</span> Scroll to unlock
        </p>
      </div>
    </section>
  );
}
