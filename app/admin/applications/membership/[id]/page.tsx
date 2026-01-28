import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { requireRole } from "@/lib/roles"
import { ApplicationMessageThread } from "@/components/application-message-thread"
import { updateApplicationStatus } from "@/app/actions/applications"
import Link from "next/link"

export default async function AdminMembershipApplicationPage({ params }: { params: { id: string } }) {
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN", "SECRETARY", "PRESIDENT"], "manage_applications")
  
  const { auth } = await import("@/auth")
  const session = await auth()

  const app = await prisma.membershipApplication.findUnique({
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

  return (
    <div className="container max-w-5xl py-8">
      <Link href="/admin/applications" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Applications
      </Link>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
           <div className="flex items-center justify-between mb-2">
             <h1 className="text-2xl font-bold">Membership Application</h1>
           </div>
           
           <div className="bg-card rounded-lg border p-6 space-y-6 mb-6">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{app.name}</h3>
                  <div className="text-sm text-muted-foreground">{app.email}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-amber-100 text-amber-800 border-amber-200'
                 }`}>
                   {app.status}
                </div>
             </div>
             
             <div className="space-y-4 pt-4 border-t">
               <div>
                 <label className="text-xs font-medium text-muted-foreground">Membership Type</label>
                 <div className="font-medium">{app.membershipType}</div>
               </div>
               <div>
                 <label className="text-xs font-medium text-muted-foreground">Applied On</label>
                 <div className="font-medium">{new Date(app.createdAt).toLocaleString()}</div>
               </div>
             </div>
           </div>

           <div className="bg-card rounded-lg border p-6">
             <h3 className="font-semibold mb-4">Update Status</h3>
             <form action={updateApplicationStatus} className="flex gap-2">
                <input type="hidden" name="id" value={app.id} />
                <input type="hidden" name="type" value="membership" />
                <select 
                  name="status" 
                  defaultValue={app.status}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Update
                </button>
             </form>
           </div>
        </div>
        
        <div>
          <ApplicationMessageThread 
            messages={app.messages} 
            applicationId={app.id} 
            applicationType="membership"
            currentUserId={session?.user?.id || ""}
            isAdmin={true}
          />
        </div>
      </div>
    </div>
  )
}
