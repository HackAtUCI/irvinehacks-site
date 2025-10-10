import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useMemo, useState, useEffect } from "react";

import PixelArtDisplay from "./PixelArtDisplay";
import HackerApplicationSection from "@/app/admin/applicants/hackers/components/HackerApplicationSection";
import {
	HackathonExperience,
	ZotHacksHackerApplicationData,
} from "@/lib/admin/useApplicant";
import ScoreSection from "../../components/ScoreSection";

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
	onTotalScoreChange,
}: {
	application_data: ZotHacksHackerApplicationData;
	onTotalScoreChange: (totalScore: number) => void;
}) {
	// Resume options used for dropdown-based ScoreSection
	const resumeOptions = useMemo(
		() => [
			{ label: "Weak", value: "5" },
			{ label: "Medium", value: "15" },
			{ label: "Strong", value: "0" },
			{ label: "Overqualified (auto-reject)", value: "-1000" },
		],
		[],
	);

	// Controlled scores for each section
	const [resumeScore, setResumeScore] = useState<number>(
		Number(resumeOptions[0].value),
	);
	const [elevatorScore, setElevatorScore] = useState<number>(0);
	const [techExperienceScore, setTechExperienceScore] = useState<number>(0);
	const [learnAboutSelfScore, setLearnAboutSelfScore] = useState<number>(0);
	const [pixelArtScore, setPixelArtScore] = useState<number>(0);

	useEffect(() => {
		const hackathonExperienceScore =
			HACKATHON_EXPERIENCE_SCORE_MAP[
				application_data.hackathon_experience as HackathonExperience
			] || 0;
		const totalScore =
			hackathonExperienceScore +
			resumeScore +
			elevatorScore +
			techExperienceScore +
			learnAboutSelfScore +
			pixelArtScore;
		onTotalScoreChange(totalScore);
	}, [
		application_data.hackathon_experience,
		resumeScore,
		elevatorScore,
		techExperienceScore,
		learnAboutSelfScore,
		pixelArtScore,
		onTotalScoreChange,
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
				leftColumn={<p>Overqualified is an auto-reject</p>}
				rightColumn={
					<p>
						<a
							href={application_data.resume_url as string}
							target="_blank"
							rel="noopener noreferrer"
						>
							{application_data.resume_url}
						</a>
					</p>
				}
				options={resumeOptions}
				useDropdown
				value={resumeScore}
				onChange={setResumeScore}
			/>
			<ScoreSection
				title="If you had 30 seconds in an elevator with your dream mentor, how would
					you explain why you’re joining ZotHacks? [75 word limit]"
				min={0}
				max={20}
				leftColumn={<p>0 is bad. 20 is amazing.</p>}
				rightColumn={<p>{application_data.elevator_pitch_saq}</p>}
				value={elevatorScore}
				onChange={setElevatorScore}
			/>
			<ScoreSection
				title="Describe a positive or negative experience dealing with technology
					[100 words]"
				min={0}
				max={20}
				leftColumn={<p>0 is bad. 20 is amazing.</p>}
				rightColumn={<p>{application_data.tech_experience_saq}</p>}
				value={techExperienceScore}
				onChange={setTechExperienceScore}
			/>
			<ScoreSection
				title="What’s one thing you hope to learn about yourself at UCI — and how
					might ZotHacks help with that? [100 words]"
				min={0}
				max={20}
				leftColumn={<p>0 is bad. 20 is amazing.</p>}
				rightColumn={<p>{application_data.learn_about_self_saq}</p>}
				value={learnAboutSelfScore}
				onChange={setLearnAboutSelfScore}
			/>
			<ScoreSection
				title="Pixel art: Draw something that represents you. Briefly explain your
					art. [100 words]"
				min={0}
				max={20}
				leftColumn={<p>0 is bad. 20 is amazing.</p>}
				rightColumn={
					<div>
						<p>{application_data.pixel_art_saq}</p>
						<PixelArtDisplay gridColors={application_data.pixel_art_data} />
					</div>
				}
				value={pixelArtScore}
				onChange={setPixelArtScore}
			/>
		</SpaceBetween>
	);
}

export default ZotHacksHackerApplication;
