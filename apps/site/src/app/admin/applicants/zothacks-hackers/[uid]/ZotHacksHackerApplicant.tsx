import DetailedScoreApplicant from "@/app/admin/applicants/components/DetailedScoreApplicant";
import { getZothacksScoringGuidelines } from "../components/getScoringGuidelines";

interface ApplicantProps {
	params: { uid: string };
}

async function ZotHacksHackerApplicant({ params }: ApplicantProps) {
	const { uid } = params;
	const guidelines = await getZothacksScoringGuidelines();

	return (
		<DetailedScoreApplicant
			uid={uid}
			applicationType="hacker"
			guidelines={guidelines}
		/>
	);
}

export default ZotHacksHackerApplicant;
