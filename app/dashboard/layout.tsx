import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNavigation from "@/components/DashboardNavigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  return (
    <DashboardNavigation user={session.user}>
      {children}
    </DashboardNavigation>
  );
}