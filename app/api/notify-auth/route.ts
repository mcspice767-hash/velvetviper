import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const body = await request.json();
  const { type, email, timestamp, country, city } = body;

  await resend.emails.send({
    from: 'VelvetViper <noreply@velvetviper.com>',
    to: 'reptilelizard48@gmail.com',
    subject: type === 'signup'
      ? '🐍 New User Signed Up - VelvetViper'
      : '👤 User Logged In - VelvetViper',
    html: `
      <h2>${type === 'signup' ? '🐍 New User Signed Up' : '👤 User Logged In'}</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Time:</strong> ${timestamp}</p>
      <p><strong>Country:</strong> ${country || 'Unknown'}</p>
      <p><strong>City:</strong> ${city || 'Unknown'}</p>
      <hr/>
      <p>Login to admin dashboard to view all users.</p>
    `
  });

  return Response.json({ success: true });
}
