import getUserIdentity from "@/lib/utils/getUserIdentity";
import Navbar from "./Navbar";

export default async function NavbarParent() {
	const identity = await getUserIdentity();

	return <Navbar identity={identity} />;
}
