import Applicant from "@/app/admin/applicants/components/Applicant";
import { getIrvineHacksMentorScoringGuidelines } from "../components/getScoringGuidelines";

interface ApplicantProps {
	params: { uid: string };
}

async function MentorApplicant({ params }: ApplicantProps) {
	const { uid } = params;
	const guidelines = await getIrvineHacksMentorScoringGuidelines();

	return (
		<Applicant uid={uid} applicationType="mentor" guidelines={guidelines} />
	);
}

export default MentorApplicant;
