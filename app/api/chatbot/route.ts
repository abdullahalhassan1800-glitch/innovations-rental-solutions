import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin, fromError, getClientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

const chatSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(1, "Phone is required").max(20),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

const EMAIL_TO = process.env.CHATBOT_EMAIL_TO || "irs@innovationsrentalsolutions.com";

function createTransport() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const ip = getClientIp(request);
    const limit = rateLimit(`chatbot:${ip}`, 10, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const input = chatSchema.parse(await request.json());

    // Save to database
    await db.inquiry.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        inquiryType: "GENERAL",
        message: input.message,
        source: "chatbot",
        status: "NEW",
      },
    });

    // Try to send email
    const transport = createTransport();
    if (transport) {
      await transport.sendMail({
        from: `"Housirentz Chatbot" <${process.env.EMAIL_USER}>`,
        to: EMAIL_TO,
        subject: "New Chatbot Message - Housirentz Innovations",
        text: `
Name: ${input.name}
Phone: ${input.phone}
Email: ${input.email || "Not provided"}
Message: ${input.message}
Source: Website Chatbot
        `,
        html: `
          <h2>New Chatbot Message</h2>
          <p><strong>Name:</strong> ${input.name}</p>
          <p><strong>Phone:</strong> ${input.phone}</p>
          <p><strong>Email:</strong> ${input.email || "Not provided"}</p>
          <p><strong>Message:</strong> ${input.message}</p>
          <p><strong>Source:</strong> Website Chatbot</p>
        `,
      });
    }

    return NextResponse.json({ success: true, message: "Message sent successfully" }, { status: 200 });
  } catch (error) {
    return fromError(error);
  }
}