import { useContext } from "react";

import { HackerReview } from "@/app/admin/applicants/hackers/useApplicant";
import { Uid } from "@/lib/userRecord";
import UserContext from "@/lib/admin/UserContext";

interface HackerApplicationReviewsProps {
	reviews: HackerReview[];
}

function HackerApplicationReviews({ reviews }: HackerApplicationReviewsProps) {
	const { uid } = useContext(UserContext);

	if (reviews.length === 0) {
		return <p>-</p>;
	}

	const formatUid = (uid: Uid) => uid.split(".").at(-1);
	const formatDate = (timestamp: string) =>
		new Date(timestamp).toLocaleDateString();

	return (
		<ul>
			{reviews.map(([date, reviewer, score]) =>
				reviewer === uid ? (
					<li key={date}>
						You scored this applicant a {score} on {formatDate(date)}
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

export default HackerApplicationReviews;
