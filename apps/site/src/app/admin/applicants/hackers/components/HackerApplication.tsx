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
import { IrvineHacksHackerScoredFields } from "@/lib/detailedScores";
import { IrvineHacksHackerScoringGuidelinesType } from "./getScoringGuidelines";

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

interface IrvineHacksHackerApplicationProps {
	application_data: IrvineHacksHackerApplicationData;
	onResumeScore: (
		resumeScore: number,
		hackathonExperienceScore: number,
	) => void;
	onScoreChange: (scores: IrvineHacksHackerScoredFields) => void;
	guidelines: IrvineHacksHackerScoringGuidelinesType;
	notes: string;
	onNotesChange: (notes: string) => void;
	applicant: Uid;
	reviews: Review[];
	onDeleteNotes: (uid: Uid, idx: number) => void;
}

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
}: IrvineHacksHackerApplicationProps) {
	const { uid: reviewer_uid, roles } = useContext(UserContext);
	const formattedUid = reviewer_uid?.split(".").at(-1);

	const isResumeDisabled = !isDirector(roles) && !isLead(roles);

	// Previous Experience options used for dropdown-based ScoreSection
	const previousExperienceOptions = useMemo(
		() => [
			{ label: "Select a score", value: "-1" },
			{ label: "Weak", value: "0" },
			{ label: "Medium", value: "0.5" },
			{ label: "Strong", value: "1" },
		],
		[],
	);

	// Controlled scores for each section
	const [previousExperienceScore, setPreviousExperienceScore] =
		useState<number>(
			formattedUid
				? (application_data?.review_breakdown?.[formattedUid]
						?.previous_experience ?? -1)
				: -1,
		);

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

	const hasSocials =
		application_data.linkedin || application_data.portfolio ? 1 : 0;

	const hackathonExperienceScore = application_data.is_first_hackathon ? 5 : 0;

	useEffect(() => {
		const scoresObject: IrvineHacksHackerScoredFields = {
			has_socials: hasSocials,
		};

		// Only include fields that don't have -1 values
		if (previousExperienceScore !== -1) {
			scoresObject.previous_experience = previousExperienceScore;
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
		previousExperienceScore,
		frqChangeScore,
		frqAmbitionScore,
		frqCharacterScore,
		application_data,
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
				title="Previous Experience"
				leftColumn={
					guidelines?.guidelines?.resume && (
						<PortableText value={guidelines.guidelines.resume} />
					)
				}
				rightColumn={
					<>
						<Button onClick={() => setShowResume(true)}>View resume</Button>
						<br />
						<a
							href={
								application_data.resume_url ? application_data.resume_url : ""
							}
							rel="noopener noreferrer"
							target="_blank"
						>
							{application_data.resume_url}
						</a>
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
				options={previousExperienceOptions}
				useDropdown
				value={previousExperienceScore}
				onChange={(value) => {
					setPreviousExperienceScore(value);
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
