import React from "react";

export default function ForBusiness() {
  const Section = ({ title, subtitle, children }) => (
    <section style={{ width: "100%", padding: "64px 20px", background: "var(--bg-primary)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {(title || subtitle) && (
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            {title && (
              <h2 style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}>{title}</h2>
            )}
            {subtitle && (
              <p style={{
                color: "var(--text-secondary)",
                fontSize: 18,
                margin: "12px auto 0",
                maxWidth: 700,
                lineHeight: 1.6,
              }}>{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );

  return (
    <div>
      {/* Hero */}
      <section style={{
        width: "100%",
        background: "var(--gradient-soft)",
        padding: "80px 20px",
        borderBottom: "1px solid var(--border-light)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 16px",
            background: "var(--bg-primary)",
            border: "1px solid var(--border-light)",
            borderRadius: 999,
            color: "var(--text-secondary)",
            marginBottom: 16,
          }}>Solutions for schools & organizations</div>
          <h1 style={{
            fontSize: "clamp(36px,5vw,56px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: 0,
            color: "var(--text-primary)",
          }}>Upskill your learners with tailored tutoring</h1>
          <p style={{
            color: "var(--text-secondary)",
            fontSize: 18,
            maxWidth: 760,
            margin: "16px auto 24px",
            lineHeight: 1.7,
          }}>
            Partner with us to provide high-quality 1-on-1 and small-group tutoring for schools,
            universities, and companies. Flexible programs, measurable outcomes.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" style={{
              background: "var(--gradient-primary)",
              color: "var(--text-white)",
              padding: "14px 28px",
              borderRadius: 12,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "var(--shadow-md)",
            }}>Talk to our team</a>
            <a href="#plans" style={{
              color: "var(--primary)",
              padding: "14px 20px",
              borderRadius: 12,
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid var(--border-light)",
              background: "var(--bg-primary)",
            }}>View plans</a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <Section
        title="Why partner with us?"
        subtitle="A complete tutoring solution aligned to academic and professional outcomes"
      >
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {[
            { title: "Expert tutors", desc: "Carefully vetted tutors across 50+ subjects and skills." },
            { title: "Flexible delivery", desc: "1-on-1, small group, or cohort-based programs." },
            { title: "Reporting & analytics", desc: "Attendance, progress, and outcomes dashboards." },
            { title: "Curriculum alignment", desc: "Content aligned with course objectives and exams." },
            { title: "Secure & compliant", desc: "Privacy-first and GDPR-friendly infrastructure." },
            { title: "Dedicated support", desc: "Onboarding, scheduling, and coordination services." },
          ].map((f) => (
            <div key={f.title} style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-light)",
              borderRadius: 16,
              padding: 20,
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 8,
                background: "var(--info-light)",
                color: "var(--info)",
                fontWeight: 600,
                marginBottom: 12,
                fontSize: 12,
              }}>Feature</div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 18 }}>{f.title}</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Plans */}
      <Section title="Plans that scale" subtitle="Choose a plan or request a custom program" >
        <div id="plans" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {[
            { name: "Starter", price: "€499/mo", items: ["Up to 20 learners", "Email support", "Monthly report"] },
            { name: "Growth", price: "€1,499/mo", items: ["Up to 100 learners", "Priority support", "Bi-weekly report"] },
            { name: "Enterprise", price: "Custom", items: ["Unlimited learners", "SLA & onboarding", "Dedicated manager"] },
          ].map((p) => (
            <div key={p.name} style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-light)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <div style={{ color: "var(--primary)", fontWeight: 700 }}>{p.price}</div>
              </div>
              <ul style={{ margin: "12px 0 0 16px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {p.items.map((it) => (<li key={it}>{it}</li>))}
              </ul>
              <div style={{ marginTop: 16 }}>
                <a href="#contact" style={{
                  display: "inline-block",
                  background: "var(--gradient-primary)",
                  color: "var(--text-white)",
                  padding: "10px 16px",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontWeight: 600,
                  boxShadow: "var(--shadow-sm)",
                }}>Contact sales</a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact our team" subtitle="Tell us about your organization and goals">
        <div id="contact" style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border-light)",
          borderRadius: 16,
          padding: 20,
          boxShadow: "var(--shadow-sm)",
          maxWidth: 800,
          margin: "0 auto",
        }}>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="Organization name" style={inputStyle} />
              <input placeholder="Contact email" type="email" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="Team size" style={inputStyle} />
              <input placeholder="Country/Region" style={inputStyle} />
            </div>
            <textarea placeholder="Goals and requirements" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
            <div style={{ textAlign: "right" }}>
              <button type="submit" style={{
                background: "var(--gradient-primary)",
                color: "var(--text-white)",
                padding: "12px 18px",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
              }}>Send request</button>
            </div>
          </form>
        </div>
      </Section>
    </div>
  );
}

const inputStyle = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid var(--border-light)",
  background: "var(--bg-primary)",
  outline: "none",
  fontSize: 14,
};
