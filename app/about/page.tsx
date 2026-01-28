import { ThemedPage } from "../(themed)/themed-page-wrapper"

export default function AboutPage() {
  return (
    <ThemedPage pageKey="about">
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">About NATURE</h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  National Awareness Training And Research For Urban-Rural Environment (Reg. No. 248)
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Our Vision</h2>
                <p className="text-muted-foreground text-lg">
                  To create a sustainable and equitable society where urban and rural communities thrive in harmony with nature, empowered through awareness, education, and collective action.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Our Mission</h2>
                <ul className="list-disc pl-4 text-muted-foreground text-lg space-y-2">
                  <li>Promote environmental awareness and conservation practices.</li>
                  <li>Bridge the gap between urban and rural development through research and training.</li>
                  <li>Empower marginalized communities with skills and resources.</li>
                  <li>Foster transparency and ethical governance in social work.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight mb-8 text-center">Our Journey</h2>
            <div className="relative border-l border-muted-foreground/20 ml-4 md:ml-0 space-y-8">
              <div className="mb-8 ml-6">
                <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-8 ring-background">
                  <svg
                    className="h-3 w-3 text-primary-foreground"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <h3 className="mb-1 text-lg font-semibold text-foreground">Inception</h3>
                <time className="mb-2 block text-sm font-normal leading-none text-muted-foreground">
                  Established in Jamshedpur
                </time>
                <p className="text-base font-normal text-muted-foreground">
                  NATURE Society was founded with a small group of dedicated volunteers.
                </p>
              </div>
              <div className="mb-8 ml-6">
                <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted ring-8 ring-background"></span>
                <h3 className="mb-1 text-lg font-semibold text-foreground">First Major Project</h3>
                <time className="mb-2 block text-sm font-normal leading-none text-muted-foreground">
                  Year 20XX
                </time>
                <p className="text-base font-normal text-muted-foreground">
                  Launched our first rural development initiative in Bagbera.
                </p>
              </div>
               <div className="mb-8 ml-6">
                <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted ring-8 ring-background"></span>
                <h3 className="mb-1 text-lg font-semibold text-foreground">Registration</h3>
                <time className="mb-2 block text-sm font-normal leading-none text-muted-foreground">
                  Reg No. 248
                </time>
                <p className="text-base font-normal text-muted-foreground">
                  Officially registered as a society to scale our impact.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    </ThemedPage>
  )
}
