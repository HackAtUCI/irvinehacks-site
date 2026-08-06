import { useMemo, useState, useEffect, useContext } from "react";
import { Button } from "@cloudscape-design/components";
import { Modal } from "@cloudscape-design/components";
import { Box } from "@cloudscape-design/components";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { PortableText } from "@portabletext/react";
import ZotHacksHackerApplicationSection from "./ZotHacksHackerApplicationSection";
import {
	HackathonExperience,
	ZotHacksHackerApplicationData,
} from "@/lib/admin/useApplicant";
import ScoreSection from "../../components/ScoreSection";
import ReviewerNotes from "@/app/admin/applicants/components/ReviewerNotes";
import UserContext from "@/lib/admin/UserContext";
import { isDirector, isLead } from "@/lib/admin/authorization";
import { ZothacksHackerScoringGuidelinesType } from "./getScoringGuidelines";
import { Review } from "@/lib/admin/useApplicant";
import { Uid } from "@/lib/userRecord";
import { ZotHacksHackerScoredFields } from "@/lib/detailedScores";

type ZHKeys = Exclude<keyof ZotHacksHackerApplicationData, "reviews">;

interface ZHHackerApplicationSections {
	[key: string]: ZHKeys[];
}

const ZH_HACKER_APPLICATION_SECTIONS: ZHHackerApplicationSections = {
	"Personal Information": [
		"pronouns",
		"is_18_older",
		"dietary_restrictions",
		"allergies",
	],
	Education: ["school_year", "major"],
	"Hackathon Experience": ["hackathon_experience"],
	Comments: ["comments"],
};

const HACKATHON_EXPERIENCE_SCORE_MAP: Record<HackathonExperience, number> = {
	first_time: 5,
	some_experience: 0,
	veteran: -1000,
};

function ZotHacksHackerApplication({
	application_data,
	onResumeScore,
	onScoreChange,
	guidelines,
	notes,
	applicant,
	onNotesChange,
	reviews,
	onDeleteNotes,
	reviewDisabled = false,
}: {
	application_data: ZotHacksHackerApplicationData;
	onResumeScore: (
		resumeScore: number,
		hackathonExperienceScore: number,
	) => void;
	onScoreChange: (scores: ZotHacksHackerScoredFields) => void;
	guidelines: ZothacksHackerScoringGuidelinesType;
	notes: string;
	onNotesChange: (notes: string) => void;
	applicant: Uid;
	reviews: Review[];
	onDeleteNotes: (uid: Uid, idx: number) => void;
	reviewDisabled?: boolean;
}) {
	const { uid: reviewer_uid, roles } = useContext(UserContext);
	const formattedUid = reviewer_uid?.split(".").at(-1);

	const isResumeDisabled =
		(!isDirector(roles) && !isLead(roles)) || reviewDisabled;

	// Resume options used for dropdown-based ScoreSection
	const resumeOptions = useMemo(
		() => [
			{ label: "Select a score", value: "-1" },
			{ label: "Weak", value: "5" },
			{ label: "Medium", value: "15" },
			{ label: "Strong", value: "0" },
			{ label: "Overqualified (auto-reject)", value: "-1000" },
		],
		[],
	);

	// Controlled scores for each section
	const [resumeScore, setResumeScore] = useState<number>(() => {
		// First check if there's a global field score for resume
		const globalResumeScore = application_data?.global_field_scores?.resume;
		if (globalResumeScore !== undefined) {
			const allowedValues = new Set(resumeOptions.map((o) => Number(o.value)));
			return allowedValues.has(Number(globalResumeScore))
				? Number(globalResumeScore)
				: -1;
		}

		// Fall back to reviewer-specific score
		const raw = formattedUid
			? application_data?.review_breakdown?.[formattedUid]?.resume
			: undefined;
		// If there's a stored score, ensure it's one of the allowed dropdown values; otherwise default to -1
		const allowedValues = new Set(resumeOptions.map((o) => Number(o.value)));
		return allowedValues.has(Number(raw)) ? Number(raw) : -1;
	});
	const [collaborationScore, setCollaborationScore] = useState<number>(
		formattedUid
			? application_data?.review_breakdown?.[formattedUid]?.collaboration_saq ??
					-1
			: -1,
	);
	const [techInspirationScore, setTechInspirationScore] = useState<number>(
		formattedUid
			? application_data?.review_breakdown?.[formattedUid]
					?.tech_inspiration_saq ?? -1
			: -1,
	);
	const [uciGiftScore, setUciGiftScore] = useState<number>(
		formattedUid
			? application_data?.review_breakdown?.[formattedUid]?.uci_gift_saq ?? -1
			: -1,
	);

	const [showResume, setShowResume] = useState<boolean>(false);

	const hackathonExperienceScore =
		HACKATHON_EXPERIENCE_SCORE_MAP[
			application_data.hackathon_experience as HackathonExperience
		] || 0;

	useEffect(() => {
		const scoresObject: ZotHacksHackerScoredFields = {
			hackathon_experience: hackathonExperienceScore,
		};

		// Only include fields that don't have -1 values
		if (resumeScore !== -1) {
			scoresObject.resume = resumeScore;
		}
		if (collaborationScore !== -1) {
			scoresObject.collaboration_saq = collaborationScore;
		}
		if (techInspirationScore !== -1) {
			scoresObject.tech_inspiration_saq = techInspirationScore;
		}
		if (uciGiftScore !== -1) {
			scoresObject.uci_gift_saq = uciGiftScore;
		}

		onScoreChange(scoresObject);
	}, [
		hackathonExperienceScore,
		resumeScore,
		collaborationScore,
		techInspirationScore,
		uciGiftScore,
		onScoreChange,
	]);

	return (
		<SpaceBetween direction="vertical" size="m">
			<Header variant="h2">ZotHacks Hacker Application</Header>
			<Container>
				{Object.entries(ZH_HACKER_APPLICATION_SECTIONS).map(
					([section, propsToShow]) => (
						<ZotHacksHackerApplicationSection
							key={section}
							title={section}
							data={application_data}
							propsToShow={propsToShow}
						/>
					),
				)}
			</Container>
			<ScoreSection
				title="Resume"
				leftColumn={<PortableText value={guidelines.guidelines.resume} />}
				rightColumn={
					<>
						<Button onClick={() => setShowResume(true)}>View resume</Button>
						{showResume && (
							<Modal
								onDismiss={() => setShowResume(false)}
								visible={showResume}
								closeAriaLabel="Close modal"
								header="Resume"
								size="max"
							>
								<Box>
									<iframe
										src={`${application_data.resume_url as string}/preview`}
										title="Resume"
										style={{ width: "100%", height: "80vh", border: 0 }}
									/>
								</Box>
							</Modal>
						)}
					</>
				}
				options={resumeOptions}
				useDropdown
				value={resumeScore}
				onChange={(value) => {
					setResumeScore(value);
					onResumeScore(value, hackathonExperienceScore);
				}}
				disabled={isResumeDisabled}
			/>
			<ScoreSection
				title="Tell us about a time when collaboration was instrumental in your success. [Max 100 words]"
				min={0}
				max={20}
				leftColumn={
					<PortableText value={guidelines.guidelines.collaboration_saq} />
				}
				rightColumn={<p>{application_data.collaboration_saq}</p>}
				value={collaborationScore}
				onChange={setCollaborationScore}
				wordLimit={100}
				disabled={reviewDisabled}
			/>
			<ScoreSection
				title="Describe an application or technological concept that inspires your growth. Why is it important to you? (Ex: Robots in surgery, quantum computing, social media, etc.) [Max 100 words]"
				min={0}
				max={20}
				leftColumn={
					<PortableText value={guidelines.guidelines.tech_inspiration_saq} />
				}
				rightColumn={<p>{application_data.tech_inspiration_saq}</p>}
				value={techInspirationScore}
				onChange={setTechInspirationScore}
				wordLimit={100}
				disabled={reviewDisabled}
			/>
			<ScoreSection
				title="If you could give each person at UCI one item under $100, what would it be and why? [Max 75 words]"
				min={0}
				max={20}
				leftColumn={<PortableText value={guidelines.guidelines.uci_gift_saq} />}
				rightColumn={<p>{application_data.uci_gift_saq}</p>}
				value={uciGiftScore}
				onChange={setUciGiftScore}
				wordLimit={75}
				disabled={reviewDisabled}
			/>
			<ReviewerNotes
				applicant={applicant}
				notes={notes}
				onNotesChange={onNotesChange}
				reviews={reviews}
				onDeleteNotes={onDeleteNotes}
				reviewerId={reviewer_uid}
				disabled={reviewDisabled}
			/>
		</SpaceBetween>
	);
}

export default ZotHacksHackerApplication;
