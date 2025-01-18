import Applicant from "@/app/admin/applicants/components/Applicant";

interface ApplicantProps {
	params: { uid: string };
}

function VolunteerApplicant({ params }: ApplicantProps) {
	const { uid } = params;

	return <Applicant uid={uid} applicationType="volunteer" />;
}

export default VolunteerApplicant;
