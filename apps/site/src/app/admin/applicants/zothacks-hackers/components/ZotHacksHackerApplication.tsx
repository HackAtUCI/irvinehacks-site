import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useMemo, useState, useEffect, useContext } from "react";

import PixelArtDisplay from "./PixelArtDisplay";
import HackerApplicationSection from "@/app/admin/applicants/hackers/components/HackerApplicationSection";
import {
	HackathonExperience,
	ZotHacksHackerApplicationData,
} from "@/lib/admin/useApplicant";
import ScoreSection from "../../components/ScoreSection";
import UserContext from "@/lib/admin/UserContext";
import { isLead } from "@/lib/admin/authorization";

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
}: {
	application_data: ZotHacksHackerApplicationData;
	onScoreChange: (scores: object) => void;
}) {
	const { uid: reviewer_uid, roles } = useContext(UserContext);
	const formattedUid = reviewer_uid?.split(".").at(-1);

	// Check if resume dropdown should be disabled
	const isResumeDisabled = useMemo(() => {
		const hasGlobalResumeScore =
			application_data?.global_field_scores?.resume !== undefined;

		return hasGlobalResumeScore && !isLead(roles);
	}, [application_data?.global_field_scores?.resume, roles]);

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
				leftColumn={
					<p>
						<strong>Weak: 5</strong>
						<br />
						no cs
						<br />
						<strong>Medium: 10</strong>
						<br />
						class projects or programming ability
						<br />
						<strong>Strong: 0</strong>
						<br />
						made a html/css/js project, or ONE react project
						<br />
						<strong>OQ: -1000</strong>
						<br />
						use sparingly, if clearly overqualified or should’ve been a mentor,
						not from UCI
					</p>
				}
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
				disabled={isResumeDisabled}
			/>
			<ScoreSection
				title="If you had 30 seconds in an elevator with your dream mentor, how would
					you explain why you’re joining ZotHacks? [75 word limit]"
				min={0}
				max={20}
				leftColumn={
					<p>
						Highest quality responses should include these attributes:
						<br />
						<br />
						<strong>Wow Factor</strong> - do you want this person on your team?
						<br />
						<strong>Uniqueness</strong> - memorable, different, stood out
						<br />
						<strong>Authenticity</strong> - genuineness, explanation sounds
						human and not chat
						<br />
						<br />
						<strong>18-20</strong> – amazing – all the good traits and{" "}
						<strong>MORE</strong>; super special/stood out and I want them on my
						team
						<br />
						<strong>13-17</strong> – good – all the aforementioned good traits
						<br />
						<strong>7-12</strong> – mid – effort but less memorable/lacking some
						of the aforementioned traits
						<br />
						<strong>2-6</strong> – poor – nice try but lower effort or they
						obviously didn’t spend much time
						<br />
						<strong>0-1</strong> – not even trying/inappropriate
						<br />
					</p>
				}
				rightColumn={<p>{application_data.elevator_pitch_saq}</p>}
				value={elevatorScore}
				onChange={setElevatorScore}
			/>
			<ScoreSection
				title="Describe a positive or negative experience dealing with technology
					[100 words]"
				min={0}
				max={20}
				leftColumn={
					<p>
						Highest quality responses should include these attributes:
						<br />
						<br />
						<strong>Interesting story</strong> - were you engaged/hooked by it
						<br />
						<strong>Uniqueness</strong> - memorable, different, stood out
						<br />
						<strong>Authenticity</strong> - genuineness, explanation sounds
						human and not chat
						<br />
						<br />
						<strong>18-20</strong> – amazing – all the good traits and{" "}
						<strong>MORE</strong>; super special/stood out and cool story
						<br />
						<strong>13-17</strong> – good – all the aforementioned good traits
						<br />
						<strong>7-12</strong> – mid – effort but less memorable/lacking some
						of the aforementioned traits
						<br />
						<strong>2-6</strong> – poor – nice try but lower effort or they
						obviously didn’t spend much time
						<br />
						<strong>0-1</strong> – not even trying/inappropriate
						<br />
					</p>
				}
				rightColumn={<p>{application_data.tech_experience_saq}</p>}
				value={techExperienceScore}
				onChange={setTechExperienceScore}
			/>
			<ScoreSection
				title="What’s one thing you hope to learn about yourself at UCI — and how
					might ZotHacks help with that? [100 words]"
				min={0}
				max={20}
				leftColumn={
					<p>
						Highest quality responses should include these attributes:
						<br />
						<br />
						<strong>Tied to Zothack&apos;s Core Mission</strong> - some
						combination of willingness to try/fail/learn (knows what ZotHacks
						is)
						<br />
						<strong>Uniqueness</strong> - memorable, different, stood out
						<br />
						<strong>Authenticity</strong> - genuineness, explanation sounds
						human and not chat
						<br />
						<br />
						<strong>18-20</strong> – amazing – all the good traits and{" "}
						<strong>MORE</strong>; super special/stood out and aligns with ZH
						core values
						<br />
						<strong>13-17</strong> – good – all the aforementioned good traits
						<br />
						<strong>7-12</strong> – mid – effort but less memorable/lacking some
						of the aforementioned traits
						<br />
						<strong>2-6</strong> – poor – nice try but lower effort or they
						obviously didn’t spend much time
						<br />
						<strong>0-1</strong> – not even trying/inappropriate
						<br />
					</p>
				}
				rightColumn={<p>{application_data.learn_about_self_saq}</p>}
				value={learnAboutSelfScore}
				onChange={setLearnAboutSelfScore}
			/>
			<ScoreSection
				title="Pixel art: Draw something that represents you. Briefly explain your
					art. [100 words]"
				min={0}
				max={20}
				leftColumn={
					<p>
						Highest quality responses should include these attributes:
						<br />
						<br />
						<strong>Creativity </strong> - visually appealing, imaginative, cool
						art concept
						<br />
						<strong>Uniqueness</strong> - memorable, different, stood out
						<br />
						<strong>Authenticity</strong> - genuineness, explanation sounds
						human and not chat
						<br />
						<br />
						<strong>18-20</strong> – amazing – all the good traits and{" "}
						<strong>MORE</strong>; super special/stood out to you, &quot;Your
						art was amazing wow I love it&quot;
						<br />
						<strong>13-17</strong> – good – all the aforementioned good traits
						<br />
						<strong>7-12</strong> – mid – effort but less memorable/lacking some
						of the aforementioned traits
						<br />
						<strong>2-6</strong> – poor – nice try but lower effort or they
						obviously didn’t spend much time
						<br />
						<strong>0-1</strong> – not even trying/inappropriate
						<br />
					</p>
				}
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
