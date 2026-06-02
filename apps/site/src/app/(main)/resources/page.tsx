import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Resources | IrvineHacks 2024",
};

export default function Resources() {
	redirect("/");
}
