import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Log In | IrvineHacks 2024",
};

export default function Login() {
	redirect("/");
}
