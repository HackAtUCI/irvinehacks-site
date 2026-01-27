import DetailedScoreApplicant from "@/app/admin/applicants/components/DetailedScoreApplicant";
import { getZothacksHackerScoringGuidelines } from "../components/getScoringGuidelines";

interface ApplicantProps {
	params: { uid: string };
}

async function ZotHacksHackerApplicant({ params }: ApplicantProps) {
	const { uid } = params;
	const guidelines = await getZothacksHackerScoringGuidelines();

	return (
		<DetailedScoreApplicant
			uid={uid}
			applicationType="hacker"
			guidelines={guidelines}
		/>
	);
}

export default ZotHacksHackerApplicant;
