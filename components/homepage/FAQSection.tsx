"use client";

import { useState } from "react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Can my staff really train on their phone?",
      answer: "Yes, iOS & Android. They log in once, train anytime. Perfect for between shifts.",
    },
    {
      question: "What if someone doesn't complete their training?",
      answer: "Managers get reminders + reports. You'll see exactly who's done and who's not, with one click.",
    },
    {
      question: "Is there a contract? Can I cancel anytime?",
      answer: "No contract. Month-to-month only. Cancel anytime—we know you need flexibility.",
    },
    {
      question: "Do I need tech support?",
      answer: "Dedicated support included. Plus, onboarding call to make sure you're set up for success.",
    },
  ];

  return (
    <section style={{
      background: "#f3f4f6",
      padding: "60px 20px",
      borderBottom: "1px solid #e5e7eb",
    }}>
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
      }}>
        <h2 style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "#1a365d",
          textAlign: "center",
          margin: "0 0 50px",
        }}>
          Questions? We&apos;ve Answered Them.
        </h2>

        {/* FAQ Accordion */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          marginBottom: "50px",
        }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              borderBottom: i < faqs.length - 1 ? "1px solid #e5e7eb" : "none",
            }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "24px 28px",
                  background: "white",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (openIndex !== i) {
                    e.currentTarget.style.background = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                }}
              >
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#1a365d",
                  margin: 0,
                }}>
                  {faq.question}
                </h3>
                <span style={{
                  fontSize: "1.5rem",
                  color: "#059669",
                  marginLeft: "16px",
                  flexShrink: 0,
                  transition: "transform 0.2s ease",
                  transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                }}>
                  ▼
                </span>
              </button>

              {openIndex === i && (
                <div style={{
                  padding: "0 28px 24px",
                  borderTop: "1px solid #e5e7eb",
                }}>
                  <p style={{
                    fontSize: "0.95rem",
                    color: "#4b5563",
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div style={{
          background: "white",
          padding: "40px 32px",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          textAlign: "center",
        }}>
          <p style={{
            fontSize: "0.85rem",
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontWeight: 600,
            margin: "0 0 16px",
          }}>
            Trusted by hospitality leaders
          </p>

          <p style={{
            fontSize: "1.1rem",
            color: "#1a365d",
            fontStyle: "italic",
            margin: "0 0 12px",
            lineHeight: 1.6,
          }}>
            &ldquo;Training is the #1 lever for guest satisfaction. Serve By Example removes the friction.&rdquo;
          </p>

          <p style={{
            fontSize: "0.9rem",
            color: "#4b5563",
            fontWeight: 600,
            margin: 0,
          }}>
            — Hospitality Authority
          </p>
        </div>
      </div>
    </section>
  );
}
