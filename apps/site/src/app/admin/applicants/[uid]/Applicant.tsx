"use client";

import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";

import useApplicant from "@/app/admin/applicants/hackers/useApplicant";

import ApplicantActions from "./components/ApplicantActions";
import ApplicantOverview from "./components/ApplicantOverview";
import Application from "./components/Application";
import HackerApplicantActions from "./components/HackerApplicantActions";
import { ParticipantRole } from "@/lib/userRecord";

interface ApplicantProps {
	params: { uid: string };
}

function Applicant({ params }: ApplicantProps) {
	const { uid } = params;

	const { applicant, loading, submitReview, submitHackerReview } =
		useApplicant(uid);

	if (loading || !applicant) {
		return (
			<ContentLayout header={<Header />}>
				<Spinner variant="inverted" />
			</ContentLayout>
		);
	}

	const { first_name, last_name } = applicant;

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
								submitHackerReview={submitHackerReview}
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
				<Application applicant={applicant} />
			</SpaceBetween>
		</ContentLayout>
	);
}

export default Applicant;
