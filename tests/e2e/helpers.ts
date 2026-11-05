import { PrismaClient } from "@prisma/client";

process.loadEnvFile(".env");

export const db = new PrismaClient();

export const DEMO = {
  admin: { email: "admin@innovations.demo", password: "Admin@12345" },
  buyer: { email: "demo@innovations.demo", password: "Demo@12345" },
  projectSlug: "aurelia-grove",
};

let phoneCounter = 0;

/** A valid, unique 10-digit Indian mobile number for each test run. */
export function uniquePhone() {
  phoneCounter += 1;
  const tail = String(Date.now()).slice(-8);
  return `9${tail}${phoneCounter % 10}${phoneCounter % 10}`.slice(0, 10);
}

export function uniqueEmail(label = "e2e") {
  return `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
}

export function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export async function cleanupPhone(phone: string) {
  await db.leadNote.deleteMany({ where: { inquiry: { phone } } });
  await db.inquiry.deleteMany({ where: { phone } });
  await db.siteVisit.deleteMany({ where: { phone } });
}

export async function cleanupUser(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return;
  await db.savedProject.deleteMany({ where: { userId: user.id } });
  await db.siteVisit.updateMany({ where: { userId: user.id }, data: { userId: null } });
  await db.inquiry.updateMany({ where: { assignedToId: user.id }, data: { assignedToId: null } });
  await db.leadNote.deleteMany({ where: { authorId: user.id } });
  await db.user.delete({ where: { id: user.id } });
}
