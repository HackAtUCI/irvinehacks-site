"use client";
import { useState, useContext } from "react";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";
import { FlashbarProps } from "@cloudscape-design/components/flashbar";

import NotificationContext from "@/lib/admin/NotificationContext";
import useApplicant, {
	IrvineHacksHackerApplicationData,
	IrvineHacksMentorApplicationData,
	VolunteerApplicationData,
} from "@/lib/admin/useApplicant";

import HackerApplication from "@/app/admin/applicants/hackers/components/HackerApplication";
import MentorApplication from "@/app/admin/applicants/mentors/components/MentorApplication";
import VolunteerApplication from "@/app/admin/applicants/volunteers/components/VolunteerApplication";

import ApplicantActions from "./ApplicantActions";
import ApplicantOverview from "./ApplicantOverview";
import HackerApplicantActions from "./HackerApplicantActions";
import { ParticipantRole } from "@/lib/userRecord";
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
	const {
		applicant,
		loading,
		submitReview,
		submitDetailedReview,
		deleteNotes,
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
							<HackerApplicantActions
								applicant={applicant._id}
								reviews={application_data.reviews}
								scores={scores}
								notes={notes}
								onSubmitDetailedReview={handleSubmitDetailedReview}
							/>
						) : (
							<ApplicantActions
								applicant={applicant._id}
								submitReview={submitReview}
							/>
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
					<HackerApplicantActions
						applicant={applicant._id}
						reviews={application_data.reviews}
						scores={scores}
						notes={notes}
						onSubmitDetailedReview={handleSubmitDetailedReview}
					/>
				)}
			</div>
		</ContentLayout>
	);
}

export default Applicant;
