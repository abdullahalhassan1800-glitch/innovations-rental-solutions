import { db } from "./db";
import type { SessionUser } from "./auth";

function contactFilters(user: Pick<SessionUser, "email" | "phone">) {
  return [
    ...(user.email ? [{ email: user.email }] : []),
    ...(user.phone ? [{ phone: user.phone }] : []),
  ];
}

export async function getAccountActivity(user: SessionUser) {
  const contact = contactFilters(user);
  const [inquiries, visits, savedCount] = await Promise.all([
    contact.length
      ? db.inquiry.findMany({
          where: { OR: contact },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            name: true,
            phone: true,
            inquiryType: true,
            message: true,
            status: true,
            source: true,
            createdAt: true,
            projectName: true,
            project: { select: { name: true, slug: true } },
          },
        })
      : Promise.resolve([]),
    db.siteVisit.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(user.email ? [{ email: user.email }] : []),
          ...(user.phone ? [{ phone: user.phone }] : []),
        ],
      },
      orderBy: { preferredDate: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        phone: true,
        preferredDate: true,
        preferredTime: true,
        message: true,
        status: true,
        createdAt: true,
        project: { select: { name: true, slug: true } },
      },
    }),
    db.savedProject.count({ where: { userId: user.id } }),
  ]);

  return { inquiries, visits, savedCount };
}
