import { useContext } from "react";

import { HackerReview, Uid } from "@/lib/admin/useApplicant";
import UserContext from "@/lib/admin/UserContext";

interface HackerApplicationReviewsProps {
	hacker_reviews: Record<string, HackerReview[]>;
}

function HackerApplicationReviews({
	hacker_reviews,
}: HackerApplicationReviewsProps) {
	const { uid } = useContext(UserContext);
	const uidLastSubstring = uid?.split(".").at(-1);

	if (Object.keys(hacker_reviews).length === 0) {
		return <p>-</p>;
	}

	const formatUid = (uid: Uid) => uid.split(".").at(-1);
	const formatDate = (timestamp: string) =>
		new Date(timestamp).toLocaleDateString();

	const reviewsArray: [string, string, number][] = Object.entries(
		hacker_reviews,
	).flatMap(([key, reviews]) =>
		reviews
			.map(([time, score]): [string, string, number] => [time, key, score])
			.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()),
	);

	return (
		<ul>
			{reviewsArray.map(([date, reviewer, score]) =>
				reviewer === uidLastSubstring ? (
					<li key={date}>
						<>
							You scored this applicant a {score} on {formatDate(date)}
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

export default HackerApplicationReviews;
