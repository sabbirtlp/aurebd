import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import CategoriesClient from "./CategoriesClient";

export const metadata = {
  title: "Category Management - Aurea BD",
};

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin");
  }

  return <CategoriesClient />;
}
