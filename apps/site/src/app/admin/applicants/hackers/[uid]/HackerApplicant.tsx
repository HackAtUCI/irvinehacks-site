import Applicant from "@/app/admin/applicants/components/Applicant";
import { getIrvineHacksHackerScoringGuidelines } from "../components/getScoringGuidelines";

interface ApplicantProps {
	params: { uid: string };
}

async function HackerApplicant({ params }: ApplicantProps) {
	const { uid } = params;
	const guidelines = await getIrvineHacksHackerScoringGuidelines();

	return (
		<Applicant uid={uid} applicationType="hacker" guidelines={guidelines} />
	);
}

export default HackerApplicant;
