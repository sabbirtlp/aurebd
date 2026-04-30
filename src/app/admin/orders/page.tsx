import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  await dbConnect();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

  return <AdminOrdersClient initialOrders={JSON.parse(JSON.stringify(orders))} />;
}
