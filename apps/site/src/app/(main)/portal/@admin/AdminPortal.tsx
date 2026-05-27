import { redirect } from "next/navigation";

function AdminPortal() {
	redirect("/admin/dashboard");
}

export default AdminPortal;
