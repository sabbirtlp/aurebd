import dbConnect from "@/lib/db";
import User from "@/models/User";
import styles from "../admin.module.css";

export default async function AdminCustomersPage() {
  await dbConnect();
  const users = await User.find({}).sort({ createdAt: -1 }).lean();
  
  const customers = users.filter((u: any) => u.role === "user");
  const admins = users.filter((u: any) => u.role === "admin");

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Customers</h2>
          <p className={styles.pageSubtitle}>{customers.length} customers, {admins.length} admins</p>
        </div>
      </div>

      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Registered Users</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user._id.toString()}>
                <td style={{ fontWeight: 600 }}>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`${styles.badge} ${user.role === "admin" ? styles.badgeProcessing : styles.badgeSuccess}`}>
                    {user.role === "admin" ? "Admin" : "Customer"}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <div className={styles.emptyState}>
                    <p>No users registered yet</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
