import dbConnect from "@/lib/db";
import SiteContent from "@/models/SiteContent";
import AdminPagesClient from "./AdminPagesClient";

export default async function AdminPagesPage() {
  await dbConnect();
  const content = await SiteContent.find({}).lean();

  return <AdminPagesClient initialContent={JSON.parse(JSON.stringify(content))} />;
}
