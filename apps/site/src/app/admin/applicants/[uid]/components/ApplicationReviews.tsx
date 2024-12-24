import { useContext } from "react";

import ApplicantStatus from "@/app/admin/applicants/components/ApplicantStatus";
import { Review } from "@/app/admin/applicants/hackers/useApplicant";
import UserContext from "@/lib/admin/UserContext";
import { Uid } from "@/lib/userRecord";

interface ApplicationReviewsProps {
	reviews: Review[];
}

function ApplicationReviews({ reviews }: ApplicationReviewsProps) {
	const { uid } = useContext(UserContext);

	if (reviews.length === 0) {
		return <p>-</p>;
	}

	const formatUid = (uid: Uid) => uid.split(".").at(-1);
	const formatDate = (timestamp: string) =>
		new Date(timestamp).toLocaleDateString();

	return (
		<ul>
			{reviews.map(([date, reviewer, decision]) =>
				reviewer === uid ? (
					<li key={date}>
						<>
							You reviewed as <ApplicantStatus status={decision} /> on{" "}
							{formatDate(date)}
						</>
					</li>
				) : (
					<li key={date}>
						{formatUid(reviewer)} reviewed this application on{" "}
						{formatDate(date)}
					</li>
				),
			)}
		</ul>
	);
}

export default ApplicationReviews;
