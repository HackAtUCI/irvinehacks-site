import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Schedule | IrvineHacks 2024",
};

export default function Schedule() {
	redirect("/");
}
