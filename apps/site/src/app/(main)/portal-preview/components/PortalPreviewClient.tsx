"use client";

import ApplicantPortal from "@/app/(main)/portal/@applicant/ApplicantPortal";
import useApplicant from "@/lib/admin/useApplicant";
import { ApplicationData } from "@/lib/utils/useApplicationData";
import { Identity } from "@/lib/utils/useUserIdentity";

interface PortalPreviewClientProps {
	uid: string;
	applicationType: "hacker" | "mentor" | "volunteer";
}

function PortalPreviewClient({
	uid,
	applicationType,
}: PortalPreviewClientProps) {
	const { applicant, loading, error } = useApplicant(uid, applicationType);

	if (error) {
		return (
			<div className="font-display text-2xl mt-5 text-[var(--color-white)]">
				Unable to load applicant.
			</div>
		);
	}

	if (loading || !applicant) {
		return <div className="font-display text-4xl mt-5">Loading...</div>;
	}

	const identity: Identity = {
		uid: applicant._id,
		roles: applicant.roles,
		status: applicant.status,
		decision: applicant.decision,
	};

	const applicationData: ApplicationData = {
		application_data:
			"character_head_index" in applicant.application_data
				? {
						character_head_index:
							applicant.application_data.character_head_index,
						character_body_index:
							applicant.application_data.character_body_index,
						character_feet_index:
							applicant.application_data.character_feet_index,
						character_companion_index:
							applicant.application_data.character_companion_index,
				  }
				: null,
	};

	return (
		<ApplicantPortal
			identity={identity}
			applicationData={applicationData}
			readOnly
		/>
	);
}

export default PortalPreviewClient;
