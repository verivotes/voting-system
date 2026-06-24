import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export async function sendOtpEmail(to: string, otp: string, fullName: string) {
  await transporter.sendMail({
    from: `"VeriVotes" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your VeriVotes Verification Code',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
        <div style="margin-bottom: 32px;">
          <div style="width: 32px; height: 32px; background: #000; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="color: white; font-weight: bold; font-size: 14px;">V</span>
          </div>
          <h1 style="font-size: 20px; font-weight: 600; color: #000; margin: 0 0 8px;">Verify your email</h1>
          <p style="font-size: 14px; color: #6b7280; margin: 0;">Hi ${fullName}, use the code below to verify your VeriVotes account.</p>
        </div>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
          <p style="font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px;">Verification Code</p>
          <p style="font-size: 36px; font-weight: 700; color: #000; letter-spacing: 0.15em; margin: 0; font-family: monospace;">${otp}</p>
          <p style="font-size: 12px; color: #9ca3af; margin: 12px 0 0;">Expires in 10 minutes</p>
        </div>

        <p style="font-size: 13px; color: #9ca3af; margin: 0;">If you did not create a VeriVotes account, you can safely ignore this email.</p>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #d1d5db; margin: 0;">VeriVotes · Lead City University · Transparent Electoral Management</p>
        </div>
      </div>
    `
  })
}

export async function sendElectionNotificationEmail(to: string, fullName: string, electionTitle: string, status: string) {
  const statusMessages: Record<string, { subject: string; body: string }> = {
    OPEN: {
      subject: `Voting is now open — ${electionTitle}`,
      body: `The election "<strong>${electionTitle}</strong>" is now open for voting. Log in to VeriVotes to cast your ballot.`
    },
    CLOSED: {
      subject: `Voting has closed — ${electionTitle}`,
      body: `Voting for "<strong>${electionTitle}</strong>" has now closed. Results will be published shortly.`
    },
    RESULTS_PUBLISHED: {
      subject: `Results published — ${electionTitle}`,
      body: `The official results for "<strong>${electionTitle}</strong>" have been published. Log in to VeriVotes to view the results.`
    }
  }

  const msg = statusMessages[status]
  if (!msg) return

  await transporter.sendMail({
    from: `"VeriVotes" <${process.env.EMAIL_USER}>`,
    to,
    subject: msg.subject,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 20px; font-weight: 600; color: #000; margin: 0 0 8px;">${msg.subject}</h1>
          <p style="font-size: 14px; color: #6b7280; margin: 0;">Hi ${fullName},</p>
        </div>
        <p style="font-size: 14px; color: #374151;">${msg.body}</p>
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #d1d5db; margin: 0;">VeriVotes · Lead City University · Transparent Electoral Management</p>
        </div>
      </div>
    `
  })
}
module.exports = { sendOtpEmail, sendElectionNotificationEmail }