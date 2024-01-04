import { useContext } from "react";

import { ApplicantStatus } from "admin/components";
import { Review, uid } from "admin/utils/useApplicant";
import UserContext from "utils/userContext";

interface ApplicationReviewsProps {
	reviews: Review[];
}

function ApplicationReviews({ reviews }: ApplicationReviewsProps) {
	const { uid } = useContext(UserContext);

	if (reviews.length === 0) {
		return <p>-</p>;
	}

	const formatUid = (uid: uid) => uid.split(".").at(-1);
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
				)
			)}
		</ul>
	);
}

export default ApplicationReviews;
