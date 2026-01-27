import { useMemo, useState, useEffect, useContext } from "react";
import {
	Button,
	Modal,
	Box,
	SpaceBetween,
	Container,
	Header,
} from "@cloudscape-design/components";
import { PortableText } from "@portabletext/react";
import HackerApplicationSection from "@/app/admin/applicants/hackers/components/HackerApplicationSection";
import {
	IrvineHacksHackerApplicationData,
	IrvineHacksHackerApplicationQuestion,
	Review,
} from "@/lib/admin/useApplicant";
import ScoreSection from "../../components/ScoreSection";
import ReviewerNotes from "@/app/admin/applicants/components/ReviewerNotes";
import UserContext from "@/lib/admin/UserContext";
import { isDirector, isLead } from "@/lib/admin/authorization";
import { Uid } from "@/lib/userRecord";

type IHKeys = IrvineHacksHackerApplicationQuestion;

interface IrvineHacksHackerApplicationSections {
	[key: string]: IHKeys[];
}

const IH_HACKER_APPLICATION_SECTIONS: IrvineHacksHackerApplicationSections = {
	"Personal Information": [
		"pronouns",
		"ethnicity",
		"is_18_older",
		"t_shirt_size",
		"dietary_restrictions",
		"allergies",
	],
	Education: ["school", "major", "education_level"],
	Experience: ["portfolio", "linkedin", "is_first_hackathon"],
	Other: ["ih_reference", "areas_interested"],
};

function IrvineHacksHackerApplication({
	application_data,
	onResumeScore,
	onScoreChange,
	guidelines,
	notes,
	applicant,
	onNotesChange,
	reviews,
	onDeleteNotes,
}: {
	application_data: IrvineHacksHackerApplicationData;
	onResumeScore: (
		resumeScore: number,
		hackathonExperienceScore: number,
	) => void;
	onScoreChange: (scores: object) => void;
	guidelines: any;
	notes: string;
	onNotesChange: (notes: string) => void;
	applicant: Uid;
	reviews: Review[];
	onDeleteNotes: (uid: Uid, idx: number) => void;
}) {
	const { uid: reviewer_uid, roles } = useContext(UserContext);
	const formattedUid = reviewer_uid?.split(".").at(-1);

	const isResumeDisabled = !isDirector(roles) && !isLead(roles);

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

	const [frqChangeScore, setFrqChangeScore] = useState<number>(
		formattedUid
			? (application_data?.review_breakdown?.[formattedUid]?.frq_change ?? -1)
			: -1,
	);
	const [frqAmbitionScore, setFrqAmbitionScore] = useState<number>(
		formattedUid
			? (application_data?.review_breakdown?.[formattedUid]?.frq_ambition ?? -1)
			: -1,
	);
	const [frqCharacterScore, setFrqCharacterScore] = useState<number>(
		formattedUid
			? (application_data?.review_breakdown?.[formattedUid]?.frq_character ??
					-1)
			: -1,
	);

	const [showResume, setShowResume] = useState<boolean>(false);

	const hackathonExperienceScore = application_data.is_first_hackathon ? 5 : 0;

	useEffect(() => {
		const scoresObject: Record<string, number> = {
			hackathon_experience: hackathonExperienceScore,
		};

		// Only include fields that don't have -1 values
		if (resumeScore !== -1) {
			scoresObject.resume = resumeScore;
		}
		if (frqChangeScore !== -1) {
			scoresObject.frq_change = frqChangeScore;
		}
		if (frqAmbitionScore !== -1) {
			scoresObject.frq_ambition = frqAmbitionScore;
		}
		if (frqCharacterScore !== -1) {
			scoresObject.frq_character = frqCharacterScore;
		}

		onScoreChange(scoresObject);
	}, [
		hackathonExperienceScore,
		resumeScore,
		frqChangeScore,
		frqAmbitionScore,
		frqCharacterScore,
		onScoreChange,
	]);

	return (
		<SpaceBetween direction="vertical" size="m">
			<Header variant="h2">IrvineHacks Hacker Application</Header>
			<Container>
				{Object.entries(IH_HACKER_APPLICATION_SECTIONS).map(
					([section, propsToShow]) => (
						<HackerApplicationSection
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
				leftColumn={
					guidelines?.guidelines?.resume && (
						<PortableText value={guidelines.guidelines.resume} />
					)
				}
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
										src={`${application_data.resume_url}/preview`}
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
				title="Describe a past or current project that you are proud of. [100 words]"
				min={0}
				max={20}
				leftColumn={
					guidelines?.guidelines?.frq_change && (
						<PortableText value={guidelines.guidelines.frq_change} />
					)
				}
				rightColumn={<p>{application_data.frq_change}</p>}
				value={frqChangeScore}
				onChange={setFrqChangeScore}
				wordLimit={100}
			/>
			<ScoreSection
				title="What is something you feel like going above and beyond for? Why? [100 words]"
				min={0}
				max={20}
				leftColumn={
					guidelines?.guidelines?.frq_ambition && (
						<PortableText value={guidelines.guidelines.frq_ambition} />
					)
				}
				rightColumn={<p>{application_data.frq_ambition}</p>}
				value={frqAmbitionScore}
				onChange={setFrqAmbitionScore}
				wordLimit={100}
			/>
			<ScoreSection
				title="Build your cyberpunk character! Choose your augmentations, accessories, and companion, then explain how each choice reflects your character's identity, role, or backstory. [75 words]"
				min={0}
				max={20}
				leftColumn={
					guidelines?.guidelines?.frq_character && (
						<PortableText value={guidelines.guidelines.frq_character} />
					)
				}
				rightColumn={<p>{application_data.frq_character}</p>}
				value={frqCharacterScore}
				onChange={setFrqCharacterScore}
				wordLimit={75}
			/>
			<ReviewerNotes
				applicant={applicant}
				notes={notes}
				onNotesChange={onNotesChange}
				reviews={reviews}
				onDeleteNotes={onDeleteNotes}
				reviewerId={reviewer_uid}
			/>
		</SpaceBetween>
	);
}

export default IrvineHacksHackerApplication;
