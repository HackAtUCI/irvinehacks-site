import { Metadata } from "next";
import { redirect } from "next/navigation";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Schedule | IrvineHacks 2025",
};

export default async function Schedule() {
	redirect("/");
}
