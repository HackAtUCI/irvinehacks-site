"use client";

import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";

import useApplicant from "@/lib/admin/useApplicant";

import ApplicantActions from "./components/ApplicantActions";
import ApplicantOverview from "./components/ApplicantOverview";
import Application from "./components/Application";

interface ApplicantProps {
	params: { uid: string };
}

function Applicant({ params }: ApplicantProps) {
	const { uid } = params;

	const { applicant, loading, submitReview } = useApplicant(uid);

	if (loading || !applicant) {
		return (
			<ContentLayout header={<Header />}>
				<Spinner variant="inverted" />
			</ContentLayout>
		);
	}

	const { application_data } = applicant;
	const { first_name, last_name } = application_data;

	return (
		<ContentLayout
			header={
				<Header
					variant="h1"
					description="Applicant"
					actions={
						<ApplicantActions
							applicant={applicant._id}
							submitReview={submitReview}
						/>
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
