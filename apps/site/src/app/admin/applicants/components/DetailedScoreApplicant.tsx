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

interface ApplicantProps {
	uid: string;
	applicationType: "hacker" | "mentor" | "volunteer";
}

function DetailedScoreApplicant({ uid, applicationType }: ApplicantProps) {
	const { applicant, loading, submitReview } = useApplicant(
		uid,
		applicationType,
	);
	const [totalScore, setTotalScore] = useState<number>(0);

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
								score={totalScore}
								submitReview={submitReview}
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
						onTotalScoreChange={setTotalScore}
					/>
				) : applicant.roles.includes(ParticipantRole.Mentor) ? (
					<></>
				) : (
					<></>
				)}
			</SpaceBetween>
		</ContentLayout>
	);
}

export default DetailedScoreApplicant;
