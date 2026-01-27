import Applicant from "@/app/admin/applicants/components/Applicant";

interface ApplicantProps {
	params: { uid: string };
}

function HackerApplicant({ params }: ApplicantProps) {
	const { uid } = params;

	return <Applicant uid={uid} applicationType="hacker" guidelines={{}} />;
}

export default HackerApplicant;
