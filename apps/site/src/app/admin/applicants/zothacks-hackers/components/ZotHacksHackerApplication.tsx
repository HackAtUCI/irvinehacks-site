import { useMemo, useState, useEffect, useContext } from "react";
import { Button } from "@cloudscape-design/components";
import { Modal } from "@cloudscape-design/components";
import { Box } from "@cloudscape-design/components";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { PortableText } from "@portabletext/react";

import PixelArtDisplay from "./PixelArtDisplay";
import HackerApplicationSection from "@/app/admin/applicants/hackers/components/HackerApplicationSection";
import {
	HackathonExperience,
	ZotHacksHackerApplicationData,
} from "@/lib/admin/useApplicant";
import ScoreSection from "../../components/ScoreSection";
import UserContext from "@/lib/admin/UserContext";
import { isDirector, isLead } from "@/lib/admin/authorization";
import { ZothacksScoringGuidelinesType } from "./getScoringGuidelines";

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
	onScoreChange,
	guidelines,
}: {
	application_data: ZotHacksHackerApplicationData;
	onScoreChange: (scores: object) => void;
	guidelines: ZothacksScoringGuidelinesType;
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
	const [elevatorScore, setElevatorScore] = useState<number>(
		formattedUid
			? application_data?.review_breakdown?.[formattedUid]
					?.elevator_pitch_saq ?? -1
			: -1,
	);
	const [techExperienceScore, setTechExperienceScore] = useState<number>(
		formattedUid
			? application_data?.review_breakdown?.[formattedUid]
					?.tech_experience_saq ?? -1
			: -1,
	);
	const [learnAboutSelfScore, setLearnAboutSelfScore] = useState<number>(
		formattedUid
			? application_data?.review_breakdown?.[formattedUid]
					?.learn_about_self_saq ?? -1
			: -1,
	);
	const [pixelArtScore, setPixelArtScore] = useState<number>(
		formattedUid
			? application_data?.review_breakdown?.[formattedUid]?.pixel_art_saq ?? -1
			: -1,
	);

	const [showResume, setShowResume] = useState<boolean>(false);

	useEffect(() => {
		const hackathonExperienceScore =
			HACKATHON_EXPERIENCE_SCORE_MAP[
				application_data.hackathon_experience as HackathonExperience
			] || 0;

		const scoresObject: Record<string, number> = {
			hackathon_experience: hackathonExperienceScore,
		};

		// Only include fields that don't have -1 values
		if (resumeScore !== -1) {
			scoresObject.resume = resumeScore;
		}
		if (elevatorScore !== -1) {
			scoresObject.elevator_pitch_saq = elevatorScore;
		}
		if (techExperienceScore !== -1) {
			scoresObject.tech_experience_saq = techExperienceScore;
		}
		if (learnAboutSelfScore !== -1) {
			scoresObject.learn_about_self_saq = learnAboutSelfScore;
		}
		if (pixelArtScore !== -1) {
			scoresObject.pixel_art_saq = pixelArtScore;
		}

		onScoreChange(scoresObject);
	}, [
		application_data.hackathon_experience,
		resumeScore,
		elevatorScore,
		techExperienceScore,
		learnAboutSelfScore,
		pixelArtScore,
		onScoreChange,
	]);

	return (
		<SpaceBetween direction="vertical" size="m">
			<Header variant="h2">ZotHacks Hacker Application</Header>
			<Container>
				{Object.entries(ZH_HACKER_APPLICATION_SECTIONS).map(
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
				onChange={setResumeScore}
				disabled={isResumeDisabled}
			/>
			<ScoreSection
				title="If you had 30 seconds in an elevator with your dream mentor, how would
					you explain why you’re joining ZotHacks? [75 word limit]"
				min={0}
				max={20}
				leftColumn={
					<PortableText value={guidelines.guidelines.elevator_pitch_saq} />
				}
				rightColumn={<p>{application_data.elevator_pitch_saq}</p>}
				value={elevatorScore}
				onChange={setElevatorScore}
				wordLimit = {75}
			/>
			<ScoreSection
				title="Describe a positive or negative experience dealing with technology
					[100 words]"
				min={0}
				max={20}
				leftColumn={
					<PortableText value={guidelines.guidelines.tech_experience_saq} />
				}
				rightColumn={<p>{application_data.tech_experience_saq}</p>}
				value={techExperienceScore}
				onChange={setTechExperienceScore}
				wordLimit = {100}
			/>
			<ScoreSection
				title="What’s one thing you hope to learn about yourself at UCI — and how
					might ZotHacks help with that? [100 words]"
				min={0}
				max={20}
				leftColumn={
					<PortableText value={guidelines.guidelines.learn_about_self_saq} />
				}
				rightColumn={<p>{application_data.learn_about_self_saq}</p>}
				value={learnAboutSelfScore}
				onChange={setLearnAboutSelfScore}
				wordLimit = {100}
			/>
			<ScoreSection
				title="Pixel art: Draw something that represents you. Briefly explain your
					art. [100 words]"
				min={0}
				max={20}
				leftColumn={
					<PortableText value={guidelines.guidelines.pixel_art_saq} />
				}
				rightColumn={
					<div>
						<p>{application_data.pixel_art_saq}</p>
						<PixelArtDisplay gridColors={application_data.pixel_art_data} />
					</div>
				}
				value={pixelArtScore}
				onChange={setPixelArtScore}
				wordLimit = {100}
			/>
		</SpaceBetween>
	);
}

export default ZotHacksHackerApplication;
