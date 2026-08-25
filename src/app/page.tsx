import Link from "next/link";
import { Fraunces, Figtree } from "next/font/google";
import {
  ArrowUpRight,
  Beef,
  ClipboardCheck,
  CloudOff,
  Droplets,
  HeartPulse,
  Package,
  ShieldCheck,
  Smartphone,
  SprayCan,
  Wallet,
} from "lucide-react";
import { UroraMark, UroraWordmark } from "@/components/brand/logo";
import { LiveFarmOverview } from "@/components/landing/live-farm-overview";
import { getSession } from "@/lib/auth/session";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-landing-display",
  weight: ["500", "600", "700"],
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-landing-body",
  weight: ["400", "500", "600", "700"],
});

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className={`${display.variable} ${body.variable} landing-root`}>
      <header className="landing-nav">
        <Link href="/" aria-label="Urora Smart home">
          <UroraWordmark />
        </Link>
        <nav className="landing-links">
          <a href="#features">Features</a>
          <a href="#roles">Roles</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard" className="landing-btn-primary">
              Open dashboard <ArrowUpRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-bold text-[#1f4a3a] sm:inline">
                Sign in
              </Link>
              <Link href="/register" className="landing-btn-primary">
                Get started <ArrowUpRight className="size-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-media" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero_section.jpg" alt="" />
        </div>
        <div className="landing-hero-copy animate-fade-up">
          <div className="landing-brand-lockup">
            <UroraMark className="size-12 rounded-[14px] bg-[#8ec49b] text-[#163d30] [&_svg]:size-6" />
            <div>
              <p className="landing-brand-name">Urora Smart</p>
              <p className="landing-brand-tag">Dairy farm workspace</p>
            </div>
          </div>
          <h1 className="landing-hero-title">Herd work that stays clear from milking to money.</h1>
          <p className="landing-hero-lede">
            One calm place for cows, milk, health, stock, and tick wash — built for Rwanda’s farms, ready when the signal isn’t.
          </p>
          <div className="landing-hero-actions">
            {session ? (
              <Link href="/dashboard" className="landing-btn-primary landing-btn-lg">
                Continue to dashboard <ArrowUpRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link href="/register" className="landing-btn-primary landing-btn-lg">
                  Start your farm <ArrowUpRight className="size-4" />
                </Link>
                <Link href="/login" className="landing-btn-ghost">
                  Open the demo
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <main>
        <section id="features" className="landing-section">
          <div className="landing-section-head">
            <p className="landing-eyebrow">Everything in one place</p>
            <h2 className="landing-h2">Less guesswork. More good days in the kraal.</h2>
            <p className="landing-lede">Know what is happening without chasing notebooks or WhatsApp threads.</p>
          </div>
          <div className="landing-feature-grid">
            <Feature icon={Beef} title="Know every animal" text="Tags, photos, breed, mother, and status you actually use." />
            <Feature icon={Droplets} title="Track milk simply" text="Morning, midday, and evening sessions in seconds — even offline." />
            <Feature icon={HeartPulse} title="Sick animals & health" text="Treatments, withholds, isolation, and photo proof in one thread." />
            <Feature icon={Package} title="Store & feed" text="Medicines, salt, acaricide, feed — with reorder before empty." />
            <Feature icon={SprayCan} title="Tick wash & dip" text="Chemically treated water logged separately from drinking water." />
            <Feature icon={CloudOff} title="Works without signal" text="Queue the day’s records in the field; sync when coverage returns." />
          </div>
        </section>

        <section id="roles" className="landing-roles">
          <div className="landing-section-head light">
            <p className="landing-eyebrow light">Clear authorization</p>
            <h2 className="landing-h2 light">Owner and operator — same farm, different keys.</h2>
            <p className="landing-lede light">
              Both roles keep the full daily toolkit. Money, reports, and farm settings stay with the owner.
            </p>
          </div>
          <div className="landing-roles-layout">
            <div className="landing-role-grid">
              <article className="landing-role-card">
                <Wallet className="size-6 text-[#e4b96f]" />
                <h3>Farm owner</h3>
                <p>
                  Full herd ops plus money, reports, activity log, farm profile, digests, and kraals.
                </p>
                <ul>
                  <li>Milk sales & expenses</li>
                  <li>Daily / monthly reports</li>
                  <li>Who logged what</li>
                </ul>
              </article>
              <article className="landing-role-card">
                <ClipboardCheck className="size-6 text-[#8ec49b]" />
                <h3>Farm operator</h3>
                <p>
                  Everything needed in the field — cows, milk, health, breeding, stock, wash, and schedule.
                </p>
                <ul>
                  <li>Record milking & treatments</li>
                  <li>Stock in / out</li>
                  <li>Alerts & offline sync</li>
                </ul>
              </article>
            </div>
            <LiveFarmOverview />
          </div>
        </section>

        <section id="how-it-works" className="landing-section soft">
          <div className="how-it-works-inner">
            <div className="how-it-works-intro">
              <p className="landing-eyebrow">How it works</p>
              <h2 className="landing-h2">Three steps from kraal to clarity.</h2>
              <p className="landing-lede">
                Set up once, record as you go, and let the dashboard surface what needs attention next.
              </p>
              {!session ? (
                <Link href="/register" className="landing-btn-outline mt-8 inline-flex">
                  Create your workspace <ArrowUpRight className="size-4" />
                </Link>
              ) : null}
            </div>
            <ol className="how-steps">
              <HowStep
                n="1"
                icon={Beef}
                title="Set up herd & store"
                text="Add cows with photos, medicines, feed, and kraals. Owners configure the farm once."
              />
              <HowStep
                n="2"
                icon={ClipboardCheck}
                title="Record work in the field"
                text="Operators and owners log milk, health, stock, and wash — with or without signal."
              />
              <HowStep
                n="3"
                icon={Smartphone}
                title="See what needs attention"
                text="Alerts flag sick animals, withholds, low stock, and spray dates on the home screen."
              />
            </ol>
          </div>
        </section>
      </main>

      <footer id="footer" className="site-footer">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link href="/" aria-label="Urora Smart home">
              <UroraWordmark light />
            </Link>
            <p>Practical herd management for healthier cows and stronger farms across Rwanda and East Africa.</p>
            <div className="site-footer-trust">
              <ShieldCheck className="size-4 text-[#9bd4a9]" />
              <span>Offline-ready · Distinct owner & operator access · Built for the field</span>
            </div>
          </div>
          <div className="site-footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#roles">Roles</a>
            <a href="#how-it-works">How it works</a>
          </div>
          <div className="site-footer-col">
            <h4>Account</h4>
            <Link href="/login">Sign in</Link>
            <Link href="/register">Register</Link>
            <span className="text-[#779887]">Demo: farmer@urora.farm</span>
          </div>
          <div className="site-footer-col">
            <h4>Contact</h4>
            <a href="mailto:hello@urora.farm">hello@urora.farm</a>
            <span className="text-[#779887]">Nyagatare · Rwanda</span>
          </div>
        </div>
        <div className="site-footer-bottom">
          <small>© 2026 Urora Smart. Built for the people who feed us.</small>
          <div className="site-footer-bottom-links">
            <a href="#features">Features</a>
            <Link href="/login">Sign in</Link>
            {session ? <Link href="/dashboard">Dashboard</Link> : <Link href="/register">Get started</Link>}
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof Beef; title: string; text: string }) {
  return (
    <article className="landing-feature">
      <div className="landing-feature-icon">
        <Icon className="size-5" />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function HowStep({
  n,
  icon: Icon,
  title,
  text,
}: {
  n: string;
  icon: typeof Beef;
  title: string;
  text: string;
}) {
  return (
    <li className="how-step-card">
      <span className="how-step-number">{n}</span>
      <div className="grid size-11 place-items-center rounded-xl bg-[#e4f0e4] text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="text-[18px] font-semibold tracking-[-0.3px]">{title}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-[#5f7368]">{text}</p>
      </div>
    </li>
  );
}
