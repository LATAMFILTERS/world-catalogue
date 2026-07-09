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
  "group relative overflow-hidden border border-white/10 bg-black/45 p-5 backdrop-blur-sm transition duration-300 hover:border-yellow-400/70 hover:bg-yellow-400/[0.07] md:p-6";

const buttonBase =
  "relative overflow-hidden border px-7 py-4 text-center text-xs font-black uppercase tracking-[0.24em] transition duration-300 md:text-sm";

const statBox =
  "border border-white/10 bg-white/[0.035] px-4 py-3 text-center";

export default function InstagramLandingPage() {
  return (
    <main className={`${barlow.className} min-h-screen overflow-hidden bg-black text-white`}>
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-5 py-8 text-center md:px-8 md:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.20),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.055)_0,transparent_32%,rgba(250,204,21,0.08)_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-yellow-400/70" />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-white/10 md:block" />
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(112deg,transparent_0%,transparent_43%,rgba(250,204,21,0.24)_44%,transparent_46%,transparent_100%)]" />

        <div className="relative z-10 flex w-full flex-col items-center">
          <img
            src="/images/logo-sin-fondo.avif"
            alt="ELIMFILTERS"
            className="mb-5 h-auto w-56 brightness-125 contrast-125 drop-shadow-[0_0_38px_rgba(250,204,21,0.24)] md:mb-6 md:w-72"
          />

          <div
            className={`${chakra.className} mb-5 border border-yellow-400/45 bg-black/45 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.34em] text-yellow-400 md:text-xs`}
          >
            Engineered For Severe Duty Operations
          </div>

          <h1
            className={`${chakra.className} max-w-6xl text-[3.2rem] font-bold uppercase leading-[0.86] tracking-[-0.055em] md:text-[7.4rem]`}
          >
            Total Asset
            <span className="block text-yellow-400">Protection</span>
          </h1>

          <p className="mt-6 max-w-3xl text-base font-semibold leading-7 text-white/82 md:mt-7 md:text-xl md:leading-8">
            Protect engines, fuel, hydraulic, air intake and cooling systems
            from contamination, wear and costly downtime.
          </p>

          <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-3 md:mt-9 md:grid-cols-3">
            <a
              href="https://part-search.elimfilters.com"
              className={`${chakra.className} ${buttonBase} border-yellow-400 bg-yellow-400 text-black shadow-[0_0_28px_rgba(250,204,21,0.22)] hover:bg-white`}
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

          <div className="mt-8 grid w-full max-w-4xl grid-cols-3 gap-2 md:mt-10 md:gap-3">
            <div className={statBox}>
              <div className={`${chakra.className} text-lg font-bold text-yellow-400 md:text-2xl`}>
                20K+
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 md:text-[10px]">
                Crossrefs
              </div>
            </div>

            <div className={statBox}>
              <div className={`${chakra.className} text-lg font-bold text-yellow-400 md:text-2xl`}>
                HD / LD
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 md:text-[10px]">
                Coverage
              </div>
            </div>

            <div className={statBox}>
              <div className={`${chakra.className} text-lg font-bold text-yellow-400 md:text-2xl`}>
                OEM
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 md:text-[10px]">
                Reference
              </div>
            </div>
          </div>

          <div className="mt-8 grid w-full gap-3 text-left md:mt-10 md:grid-cols-3 md:gap-4">
            <div className={panel}>
              <div className={`${chakra.className} mb-3 text-[10px] font-bold uppercase tracking-[0.32em] text-white/35`}>
                01 / Protection
              </div>
              <h2 className={`${chakra.className} text-xl font-bold uppercase tracking-tight text-yellow-400 md:text-2xl`}>
                What We Protect
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-white/68">
                Engines, hydraulics, fuel systems, air intake systems and
                cooling circuits under real industrial pressure.
              </p>
            </div>

            <div className={panel}>
              <div className={`${chakra.className} mb-3 text-[10px] font-bold uppercase tracking-[0.32em] text-white/35`}>
                02 / Technology
              </div>
              <h2 className={`${chakra.className} text-xl font-bold uppercase tracking-tight text-yellow-400 md:text-2xl`}>
                Filtration Systems
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-white/68">
                MACROCORE™, SYNTEPORE™, NANOFORCE™, SYNTRAX™,
                HYDROCORE™ and THERMACORE™ technologies.
              </p>
            </div>

            <div className={panel}>
              <div className={`${chakra.className} mb-3 text-[10px] font-bold uppercase tracking-[0.32em] text-white/35`}>
                03 / Industries
              </div>
              <h2 className={`${chakra.className} text-xl font-bold uppercase tracking-tight text-yellow-400 md:text-2xl`}>
                Severe Duty
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-white/68">
                Fleets, mining, construction, agriculture, marine, oil & gas,
                power generation and heavy-duty equipment.
              </p>
            </div>
          </div>

          <p
            className={`${chakra.className} mt-8 max-w-5xl text-xl font-bold uppercase leading-tight tracking-[0.08em] text-yellow-400 md:mt-10 md:text-3xl`}
          >
            Protect the asset. Reduce downtime. Extend service life.
          </p>
        </div>
      </section>
    </main>
  );
}
