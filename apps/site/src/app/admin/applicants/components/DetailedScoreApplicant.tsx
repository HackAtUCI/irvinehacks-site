"use client";
import { useState, useContext } from "react";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";
import { FlashbarProps } from "@cloudscape-design/components/flashbar";

import NotificationContext from "@/lib/admin/NotificationContext";
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
	const { setNotifications } = useContext(NotificationContext);
	const { applicant, loading, submitDetailedReview } = useApplicant(
		uid,
		applicationType,
	);
	const [scores, setScores] = useState({});
	const [notes, setNotes] = useState("");

	if (loading || !applicant) {
		return (
			<ContentLayout header={<Header />}>
				<Spinner variant="inverted" />
			</ContentLayout>
		);
	}

	const { first_name, last_name, application_data } = applicant;

	const successMessage: FlashbarProps.MessageDefinition = {
		type: "success",
		content: "Successfully submitted review!",
		id: `${Date.now()}`,
		dismissible: true,
		onDismiss: () => {
			if (setNotifications)
				setNotifications((prev) =>
					prev.filter((msg) => msg.id !== successMessage.id),
				);
		},
	};

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
								notes={notes}
								submitDetailedReview={(Uid, scores) =>
									submitDetailedReview(Uid, scores).then(() => {
										if (setNotifications)
											setNotifications((prev) => [successMessage, ...prev]);
									})
								}
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
							}).then(() => {
								if (setNotifications)
									setNotifications((prev) => [successMessage, ...prev]);
							})
						}
						guidelines={guidelines}
						notes={notes}
						onNotesChange={setNotes}
						reviews={application_data.reviews}
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
					submitDetailedReview={(Uid, scores) =>
						submitDetailedReview(Uid, scores).then(() => {
							if (setNotifications)
								setNotifications((prev) => [successMessage, ...prev]);
						})
					}
				/>
			</div>
		</ContentLayout>
	);
}

export default DetailedScoreApplicant;
