import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ChatBot } from "@/components/ai/chat-bot";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <SiteHeader user={user ? { name: user.name, role: user.role } : null} />
      <main id="main">{children}</main>
      <SiteFooter />
      <ChatBot />
    </>
  );
}
