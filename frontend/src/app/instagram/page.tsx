export const metadata = {
  title: "Instagram | ELIMFILTERS Total Asset Protection",
  description:
    "Explore ELIMFILTERS industrial filtration technologies, find equivalent parts, and connect with our commercial team for heavy-duty asset protection.",
};

export default function InstagramPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        <img
          src="/assets/logo-elimfilters.png"
          alt="ELIMFILTERS"
          className="mb-8 h-auto w-56 md:w-72"
        />

        <h1 className="text-4xl font-black uppercase tracking-tight md:text-6xl">
          Total Asset Protection
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">
          Industrial filtration systems engineered to protect heavy-duty
          equipment, fleets and critical assets from contamination, failures
          and downtime.
        </p>

        <div className="mt-10 flex w-full max-w-xl flex-col gap-4">
          <a
            href="https://part-search.elimfilters.com"
            className="rounded-full bg-yellow-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black"
          >
            Find Your Part
          </a>

          <a
            href="/distributor-application"
            className="rounded-full border border-yellow-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-yellow-300"
          >
            Become a Distributor
          </a>

          <a
            href="/contact"
            className="rounded-full border border-white/30 px-8 py-4 text-sm font-black uppercase tracking-wide text-white"
          >
            Contact Sales
          </a>
        </div>

        <div className="mt-16 grid w-full gap-4 text-left md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="font-black text-yellow-400">What We Protect</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Engines, fuel systems, hydraulic circuits, lubrication systems,
              air intake, cooling systems and operator environments.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="font-black text-yellow-400">Technologies</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              MACROCORE, SYNTEPORE, HYDROCORE, SYNTRAX, NANOFORCE,
              THERMACORE, MICROKAPPA, DRYCORE and INTEKCORE.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="font-black text-yellow-400">Industries</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Mining, construction, agriculture, truck fleets, oil and gas,
              power generation, marine and manufacturing.
            </p>
          </div>
        </div>

        <p className="mt-14 max-w-3xl text-xl font-black uppercase text-yellow-400">
          Protect the asset. Control the contamination. Reduce downtime.
        </p>
      </section>
    </main>
  );
}
