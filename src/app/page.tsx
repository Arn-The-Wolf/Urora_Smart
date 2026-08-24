import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Beef, ChevronRight, CloudOff, Droplets, HeartPulse, Package, ShieldCheck, SprayCan } from "lucide-react";
import { UroraWordmark } from "@/components/brand/logo";
import { getSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-full overflow-hidden bg-[#f4f7f1] text-[#173228]">
      <header className="landing-nav">
        <UroraWordmark />
        <nav className="landing-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#footer">Support</a>
        </nav>
        <div className="flex items-center gap-3.5">
          <Link href="/login" className="hidden text-sm font-bold text-[#315b49] sm:inline">Sign in</Link>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-3.5 py-2.5 text-xs font-bold text-white shadow-[0_8px_18px_#176b4526]">
            Get started <ChevronRight className="size-4" />
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-[1240px] items-center gap-12 px-4 py-12 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <div className="live-pill"><span /> BUILT FOR BETTER HERDS</div>
            <h1 className="mt-4 max-w-xl text-[46px] leading-[1.02] font-bold tracking-[-2.5px] md:text-6xl md:tracking-[-4px]">
              Run your dairy farm with <em className="text-earth not-italic">clarity.</em>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#6c7f75]">
              Urora Smart keeps your herd, milk, sick animals, vet stock, and tick-wash schedule in one calm workspace — including when the network drops.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-[18px] py-3.5 font-bold text-white shadow-[0_8px_18px_#176b4526]">
                Start managing your farm <ArrowUpRight className="size-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 font-bold text-[#315b49]">
                <span className="grid size-[26px] place-items-center rounded-full border border-[#b9cbbd] text-[9px]">▶</span>
                Open the demo farm
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-[11px] text-[#819188]">
              <ShieldCheck className="size-4 text-[#4c9b65]" />
              <span>Simple records</span><span>·</span>
              <span>Works offline</span><span>·</span>
              <span>Made for growing farms</span>
            </div>
          </div>
          <div className="relative grid min-h-[390px] place-items-center">
            <div className="absolute size-[390px] rounded-full bg-[#deecd9] blur-[2px]" />
            <div className="farm-card">
              <div className="flex items-center gap-2 text-[9px] tracking-[1.2px] text-[#9bc4a7]">
                <span className="size-1.5 rounded-full bg-[#8fd19b]" /> LIVE FARM OVERVIEW
                <span className="ml-auto text-[#6e9b80]">NYAGATARE</span>
              </div>
              <div className="mt-8 mb-6 flex items-end justify-between">
                <div>
                  <small className="block text-[11px] text-[#a7c5b1]">Milk collected today</small>
                  <strong className="block text-[45px] tracking-[-2px]">63.7 <i className="text-sm not-italic text-[#a7c5b1]">L</i></strong>
                </div>
                <div className="text-right text-[22px] text-[#e4b96f]">24°<small className="block text-[11px] text-[#a7c5b1]">Eastern Province</small></div>
              </div>
              <div className="mini-bars">{[42, 55, 48, 70, 62, 78, 68, 84, 76].map((height, i) => <i key={i} style={{ height: `${height}%` }} className={i === 8 ? "current" : ""} />)}</div>
              <div className="mt-4 flex justify-between text-[11px] text-[#a7c5b1]"><span><b className="text-white">1 sick</b> animal isolated</span><span className="text-[#98d6a2]">Tick spray due today</span></div>
            </div>
            <div className="floating-card left-0 bottom-8"><div className="grid size-[30px] place-items-center rounded-[9px] bg-[#e5f1e5] text-primary"><Beef className="size-4" /></div><div><strong>7 active cows</strong><span className="mt-0.5 block text-[10px] text-[#829087]">Nyagatare Hills Dairy</span></div><ShieldCheck className="size-4 text-[#4c9b65]" /></div>
            <div className="floating-card top-10 right-0 text-[#4b9261]"><Droplets className="size-4" /><div><strong>Record saved</strong><span className="mt-0.5 block text-[10px] text-[#829087]">Morning session</span></div></div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-[1240px] border-t border-[#dfe8df] px-4 py-16 md:px-8 md:py-24">
          <p className="text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">EVERYTHING IN ONE PLACE</p>
          <h2 className="mt-2 max-w-lg text-4xl tracking-[-1.7px]">Less guesswork. More good days.</h2>
          <p className="mt-3 max-w-lg text-[#718079]">Know what is happening in the kraal without chasing notebooks.</p>
          <div className="mt-11 grid gap-4 md:grid-cols-3">
            <Feature icon={Beef} title="Know every animal" text="Tag, breed, mother, status, and the notes you actually use." />
            <Feature icon={Droplets} title="Track milk simply" text="Log morning, midday, and evening sessions in seconds." />
            <Feature icon={HeartPulse} title="Sick animals & health" text="Isolate, treat, and follow vaccinations without losing the thread." />
            <Feature icon={Package} title="Vet stock & salt" text="Medicines, acaricide, salt blocks, and reorder alerts." />
            <Feature icon={SprayCan} title="Tick wash in treated water" text="Record spray or dip mix, never confuse it with drinking water." />
            <Feature icon={CloudOff} title="Works without signal" text="Queue the day’s records in the field, sync when you get coverage." />
          </div>
        </section>

        <section id="how-it-works" className="mx-auto grid max-w-[1240px] gap-10 px-4 pb-24 md:grid-cols-[0.8fr_1.2fr] md:px-8">
          <div>
            <p className="text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">A CALMER ROUTINE</p>
            <h2 className="mt-2 text-4xl tracking-[-1.7px]">From morning milking to the next tick spray.</h2>
          </div>
          <div className="flex flex-col gap-6">
            <Step n="01" title="Set up your herd and store" text="Add cows, medicines, salt, and acaricide once." />
            <Step n="02" title="Record the day’s work" text="Milk, treatments, and chemically treated washes as they happen." />
            <Step n="03" title="See what is due tomorrow" text="Sick animals, low stock, and the next spray date sit on the home screen." />
          </div>
        </section>
      </main>

      <footer id="footer" className="landing-footer">
        <UroraWordmark light />
        <p>Practical tools for healthier herds and stronger farms in Rwanda.</p>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/login">Sign in</Link>
          <a href="mailto:hello@urora.farm">Contact</a>
        </div>
        <small>© 2026 Urora Smart. Built for the people who feed us.</small>
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof Beef; title: string; text: string }) {
  return (
    <article className="relative min-h-[190px] rounded-[15px] border border-[#dfe8df] bg-white p-6">
      <div className="grid size-[39px] place-items-center rounded-[11px] bg-[#e4f0e4] text-primary"><Icon className="size-5" /></div>
      <h3 className="mt-5 text-[17px] font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-[#718079]">{text}</p>
      <ChevronRight className="absolute right-5 bottom-6 size-4 text-[#8aa193]" />
    </article>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="flex gap-5 border-b border-[#dfe8df] pb-5">
      <span className="font-mono text-xs text-earth">{n}</span>
      <div>
        <h3 className="text-[17px] font-semibold">{title}</h3>
        <p className="mt-1 text-[13px] text-[#718079]">{text}</p>
      </div>
    </div>
  );
}
