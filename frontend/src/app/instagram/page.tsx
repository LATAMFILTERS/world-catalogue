import { Barlow, Chakra_Petch } from "next/font/google";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata = {
  title: "Instagram | ELIMFILTERS Total Asset Protection",
  description:
    "ELIMFILTERS Total Asset Protection landing page for part search, distributor inquiries, and industrial filtration systems.",
};

const panel =
  "group relative overflow-hidden border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:border-yellow-400/60 hover:bg-yellow-400/[0.06]";

const buttonBase =
  "relative overflow-hidden border px-8 py-4 text-center text-sm font-black uppercase tracking-[0.22em] transition duration-300";

export default function InstagramLandingPage() {
  return (
    <main className={`${barlow.className} min-h-screen overflow-hidden bg-black text-white`}>
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.06)_0,transparent_34%,rgba(250,204,21,0.08)_100%)]" />
        <div className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-20 [background-image:linear-gradient(110deg,transparent_0%,transparent_45%,rgba(250,204,21,0.22)_46%,transparent_48%,transparent_100%)]" />

        <div className="relative z-10 flex w-full flex-col items-center">
          <img
            src="/images/logo-sin-fondo.avif"
            alt="ELIMFILTERS"
            className="mb-7 h-auto w-60 drop-shadow-[0_0_32px_rgba(250,204,21,0.18)] md:w-80"
          />

          <div
            className={`${chakra.className} mb-5 border border-yellow-400/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.32em] text-yellow-400`}
          >
            Industrial Filtration Intelligence
          </div>

          <h1
            className={`${chakra.className} max-w-5xl text-5xl font-bold uppercase leading-[0.9] tracking-[-0.04em] md:text-8xl`}
          >
            Total Asset
            <span className="block text-yellow-400">Protection</span>
          </h1>

          <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-white/72 md:text-xl">
            Industrial filtration systems engineered to protect engines, fuel,
            hydraulic, air intake and cooling systems from contamination,
            premature wear and costly downtime.
          </p>

          <div className="mt-10 grid w-full max-w-3xl gap-4 md:grid-cols-3">
            <a
              href="https://part-search.elimfilters.com"
              className={`${chakra.className} ${buttonBase} border-yellow-400 bg-yellow-400 text-black hover:bg-white`}
            >
              Find Your Part
            </a>

            <a
              href="/distributor-application"
              className={`${chakra.className} ${buttonBase} border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black`}
            >
              Distributors
            </a>

            <a
              href="/contact"
              className={`${chakra.className} ${buttonBase} border-white/30 text-white hover:border-white hover:bg-white hover:text-black`}
            >
              Contact Sales
            </a>
          </div>

          <div className="mt-16 grid w-full gap-4 text-left md:grid-cols-3">
            <div className={panel}>
              <div className={`${chakra.className} mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/35`}>
                01 / Protection
              </div>
              <h2 className={`${chakra.className} text-2xl font-bold uppercase tracking-tight text-yellow-400`}>
                What We Protect
              </h2>
              <p className="mt-4 text-sm font-medium leading-6 text-white/65">
                Engines, hydraulics, fuel systems, air intake systems and
                cooling circuits operating under real industrial pressure.
              </p>
            </div>

            <div className={panel}>
              <div className={`${chakra.className} mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/35`}>
                02 / Technology
              </div>
              <h2 className={`${chakra.className} text-2xl font-bold uppercase tracking-tight text-yellow-400`}>
                Filtration Systems
              </h2>
              <p className="mt-4 text-sm font-medium leading-6 text-white/65">
                MACROCORE™, SYNTEPORE™, NANOFORCE™, SYNTRAX™,
                HYDROCORE™ and THERMACORE™ technologies for critical assets.
              </p>
            </div>

            <div className={panel}>
              <div className={`${chakra.className} mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/35`}>
                03 / Industries
              </div>
              <h2 className={`${chakra.className} text-2xl font-bold uppercase tracking-tight text-yellow-400`}>
                Severe Duty
              </h2>
              <p className="mt-4 text-sm font-medium leading-6 text-white/65">
                Fleets, mining, construction, agriculture, marine, oil & gas,
                power generation and heavy-duty equipment.
              </p>
            </div>
          </div>

          <p
            className={`${chakra.className} mt-14 max-w-4xl text-2xl font-bold uppercase leading-tight tracking-[0.08em] text-yellow-400 md:text-4xl`}
          >
            Protect the asset. Reduce downtime. Extend service life.
          </p>
        </div>
      </section>
    </main>
  );
}
