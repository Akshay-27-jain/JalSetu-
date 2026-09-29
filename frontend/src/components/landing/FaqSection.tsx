import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Reveal } from '../Reveal';

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: 'Is JalSetu only for large societies?',
    a: 'Not at all. JalSetu is designed to grow with your community, from a compact building to a large multi-tower society.',
  },
  {
    q: 'How quickly can we get started?',
    a: 'Onboarding takes less than 15 minutes! Once the Community Admin registers the society, they can upload the flat directory via CSV or add wings/flats individually. Resident credentials and PWA download links are automatically generated.',
  },
  {
    q: 'Can residents see their own usage?',
    a: 'Yes! Every resident receives personal portal access to view their 30-day consumption trends, current CPHEEO slab tier, itemized PDF invoices, and payment receipts in real time.',
  },
  {
    q: 'What happens when a leak is detected?',
    a: 'Our statistical 2-sigma (2σ) anomaly engine flags continuous night flows and abnormal spikes. An instant email alert is dispatched to both the household resident and the society maintenance committee within 24 hours.',
  },
  {
    q: 'Can we use existing mechanical or analog meters?',
    a: 'Yes. JalSetu is built to support both manual/mechanical meters and digital IoT meters. Facility staff can log daily readings via mobile or upload entire tower spreadsheets via our 1-click CSV import tool.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-white py-24 sm:py-32 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Left Column: Category, Headline, Subtitle (from Reference Image 3) */}
          <div className="lg:col-span-5">
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
                QUESTIONS, ANSWERED
              </span>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                Good to know.
              </h2>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
                Everything you need to feel confident getting started with a more visible water system.
              </p>
            </Reveal>
          </div>

          {/* Right Column: Clean Minimalist Accordion */}
          <div className="lg:col-span-7">
            <Reveal delay={100} className="divide-y divide-slate-200 border-t border-b border-slate-200">
              {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={faq.q} className="py-6">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between text-left group"
                      aria-expanded={isOpen}
                    >
                      <span className="font-display text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors pr-6">
                        {faq.q}
                      </span>
                      <span
                        className={`shrink-0 text-brand-600 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 pr-6 animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
