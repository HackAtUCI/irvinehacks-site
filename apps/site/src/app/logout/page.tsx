import { redirect } from "next/navigation";
import api from "@/lib/utils/api";

export default async function Logout() {
	await api.get<string>("/user/logout");
	redirect("/");
}
