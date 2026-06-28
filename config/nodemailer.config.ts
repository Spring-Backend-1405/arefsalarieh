import nodemailer from "nodemailer";
import "dotenv/config";

export async function sendEmail(to: string, subject: string, html: string) {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.log("Email envs r not available");
    return;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;

  const transporter = nodemailer.createTransport({
    // host,
    // port,
    // secure: false,
    // auth: {
    //   user,
    //   pass,
    // },
    service: "gmail",
    auth: {
      user: process.env.Email_User,
      pass: process.env.Email_Password,
    },
  });

  await transporter.sendMail({
    // from,
    from: process.env.Email_User,
    to,
    subject,
    html,
  });
}
