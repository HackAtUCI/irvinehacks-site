"use client";
import { useState } from "react";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";

import useApplicant, {
	ZotHacksHackerApplicationData,
} from "@/lib/admin/useApplicant";

import ApplicantOverview from "./ApplicantOverview";
import { ParticipantRole } from "@/lib/userRecord";
import ZotHacksHackerApplication from "../zothacks-hackers/components/ZotHacksHackerApplication";
import ZotHacksHackerApplicantActions from "./ZotHacksHackerApplicantActions";
import { ZothacksScoringGuidelinesType } from "../zothacks-hackers/components/getScoringGuidelines";

interface ApplicantProps {
	uid: string;
	applicationType: "hacker" | "mentor" | "volunteer";
	guidelines: ZothacksScoringGuidelinesType;
}

function DetailedScoreApplicant({
	uid,
	applicationType,
	guidelines,
}: ApplicantProps) {
	const { applicant, loading, submitDetailedReview } = useApplicant(
		uid,
		applicationType,
	);
	const [scores, setScores] = useState({});

	if (loading || !applicant) {
		return (
			<ContentLayout header={<Header />}>
				<Spinner variant="inverted" />
			</ContentLayout>
		);
	}

	const { first_name, last_name, application_data } = applicant;

	return (
		<ContentLayout
			header={
				<Header
					variant="h1"
					description="Applicant"
					actions={
						applicant.roles.includes(ParticipantRole.Hacker) ? (
							<ZotHacksHackerApplicantActions
								applicant={applicant._id}
								reviews={application_data.reviews}
								scores={scores}
								submitDetailedReview={submitDetailedReview}
							/>
						) : (
							<></>
						)
					}
				>
					{first_name} {last_name}
				</Header>
			}
		>
			<SpaceBetween direction="vertical" size="l">
				<ApplicantOverview applicant={applicant} />
				{applicant.roles.includes(ParticipantRole.Hacker) ? (
					<ZotHacksHackerApplication
						application_data={application_data as ZotHacksHackerApplicationData}
						onScoreChange={setScores}
						onResumeScore={(
							resumeScore: number,
							hackathonExperienceScore: number,
						) =>
							submitDetailedReview(applicant._id, {
								resume: resumeScore,
								hackathon_experience: hackathonExperienceScore,
							})
						}
						guidelines={guidelines}
					/>
				) : applicant.roles.includes(ParticipantRole.Mentor) ? (
					<></>
				) : (
					<></>
				)}
			</SpaceBetween>
			<div
				style={{
					display: "flex",
					width: "100%",
					justifyContent: "flex-end",
					margin: "16px",
				}}
			>
				<ZotHacksHackerApplicantActions
					applicant={applicant._id}
					reviews={application_data.reviews}
					scores={scores}
					submitDetailedReview={submitDetailedReview}
				/>
			</div>
		</ContentLayout>
	);
}

export default DetailedScoreApplicant;
