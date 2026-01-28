import prisma from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { ApplicationMessageThread } from "@/components/application-message-thread"
import Link from "next/link"

export default async function VolunteerApplicationPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const app = await prisma.volunteerApplication.findUnique({
    where: { id: params.id },
    include: {
      messages: {
        include: {
          attachments: true,
          parent: {
            select: {
              senderName: true,
              message: true
            }
          }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  })

  if (!app) notFound()

  // Authorization check
  if (app.userId && app.userId !== session.user.id) {
     if (app.email !== session.user.email) {
        return <div className="p-8 text-center text-red-500">Unauthorized access</div>
     }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Dashboard
      </Link>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
           <h1 className="text-2xl font-bold mb-2">Volunteer Application</h1>
           <div className="flex items-center gap-2 mb-6">
             <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                app.status === 'Onboarded' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                app.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                'bg-amber-100 text-amber-800 border-amber-200'
             }`}>
               {app.status}
             </span>
             <span className="text-muted-foreground text-sm">
               {new Date(app.createdAt).toLocaleDateString()}
             </span>
           </div>
           
           <div className="bg-card rounded-lg border p-6 space-y-4">
             <div>
               <label className="text-xs font-medium text-muted-foreground">Skills</label>
               <div className="font-medium whitespace-pre-wrap">{app.skills || "-"}</div>
             </div>
             <div>
               <label className="text-xs font-medium text-muted-foreground">Phone</label>
               <div className="font-medium">{app.phone || "-"}</div>
             </div>
           </div>
        </div>
        
        <div>
          <ApplicationMessageThread 
            messages={app.messages} 
            applicationId={app.id} 
            applicationType="volunteer"
            currentUserId={session.user.id}
          />
        </div>
      </div>
    </div>
  )
}
