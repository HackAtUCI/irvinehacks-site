import getUserIdentity from "@/lib/utils/getUserIdentity";
import Navbar from "./Navbar";
export interface Identity {
    uid: string | null;
    role: string | null;
    status: string | null;
}

export default async function NavbarParent() {
    const identity = await getUserIdentity();

    return <><Navbar identity={identity} /></>
}