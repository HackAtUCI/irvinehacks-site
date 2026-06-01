import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Volunteer Application | IrvineHacks 2025",
};

export default function Page() {
	redirect("/");
}
