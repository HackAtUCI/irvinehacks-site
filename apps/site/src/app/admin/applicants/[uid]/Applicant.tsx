import { useRouter } from "next/router";

import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";

import { ApplicantActions, Application } from "admin/components";
import useApplicant from "admin/utils/useApplicant";

import ApplicantOverview from "./components/ApplicantOverview";

function Applicant() {
	const router = useRouter();
	const { uid } = router.query;

	if (typeof uid === "string") {
		throw TypeError();
	}

	const { applicant, loading, submitReview } = useApplicant(uid ? uid[0] : "");

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
