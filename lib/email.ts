
// Mock Email Service
// In a real app, this would use nodemailer, SendGrid, AWS SES, etc.

export async function sendEmail({ 
    to, 
    subject, 
    html 
}: { 
    to: string; 
    subject: string; 
    html: string 
}) {
    console.log(`
    ==================================================
    [MOCK EMAIL SERVICE]
    To: ${to}
    Subject: ${subject}
    --------------------------------------------------
    ${html}
    ==================================================
    `)
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true }
}

export async function sendWelcomeEmail(email: string, organizationName: string) {
    const subject = "Welcome to NATURE Society Partner Program"
    const html = `
        <h1>Welcome, ${organizationName}!</h1>
        <p>Your institution account has been approved by our administrators.</p>
        <p>You can now log in to your dashboard and start enrolling candidates for our internship programs.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/institution/dashboard">Go to Dashboard</a></p>
    `
    return sendEmail({ to: email, subject, html })
}

export async function sendEnrollmentConfirmation(
    studentEmail: string, 
    studentName: string, 
    course: string,
    institutionName: string
) {
    const subject = "Internship Enrollment Confirmation - NATURE Society"
    const html = `
        <h1>Hello ${studentName},</h1>
        <p>You have been successfully enrolled in the <strong>${course}</strong> internship program by <strong>${institutionName}</strong>.</p>
        <p>Your application is currently pending review. You will receive further updates soon.</p>
        <p>Welcome aboard!</p>
    `
    return sendEmail({ to: studentEmail, subject, html })
}

export async function sendCredentialsEmail(
    email: string,
    name: string,
    password: string
) {
    const subject = "Your Account Credentials - NATURE Society"
    const html = `
        <h1>Hello ${name},</h1>
        <p>An account has been created for you at NATURE Society.</p>
        <p><strong>Username:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please log in and change your password immediately.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login">Login Here</a></p>
    `
    return sendEmail({ to: email, subject, html })
}

export async function sendApplicationReceivedEmail(
    email: string,
    name: string,
    institution?: string | null
) {
    const subject = "Internship Application Received - NATURE Society"
    const html = `
        <h1>Hello ${name},</h1>
        <p>Thank you for applying for an internship with NATURE Society${institution ? ` at ${institution}` : ""}.</p>
        <p>We have received your application and it is currently under review.</p>
        <p>You can track the status of your application by logging into your dashboard.</p>
        <p>If you have not created an account yet, please use this email to sign up and track your progress.</p>
        <br/>
        <p>Best regards,</p>
        <p>NATURE Society Team</p>
    `
    return sendEmail({ to: email, subject, html })
}

export async function sendInternshipCompletionEmail(
    studentEmail: string,
    studentName: string,
    certificateUrl: string
) {
    const subject = "Internship Completed! Your Certificate is Ready"
    const html = `
        <h1>Congratulations, ${studentName}!</h1>
        <p>You have successfully completed your internship program.</p>
        <p>You can view and download your certificate using the link below:</p>
        <p><a href="${certificateUrl}">View Certificate</a></p>
    `
    return sendEmail({ to: studentEmail, subject, html })
}
