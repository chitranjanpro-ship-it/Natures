import Link from "next/link"
import prisma from "@/lib/db"
import { ThemedPage } from "./(themed)/themed-page-wrapper"

export default async function Home() {
  const [projectStats, featuredProjects] = await Promise.all([
    prisma.project.aggregate({
      _sum: { beneficiaries: true },
      _count: true,
      _max: { beneficiaries: true },
    }),
    prisma.project.findMany({
      orderBy: { startDate: "desc" },
      take: 3,
    }),
  ])

  const activeProjectsCount = await prisma.project.count({ where: { status: "Ongoing" } })

  const totalBeneficiaries = projectStats._sum.beneficiaries ?? 0
  const totalProjects = projectStats._count

  return (
    <ThemedPage pageKey="home">
    <main className="relative">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(12,58,35,0.6),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(16,78,60,0.7),transparent_50%)]" />
        <div className="container max-w-screen-2xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              National Awareness Training And Research For Urban-Rural Environment
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Bagbera, Jamshedpur • Registration No. 248
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center items-center">
              <Link href="/internships" className="h-11 px-6 inline-flex items-center justify-center rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium">Apply for Internship</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container max-w-screen-2xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/awareness" className="rounded-lg border bg-card text-card-foreground p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold">Awareness</h3>
            <p className="mt-2 text-sm text-muted-foreground">Community sessions on environment, hygiene, and sustainability.</p>
          </Link>
          <Link href="/training" className="rounded-lg border bg-card text-card-foreground p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold">Training</h3>
            <p className="mt-2 text-sm text-muted-foreground">Skill development for women, youth, and volunteers.</p>
          </Link>
          <Link href="/research" className="rounded-lg border bg-card text-card-foreground p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold">Research</h3>
            <p className="mt-2 text-sm text-muted-foreground">Evidence-based projects bridging urban-rural needs.</p>
          </Link>
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="container max-w-screen-2xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-lg border bg-card text-card-foreground p-6 text-center">
              <p className="text-4xl font-extrabold">
                {totalBeneficiaries > 0 ? totalBeneficiaries : "–"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Beneficiaries (approx.)</p>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground p-6 text-center">
              <p className="text-4xl font-extrabold">
                {totalProjects > 0 ? totalProjects : "–"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Total Projects</p>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground p-6 text-center">
              <p className="text-4xl font-extrabold">
                {activeProjectsCount > 0 ? activeProjectsCount : "–"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Active Projects</p>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground p-6 text-center">
              <p className="text-4xl font-extrabold">12k</p>
              <p className="mt-2 text-sm text-muted-foreground">Trees Planned</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container max-w-screen-2xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-bold">Featured Projects</h2>
          <Link href="/projects" className="text-sm underline">View all</Link>
        </div>
        {featuredProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add projects from the admin dashboard to highlight them here.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {featuredProjects.map((project: { id: string; title: string; description: string }) => (
              <article key={project.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-muted/40">
        <div className="container max-w-screen-2xl px-6 py-16">
          <div className="rounded-lg border bg-card text-card-foreground p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold">Join the movement</h3>
              <p className="mt-2 text-sm text-muted-foreground">Become a member or volunteer and contribute to real change.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/signup" className="h-10 px-4 rounded-md bg-primary text-primary-foreground">Sign Up</Link>
              <Link href="/join" className="h-10 px-4 rounded-md border border-border bg-card text-card-foreground">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container max-w-screen-2xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/about" className="rounded-lg border bg-card text-card-foreground p-6">
            <h3 className="text-xl font-semibold">About</h3>
            <p className="mt-2 text-sm text-muted-foreground">Vision, Mission, and our journey.</p>
          </Link>
          <Link href="/contact" className="rounded-lg border bg-card text-card-foreground p-6">
            <h3 className="text-xl font-semibold">Contact</h3>
            <p className="mt-2 text-sm text-muted-foreground">Reach out to our team.</p>
          </Link>
          <Link href="/donate" className="rounded-lg border bg-card text-card-foreground p-6">
            <h3 className="text-xl font-semibold">Donate</h3>
            <p className="mt-2 text-sm text-muted-foreground">Support ongoing initiatives.</p>
          </Link>
        </div>
      </section>
    </main>
    </ThemedPage>
  );
}
