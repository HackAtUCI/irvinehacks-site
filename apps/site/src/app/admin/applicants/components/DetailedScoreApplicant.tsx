"use client";
import { useState, useContext } from "react";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";
import { FlashbarProps } from "@cloudscape-design/components/flashbar";

import NotificationContext from "@/lib/admin/NotificationContext";
import UserContext from "@/lib/admin/UserContext";
import { isDirector } from "@/lib/admin/authorization";
import { uidToPseudonym } from "@/lib/admin/anonymize";
import useApplicant, {
	ZotHacksHackerApplicationData,
} from "@/lib/admin/useApplicant";

import ApplicantOverview from "./ApplicantOverview";
import ApplicantNavigationButtons from "./ApplicantNavigationButtons";
import { ParticipantRole } from "@/lib/userRecord";
import { ScoredFields } from "@/lib/detailedScores";
import ZotHacksHackerApplication from "../zothacks-hackers/components/ZotHacksHackerApplication";
import HackerApplicantActions from "./HackerApplicantActions";
import VoidApplicantButton from "./VoidApplicantButton";
import { ZothacksHackerScoringGuidelinesType } from "../zothacks-hackers/components/getScoringGuidelines";

interface ApplicantProps {
	uid: string;
	applicationType: "hacker" | "mentor" | "volunteer";
	guidelines: ZothacksHackerScoringGuidelinesType;
}

function DetailedScoreApplicant({
	uid,
	applicationType,
	guidelines,
}: ApplicantProps) {
	const { setNotifications } = useContext(NotificationContext);
	const { roles } = useContext(UserContext);
	const isUserDirector = isDirector(roles);
	const {
		applicant,
		loading,
		submitDetailedReview,
		deleteNotes,
		voidApplicant,
	} = useApplicant(uid, applicationType);
	const [scores, setScores] = useState<ScoredFields>({});
	const [notes, setNotes] = useState("");

	if (loading || !applicant) {
		return (
			<ContentLayout header={<Header />}>
				<Spinner variant="inverted" />
			</ContentLayout>
		);
	}

	const { first_name, last_name, application_data } = applicant;
	const reviewDisabled = Boolean(applicant.auto_decision_reason);

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

	const handleSubmitDetailedReview = (
		Uid: string,
		scores: object,
		notes: string | null,
	) => {
		submitDetailedReview(Uid, scores, notes).then(() => {
			if (setNotifications)
				setNotifications((prev) => [successMessage, ...prev]);
			setNotes("");
		});
	};

	return (
		<ContentLayout
			header={
				<Header
					variant="h1"
					description="Applicant"
					actions={
						applicant.roles.includes(ParticipantRole.Hacker) ? (
							<SpaceBetween direction="horizontal" size="xs">
								<VoidApplicantButton
									uid={applicant._id}
									status={applicant.status}
									onVoid={voidApplicant}
								/>
								<ApplicantNavigationButtons
									uid={uid}
									basePath="/admin/applicants/zothacks-hackers"
								/>
								<HackerApplicantActions
									applicant={applicant._id}
									reviews={application_data.reviews}
									scores={scores}
									notes={notes}
									autoDecisionReason={applicant.auto_decision_reason}
									onSubmitDetailedReview={handleSubmitDetailedReview}
								/>
							</SpaceBetween>
						) : (
							<VoidApplicantButton
								uid={applicant._id}
								status={applicant.status}
								onVoid={voidApplicant}
							/>
						)
					}
				>
					{isUserDirector ? `${first_name} ${last_name}` : uidToPseudonym(uid)}
				</Header>
			}
		>
			<SpaceBetween direction="vertical" size="l">
				{isUserDirector && <ApplicantOverview applicant={applicant} />}
				{applicant.roles.includes(ParticipantRole.Hacker) ? (
					<ZotHacksHackerApplication
						applicant={applicant._id}
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
						onDeleteNotes={(uid, idx) => deleteNotes(uid, idx)}
						guidelines={guidelines}
						notes={notes}
						onNotesChange={setNotes}
						reviews={application_data.reviews}
						reviewDisabled={reviewDisabled}
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
				<HackerApplicantActions
					applicant={applicant._id}
					reviews={application_data.reviews}
					scores={scores}
					notes={notes}
					autoDecisionReason={applicant.auto_decision_reason}
					onSubmitDetailedReview={handleSubmitDetailedReview}
				/>
				<ApplicantNavigationButtons
					uid={uid}
					basePath="/admin/applicants/zothacks-hackers"
				/>
			</div>
		</ContentLayout>
	);
}

export default DetailedScoreApplicant;
