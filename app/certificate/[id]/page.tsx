
import { auth } from "@/auth"
import prisma from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { requireAnyAdminAccess } from "@/lib/roles"

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const internship = await prisma.internshipApplication.findUnique({
    where: { id: params.id },
    include: { domain: true }
  })

  if (!internship) notFound()

  // Security Check
  const isAdmin = await requireAnyAdminAccess().then(() => true).catch(() => false)
  const isOwner = internship.userId === session.user.id
  
  // Only completed internships get certificates
  if (internship.status !== "Completed") {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow border text-center max-w-md">
                <h1 className="text-xl font-bold text-red-600 mb-2">Certificate Not Available</h1>
                <p className="text-muted-foreground">
                    This internship is not marked as completed. Please contact the administrator.
                </p>
            </div>
        </div>
    )
  }

  // Access Control: Only Owner or Admin can view
  if (!isOwner && !isAdmin) {
     redirect("/")
  }

  const completedDate = internship.completedAt || new Date()
  const startDate = internship.startDate || internship.createdAt
  const diffTime = Math.abs(completedDate.getTime() - startDate.getTime())
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 print:bg-white print:p-0">
        <div className="no-print mb-6 flex gap-4">
            <button 
                // Using simple window.print() via inline script or just letting user use browser menu
                // We'll add a script for the button
                className="bg-emerald-600 text-white px-6 py-2 rounded shadow hover:bg-emerald-700 font-medium"
                // onClick="window.print()" - React needs client component for onClick, 
                // so we'll use a simple CSS class for print hiding and let user use browser print
            >
                Use Browser Print (Ctrl+P) to Save as PDF
            </button>
        </div>

        <div className="bg-white w-[297mm] h-[210mm] shadow-2xl p-12 relative flex flex-col items-center justify-center text-center border-[20px] border-double border-emerald-900 print:shadow-none print:w-full print:h-screen print:border-[10px]">
            {/* Background Watermark/Decoration could go here */}
            
            <div className="absolute top-12 left-12">
                <h2 className="text-2xl font-bold text-emerald-900">NATURE Society</h2>
            </div>

            <div className="max-w-4xl w-full space-y-8">
                <h1 className="text-6xl font-serif text-emerald-900 mb-12 uppercase tracking-wider">Certificate</h1>
                
                <p className="text-xl text-gray-600 font-serif italic">of Internship Completion</p>

                <p className="text-lg text-gray-800">
                    This is to certify that
                </p>

                <h2 className="text-4xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 inline-block min-w-[400px]">
                    {internship.name}
                </h2>

                <p className="text-lg text-gray-800 leading-relaxed max-w-2xl mx-auto">
                    has completed internship over here for <strong className="text-emerald-900">{diffDays} days</strong> in the domain of
                    <br/>
                    <strong className="text-xl text-emerald-800">{internship.domain?.title || "General Studies"}</strong>
                    <br/>
                    at NATURE Society. We bless him or her for a better future.
                </p>

                <div className="flex items-center justify-center gap-2 text-gray-600 my-6">
                    {internship.duration && (
                        <span>Planned Duration: <strong>{internship.duration}</strong></span>
                    )}
                    <span>•</span>
                    <span>Completed On: <strong>{completedDate.toLocaleDateString()}</strong></span>
                </div>

                <div className="mt-24 flex justify-between items-end w-full px-20">
                    <div className="text-center">
                        <div className="w-48 border-t border-gray-400 mb-2"></div>
                        <p className="font-bold text-emerald-900">Program Director</p>
                    </div>
                    
                    <div className="w-24 h-24 relative opacity-80">
                         {/* Seal Placeholder */}
                         <div className="absolute inset-0 border-4 border-emerald-900 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-900 text-center uppercase">Nature<br/>Society<br/>Seal</span>
                         </div>
                    </div>

                    <div className="text-center">
                        <div className="w-48 border-t border-gray-400 mb-2"></div>
                        <p className="font-bold text-emerald-900">President</p>
                    </div>
                </div>
            </div>
            
             <div className="absolute bottom-4 text-[10px] text-gray-400">
                Certificate ID: {internship.id} | Verify at naturesociety.org/verify/{internship.id}
            </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
            @media print {
                .no-print { display: none !important; }
                body { background: white; }
                @page { size: landscape; margin: 0; }
            }
        `}} />
    </div>
  )
}
