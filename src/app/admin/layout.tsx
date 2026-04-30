import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import styles from "./admin.module.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className={styles.adminContainer}>
      <AdminSidebar userName={session.user.name || "Admin"} />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
