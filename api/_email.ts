import { Resend } from "resend";

type CompletionEmailParams = {
  to: string;
  customerName: string;
  racketBrand: string;
  stringModel: string;
  tension: number;
};

export const sendCompletionEmail = async ({
  to,
  customerName,
  racketBrand,
  stringModel,
  tension,
}: CompletionEmailParams) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const subject = "Your stringing is complete";

  await resend.emails.send({
    from,
    to,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Hi ${customerName},</h2>
        <p>Your badminton racket stringing is complete.</p>
        <p><strong>Details</strong></p>
        <ul>
          <li>Racket: ${racketBrand}</li>
          <li>String: ${stringModel}</li>
          <li>Tension: ${tension} lbs</li>
        </ul>
        <p>Please visit the store at your convenience to pick it up.</p>
        <p>Thank you for choosing us!</p>
      </div>
    `,
  });
};
