import Link from "next/link";
import { DEMO_GUEST, DEMO_SHOW_ORDER, DEMO_TURNS } from "@/lib/demo-guest";

/*
 * The first turn of the /demo Live Guest, on the page it sits on. Sharon's
 * opening line and the three replies, in the demo's own order; each reply is
 * a link that opens /demo already playing from it. Server component: no
 * state, no script.
 */
export default function DemoTeaser() {
  return (
    <section className="sbe-mkt-tryit" aria-labelledby="tryit-title">
      <div className="container sbe-mkt-tryit-grid">
        <div className="sbe-mkt-tryit-copy">
          <p className="sbe-mkt-kicker">Try Live Guest now</p>
          <h2 id="tryit-title" className="sbe-mkt-display">
            Her parmy is cold. What would you say?
          </h2>
          <p className="sbe-mkt-lede">
            Pick a reply and {DEMO_GUEST.name} answers. Three replies, about two minutes, no sign-up. Then see what
            she was thinking and what each reply did to speed, safety and money.
          </p>
          <Link href="/demo" className="sbe-mkt-btn-text">
            Open the full demo
          </Link>
        </div>

        <div className="sbe-mkt-tryit-chat">
          <p className="sbe-mkt-tryit-scene">{DEMO_GUEST.setting}</p>
          <div className="lgd-line lgd-line-guest">
            <span className="lgd-line-who">{DEMO_GUEST.name}</span>
            <p className="lgd-bubble">{DEMO_GUEST.opening}</p>
          </div>
          <p className="lgd-choices-label">What do you say?</p>
          <ul className="sbe-mkt-tryit-replies">
            {DEMO_SHOW_ORDER[0].map((idx, position) => (
              <li key={idx}>
                <Link href={`/demo?reply=${position}`} className="lgd-choice">
                  {DEMO_TURNS[0][idx].text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
