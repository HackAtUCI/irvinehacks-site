import { notFound, redirect } from "next/navigation";

import { canViewPortalPreview } from "@/lib/admin/authorization";
import getUserIdentity from "@/lib/utils/getUserIdentity";

import PortalPreviewClient from "../../components/PortalPreviewClient";

const VALID_TYPES = ["hacker", "mentor", "volunteer"] as const;
type ApplicationType = (typeof VALID_TYPES)[number];

interface PageProps {
	params: { type: string; uid: string };
}

async function PortalPreviewPage({ params }: PageProps) {
	const { type, uid } = params;

	if (!VALID_TYPES.includes(type as ApplicationType)) {
		notFound();
	}

	const { uid: viewerUid, roles } = await getUserIdentity();

	if (viewerUid === null) {
		redirect("/login");
	}

	if (!canViewPortalPreview(roles)) {
		redirect("/unauthorized");
	}

	return (
		<PortalPreviewClient uid={uid} applicationType={type as ApplicationType} />
	);
}

export default PortalPreviewPage;
