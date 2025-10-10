import DetailedScoreApplicant from "@/app/admin/applicants/components/DetailedScoreApplicant";

interface ApplicantProps {
	params: { uid: string };
}

function ZotHacksHackerApplicant({ params }: ApplicantProps) {
	const { uid } = params;

	return <DetailedScoreApplicant uid={uid} applicationType="hacker" />;
}

export default ZotHacksHackerApplicant;
