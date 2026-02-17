import { GovalyHeader } from "@/components/layout/GovalyHeader";
import { Footer } from "@/components/layout/Footer";
import { MobileNotificationsPage } from "@/components/mobile/MobileNotificationsPage";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NotificationsPage() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileNotificationsPage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GovalyHeader />
      <main className="flex-1 bg-secondary/30">
        <div className="container py-10">
          <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Notifications are currently available on mobile view.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
