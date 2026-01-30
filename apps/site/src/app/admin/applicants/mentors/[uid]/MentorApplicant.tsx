import Applicant from "@/app/admin/applicants/components/Applicant";
import { IrvineHacksHackerScoringGuidelinesType } from "../../hackers/components/getScoringGuidelines";

interface ApplicantProps {
	params: { uid: string };
}

function MentorApplicant({ params }: ApplicantProps) {
	const { uid } = params;
	// TODO: replace this with real guidelines
	const guidelines = {
		_id: "",
		_type: "irvinehacksHackerScoringGuidelines",
		guidelines: {
			prev_experience: [""],
			frq_change: [""],
			frq_ambition: [""],
			frq_character: [""],
		},
	} as IrvineHacksHackerScoringGuidelinesType;

	return (
		<Applicant uid={uid} applicationType="mentor" guidelines={guidelines} />
	);
}

export default MentorApplicant;
