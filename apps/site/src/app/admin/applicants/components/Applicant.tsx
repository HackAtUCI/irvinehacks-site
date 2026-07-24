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
	IrvineHacksHackerApplicationData,
	IrvineHacksMentorApplicationData,
	VolunteerApplicationData,
} from "@/lib/admin/useApplicant";

import HackerApplication from "@/app/admin/applicants/hackers/components/HackerApplication";
import MentorApplication from "@/app/admin/applicants/mentors/components/MentorApplication";
import VolunteerApplication from "@/app/admin/applicants/volunteers/components/VolunteerApplication";

import ApplicantActions from "./ApplicantActions";
import ApplicantNavigationButtons from "./ApplicantNavigationButtons";
import ApplicantOverview from "./ApplicantOverview";
import HackerApplicantActions from "./HackerApplicantActions";
import DirectorAutoAcceptButton from "./DirectorAutoAcceptButton";
import AutoDecisionBadge from "./AutoDecisionBadge";
import { Decision, ParticipantRole } from "@/lib/userRecord";
import VoidApplicantButton from "./VoidApplicantButton";
import { ScoredFields } from "@/lib/detailedScores";
import { IrvineHacksHackerScoringGuidelinesType } from "@/app/admin/applicants/hackers/components/getScoringGuidelines";
import { IrvineHacksMentorScoringGuidelinesType } from "@/app/admin/applicants/mentors/components/getScoringGuidelines";
import { ZothacksHackerScoringGuidelinesType } from "@/app/admin/applicants/zothacks-hackers/components/getScoringGuidelines";

type ScoringGuidelinesType =
	| IrvineHacksHackerScoringGuidelinesType
	| IrvineHacksMentorScoringGuidelinesType
	| ZothacksHackerScoringGuidelinesType;

interface ApplicantProps {
	uid: string;
	applicationType: "hacker" | "mentor" | "volunteer";
	guidelines: ScoringGuidelinesType;
}

function Applicant({ uid, applicationType, guidelines }: ApplicantProps) {
	const { setNotifications } = useContext(NotificationContext);
	const { roles } = useContext(UserContext);
	const isUserDirector = isDirector(roles);
	const {
		applicant,
		loading,
		submitReview,
		submitDetailedReview,
		deleteNotes,
		directorAutoAccept,
		directorUndoAutoAccept,
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
			if (setNotifications) {
				setNotifications((prev) => [successMessage, ...prev]);
				setTimeout(
					() =>
						setNotifications((prev) =>
							prev.filter((msg) => msg.id !== successMessage.id),
						),
					3000,
				);
			}
			setNotes("");
		});
	};

	const autoAcceptSuccessMessage: FlashbarProps.MessageDefinition = {
		type: "success",
		content: "Successfully auto-accepted applicant!",
		id: `auto-accept-${Date.now()}`,
		dismissible: true,
		onDismiss: () => {
			if (setNotifications)
				setNotifications((prev) =>
					prev.filter((msg) => msg.id !== autoAcceptSuccessMessage.id),
				);
		},
	};

	const handleDirectorAutoAccept = (Uid: string) =>
		directorAutoAccept(Uid).then(() => {
			if (setNotifications)
				setNotifications((prev) => [autoAcceptSuccessMessage, ...prev]);
		});

	const undoAutoAcceptSuccessMessage: FlashbarProps.MessageDefinition = {
		type: "success",
		content: "Successfully removed auto-accept!",
		id: `undo-auto-accept-${Date.now()}`,
		dismissible: true,
		onDismiss: () => {
			if (setNotifications)
				setNotifications((prev) =>
					prev.filter((msg) => msg.id !== undoAutoAcceptSuccessMessage.id),
				);
		},
	};

	const handleDirectorUndoAutoAccept = (Uid: string) =>
		directorUndoAutoAccept(Uid).then(() => {
			if (setNotifications)
				setNotifications((prev) => [undoAutoAcceptSuccessMessage, ...prev]);
		});

	const autoAcceptDecision =
		applicant.auto_decision_reason === "DIRECTOR_AUTO_ACCEPT"
			? Decision.Accepted
			: applicant.auto_decision_reason === "UNDER_18" ||
				  applicant.auto_decision_reason === "GRADUATED"
				? Decision.Rejected
				: null;

	const reviewDisabled = Boolean(applicant.auto_decision_reason);

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
									basePath="/admin/applicants/hackers" // hardcoded for Irvinehacks (Applicant.tsx)
								/>
								<DirectorAutoAcceptButton
									applicant={applicant._id}
									autoDecisionReason={applicant.auto_decision_reason}
									onAutoAccept={handleDirectorAutoAccept}
									onUndoAutoAccept={handleDirectorUndoAutoAccept}
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
							<SpaceBetween direction="horizontal" size="xs">
								<VoidApplicantButton
									uid={applicant._id}
									status={applicant.status}
									onVoid={voidApplicant}
								/>
								<ApplicantActions
									applicant={applicant._id}
									submitReview={submitReview}
									autoDecisionReason={applicant.auto_decision_reason}
								/>
							</SpaceBetween>
						)
					}
				>
					{isUserDirector ? `${first_name} ${last_name}` : uidToPseudonym(uid)}{" "}
					<AutoDecisionBadge
						reason={applicant.auto_decision_reason}
						decision={autoAcceptDecision}
					/>
				</Header>
			}
		>
			<SpaceBetween direction="vertical" size="l">
				{isUserDirector && <ApplicantOverview applicant={applicant} />}
				{applicant.roles.includes(ParticipantRole.Hacker) ? (
					<HackerApplication
						application_data={
							application_data as IrvineHacksHackerApplicationData
						}
						// TODO: Remove onResumeScore by making it optional
						onResumeScore={() => {}}
						onScoreChange={setScores}
						guidelines={guidelines as IrvineHacksHackerScoringGuidelinesType}
						notes={notes}
						onNotesChange={setNotes}
						applicant={applicant._id}
						reviews={application_data.reviews}
						onDeleteNotes={(uid, idx) => deleteNotes(uid, idx)}
						isDirector={isUserDirector}
						reviewDisabled={reviewDisabled}
					/>
				) : applicant.roles.includes(ParticipantRole.Mentor) ? (
					<MentorApplication
						application_data={
							application_data as IrvineHacksMentorApplicationData
						}
						guidelines={guidelines as IrvineHacksMentorScoringGuidelinesType}
					/>
				) : (
					<VolunteerApplication
						application_data={application_data as VolunteerApplicationData}
					/>
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
				{applicant.roles.includes(ParticipantRole.Hacker) && (
					<SpaceBetween direction="horizontal" size="xs">
						<ApplicantNavigationButtons
							uid={uid}
							basePath="/admin/applicants/hackers" // hardcoded for Irvinehacks (Applicant.tsx)
						/>
						<DirectorAutoAcceptButton
							applicant={applicant._id}
							autoDecisionReason={applicant.auto_decision_reason}
							onAutoAccept={handleDirectorAutoAccept}
							onUndoAutoAccept={handleDirectorUndoAutoAccept}
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
				)}
			</div>
		</ContentLayout>
	);
}

export default Applicant;
