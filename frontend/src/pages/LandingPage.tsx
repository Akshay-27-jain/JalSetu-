import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Benefits } from '../components/landing/Benefits';
import { Features } from '../components/landing/Features';
import { StatsRibbon } from '../components/landing/StatsRibbon';
import { FaqSection } from '../components/landing/FaqSection';
import { CtaBanner } from '../components/landing/CtaBanner';
import { Footer } from '../components/landing/Footer';
import { useLenis } from '../hooks/useLenis';

export function LandingPage() {
  // Initialize Lenis smooth scroll for this page
  useLenis();

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* 1. Top Navigation Bar (How It Works, Benefits, Features, FAQ) */}
      <Navbar />

      <main>
        {/* 2. Hero with Background Video & Clean Actions */}
        <Hero />

        {/* 3. How It Works (A Better Flow, From Meter to Mind + 01/02/03 Steps + Comparison Table) */}
        <HowItWorks />

        {/* 4. Benefits (6 Core Societal Advantages with Colored Edge Borders) */}
        <Benefits />

        {/* 5. Features (Upgraded Glossy Cards: Smart Water Monitoring, Automated Billing, Residential Management, Secure Access) */}
        <Features />

        {/* 6. Stats Ribbon (120+ Communities, 18,000+ Flats, 2.5M L, 92.0% — Placed Before FAQ) */}
        <StatsRibbon />

        {/* 7. Frequently Asked Questions (Good to know.) */}
        <FaqSection />

        {/* 8. Final Call to Action (Turn every drop into a better decision.) */}
        <CtaBanner />
      </main>

      {/* 9. Comprehensive Footer with Legal Pages */}
      <Footer />
    </div>
  );
}
