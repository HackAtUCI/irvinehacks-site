import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Guest Login | IrvineHacks 2025",
};

export default function Page() {
	redirect("/");
}
