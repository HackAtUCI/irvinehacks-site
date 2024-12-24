import { useContext } from "react";

import ApplicantStatus from "@/app/admin/applicants/components/ApplicantStatus";
import { Review } from "@/app/admin/applicants/hackers/useApplicant";
import UserContext from "@/lib/admin/UserContext";
import { Status, Uid } from "@/lib/userRecord";
import { scoresToDecisions } from "@/lib/decisionScores";

interface ApplicationReviewsProps {
	reviews: Review[];
	isHacker: boolean;
}

function ApplicationReviews({ reviews, isHacker }: ApplicationReviewsProps) {
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
						{isHacker ? (
							<>
								You scored this applicant a {score} on {formatDate(date)}
							</>
						) : (
							<>
								You reviewed as{" "}
								<ApplicantStatus status={scoresToDecisions[score] as Status} />{" "}
								on {formatDate(date)}
							</>
						)}
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
