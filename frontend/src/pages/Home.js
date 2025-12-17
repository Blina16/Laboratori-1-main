import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { Search, Star, Music2, Linkedin, Instagram } from "lucide-react";
 

export default function Home() {
  const navigate = useNavigate();
  

  

  const categories = [
    { id: 1, title: "K–12 Students", subtitle: "Homework help & test prep", icon: "📘" },
    { id: 2, title: "College & Univ.", subtitle: "Coursework & research help", icon: "🎓" },
    { id: 3, title: "Test Prep", subtitle: "SAT, ACT, GRE & more", icon: "📝" },
    { id: 4, title: "Languages", subtitle: "Speak fluently with native tutors", icon: "🗣️" },
    { id: 5, title: "Career Skills", subtitle: "Upskill & prep for interviews", icon: "💼" },
  ];

  const brands = [
    // Provide official logo URLs if available (e.g., in public/logos or CDN)
    { name: 'Helsinki EDU', logoUrl: '/logos/helsinki-edu.svg' },
    { name: 'NordicTech', logoUrl: '/logos/nordictech.svg' },
    { name: 'EduLabs', logoUrl: '/logos/edulabs.svg' },
    { name: 'BrightFuture', logoUrl: '/logos/brightfuture.svg' },
    { name: 'SkillForge', logoUrl: '/logos/skillforge.svg' },
    { name: 'CampusPlus', logoUrl: '/logos/campusplus.svg' },
  ];

  const BrandLogo = ({ title }) => {
    const initials = title
      .split(/\s+/)
      .map(w => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
    return (
      <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden>
        <defs>
          <linearGradient id="gradBrand" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill="url(#gradBrand)" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif">{initials}</text>
      </svg>
    );
  };

  const features = [
    {
      id: 1,
      title: "1-on-1 Live Tutoring",
      desc: "Personalized lessons with expert tutors to fit your goals and schedule.",
      icon: "💬",
    },
    {
      id: 2,
      title: "Instant Help",
      desc: "Get answers on-demand from tutors available 24/7 for quick guidance.",
      icon: "⚡",
    },
    {
      id: 3,
      title: "Progress Tracking",
      desc: "Stay on top of your learning journey with detailed reports and insights.",
      icon: "📊",
    },
    {
      id: 4,
      title: "Flexible Pricing",
      desc: "Choose from affordable plans or pay-per-session options.",
      icon: "💰",
    },
  ];

  const reviews = [
    {
      id: 1,
      name: "Sarah M.",
      text: "This platform completely changed how I study! My grades improved and I actually enjoy learning now.",
      rating: 5,
    },
    {
      id: 2,
      name: "Daniel K.",
      text: "The tutors are amazing — patient, knowledgeable, and super flexible with scheduling.",
      rating: 4,
    },
    {
      id: 3,
      name: "Lina P.",
      text: "Love the personalized approach! The progress tracking keeps me motivated every week.",
      rating: 5,
    },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span>✨ Trusted by 10,000+ students</span>
          </div>
          <h1 className="hero-title">
            Learn faster with your
            <span className="gradient-text"> best tutor</span>
          </h1>
          <p className="hero-subtitle">
            Connect with expert tutors for personalized 1-on-1 lessons. 
            Achieve your learning goals faster with flexible scheduling.
          </p>
          
          <div className="hero-actions">
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search tutors, subjects, or skills..."
                className="search-input"
              />
            </div>
            <button className="home-btn primary" onClick={() => navigate("/login")}>
              Get Started
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Expert Tutors</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Subjects</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Available</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Remote learning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Boxes */}
      <section className="categories-section">
        <div className="section-header">
          <h2 className="section-title">Browse by Category</h2>
          <p className="section-subtitle">Find the perfect tutor for your learning needs</p>
        </div>
        <div className="boxes-container">
          {categories.map((cat) => (
            <div key={cat.id} className="box">
              <div className="box-icon">{cat.icon}</div>
              <div className="box-text">
                <h3>{cat.title}</h3>
                <p>{cat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brands we worked with */}
      <section className="brands-section">
        <div className="section-header">
          <h2 className="section-title">Brands we worked with</h2>
          <p className="section-subtitle">Trusted by schools, companies, and organizations</p>
        </div>
        <div className="brands-slider">
          <div className="brands-track">
            {brands.map((b) => (
              <div key={b.name + '-1'} className="brand-badge" aria-label={b.name} title={b.name}>
                {b.logoUrl ? (
                  <img src={b.logoUrl} alt={b.name} className="brand-logo-img" onError={(e)=>{e.currentTarget.style.display='none';}} />
                ) : (
                  <span className="brand-logo"><BrandLogo title={b.name} /></span>
                )}
                <span className="brand-name">{b.name}</span>
              </div>
            ))}
            {brands.map((b) => (
              <div key={b.name + '-2'} className="brand-badge" aria-label={b.name} title={b.name}>
                {b.logoUrl ? (
                  <img src={b.logoUrl} alt={b.name} className="brand-logo-img" onError={(e)=>{e.currentTarget.style.display='none';}} />
                ) : (
                  <span className="brand-logo"><BrandLogo title={b.name} /></span>
                )}
                <span className="brand-name">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Features */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose Us?</h2>
          <p className="section-subtitle">
            Everything you need to make learning efficient, engaging, and personal.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">{feature.icon}</div>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Student Reviews */}
      <section className="reviews-section">
        <div className="section-header">
          <h2 className="section-title">What Students Say</h2>
          <p className="section-subtitle">
            Real stories from learners who found success with our tutors.
          </p>
        </div>

        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="stars">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={18} color="#fbbf24" fill="#fbbf24" />
                ))}
              </div>
              <p className="review-text">"{review.text}"</p>
              <div className="review-footer">
                <h4 className="review-name">{review.name}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <div className="newsletter-section">
        <div className="newsletter-card">
          <h2>Stay in the loop</h2>
          <p>Get course updates, tutor tips, and special offers straight to your inbox.</p>
          <div className="newsletter-form">
            <div className="input-group">
              <span className="input-icon">📧</span>
              <input type="email" placeholder="you@example.com" className="newsletter-input" />
            </div>
            <button className="newsletter-btn">Subscribe</button>
          </div>
          <div className="trust-row">
            <span>No spam</span>
            <span>Unsubscribe anytime</span>
            <span>GDPR-friendly</span>
          </div>
          <div className="social-row">
            <a
              className="social-link tiktok"
              href="https://www.tiktok.com/@tutor4kids"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              title="TikTok"
            >
              <Music2 size={18} />
            </a>
            <a
              className="social-link linkedin"
              href="https://www.linkedin.com/company/tutor4kids"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a
              className="social-link instagram"
              href="https://www.instagram.com/tutor4kids"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <Instagram size={18} />
            </a>
          </div>
          <p className="newsletter-credit">@ Laboratori 1 Blina Krasniqi</p>
        </div>
      </div>
    </div>
  );
}
