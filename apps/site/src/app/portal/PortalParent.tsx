import getUserIdentity from "@/lib/utils/getUserIdentity";

import Portal from "./Portal";

async function PortalParent() {
	const identity = await getUserIdentity();
	return <Portal identity={identity} />;
}

export default PortalParent;
