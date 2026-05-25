'use client';

import { useState } from 'react';

type Tab = 'staff' | 'manager' | 'arena';

const TABS: { id: Tab; label: string }[] = [
  { id: 'staff', label: 'Staff View' },
  { id: 'manager', label: 'Manager View' },
  { id: 'arena', label: 'AI Arena' },
];

interface TabContent {
  headline: string;
  desc: string;
  callouts: string[];
  mockupTitle: string;
  mockupRows: string[];
}

const TAB_CONTENT: Record<Tab, TabContent> = {
  staff: {
    headline: 'Train at your own pace, guided by scenario training',
    desc: 'Staff see their personalised module queue, ELO skill rating, and an AI Coach ready for any scenario practice.',
    callouts: [
      'ELO skill rating updates after every session',
      'AI Coach available 24 hours a day, 7 days a week',
      '65+ bartending and service scenarios',
    ],
    mockupTitle: 'Dashboard',
    mockupRows: ['Bartending — 72% complete', 'Sales — 45% complete', 'ELO Rating: 1,240'],
  },
  manager: {
    headline: 'Real-time visibility across your whole team',
    desc: 'Managers see completion rates, compliance alerts, and individual staff progress without chasing anyone.',
    callouts: [
      'Team readiness dashboard at a glance',
      'Per-staff drill-down and progress reports',
      'Compliance flag alerts sent automatically',
    ],
    mockupTitle: 'Mission Control',
    mockupRows: ['Team readiness: 78%', '3 staff due for review', '2 compliance flags'],
  },
  arena: {
    headline: 'Competitive training that staff actually want to do',
    desc: 'The AI Arena pits staff against graded scenarios. Rankings update live. The best performers rise.',
    callouts: [
      'Weekly ranked scenario challenges',
      'Live leaderboard updates in real time',
      'Adaptive difficulty keeps competition fair',
    ],
    mockupTitle: 'AI Arena',
    mockupRows: ['#1 Jordan — 24/25', '#2 Alex — 22/25', '#3 Sam — 19/25'],
  },
};

function IcoCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export default function ProductTour() {
  const [active, setActive] = useState<Tab>('staff');
  const content = TAB_CONTENT[active];

  return (
    <section className="section product-tour-section">
      <div className="container">
        <div className="section-header center">
          <span className="eyebrow">Product Tour</span>
          <h2>See the platform in action</h2>
          <p>Three views. One platform.</p>
        </div>

        <div className="product-tour-tabs" role="tablist" aria-label="Platform views">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active === tab.id}
              aria-controls={`tour-panel-${tab.id}`}
              id={`tour-tab-${tab.id}`}
              className={`product-tour-tab${active === tab.id ? ' product-tour-tab-active' : ''}`}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`tour-panel-${active}`}
          aria-labelledby={`tour-tab-${active}`}
          className="product-tour-panel"
        >
          {/* Mockup preview */}
          <div className="product-tour-preview" aria-hidden="true">
            <div className="product-tour-mockup-chrome">
              <span /><span /><span />
              <span className="product-tour-mockup-title">{content.mockupTitle}</span>
            </div>
            <div className="product-tour-mockup-body">
              {content.mockupRows.map((row, i) => (
                <div key={i} className="product-tour-mockup-row">
                  {row}
                </div>
              ))}
            </div>
          </div>

          {/* Callouts */}
          <div className="product-tour-callouts">
            <h3>{content.headline}</h3>
            <p>{content.desc}</p>
            <ul className="product-tour-callout-list">
              {content.callouts.map((c, i) => (
                <li key={i}>
                  <IcoCheck />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
