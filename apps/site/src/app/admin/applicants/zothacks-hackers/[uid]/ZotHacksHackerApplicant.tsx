import Applicant from "@/app/admin/applicants/components/Applicant";

interface ApplicantProps {
	params: { uid: string };
}

function ZotHacksHackerApplicant({ params }: ApplicantProps) {
	const { uid } = params;

	return <Applicant uid={uid} applicationType="zothacks_hacker" />;
}

export default ZotHacksHackerApplicant;
