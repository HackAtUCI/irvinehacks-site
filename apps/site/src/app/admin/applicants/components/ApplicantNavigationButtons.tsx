"use client";

import { useRouter } from "next/navigation";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";

import useHackerApplicants from "@/lib/admin/useHackerApplicants";

interface ApplicantNavigationButtonsProps {
	uid: string;
	basePath: string;
}

function ApplicantNavigationButtons({
	uid,
	basePath,
}: ApplicantNavigationButtonsProps) {
	const router = useRouter();
	const { applicantList, loading } = useHackerApplicants();

	if (loading || applicantList.length === 0) return null;

	const currentApplicant = applicantList.find((a) => a._id === uid);
	const isReviewed = (currentApplicant?.reviewers.length ?? 0) >= 2;

	const pool = applicantList.filter((a) =>
		isReviewed ? a.reviewers.length >= 2 : a.reviewers.length < 2,
	);

	const currentIndex = pool.findIndex((a) => a._id === uid);
	const prevApplicant = currentIndex > 0 ? pool[currentIndex - 1] : null;
	const nextApplicant =
		currentIndex < pool.length - 1 ? pool[currentIndex + 1] : null;

	const otherPool = applicantList.filter((a) =>
		isReviewed ? a.reviewers.length < 2 : a.reviewers.length >= 2,
	);
	const switchTarget = otherPool.length > 0 ? otherPool[0] : null;
	const switchLabel = isReviewed
		? "Switch to Needs Review"
		: "Switch to Reviewed";

	return (
		<SpaceBetween direction="horizontal" size="xs">
			<Button
				disabled={!prevApplicant}
				onClick={() =>
					prevApplicant && router.push(`${basePath}/${prevApplicant._id}`)
				}
			>
				Previous
			</Button>
			<Button
				disabled={!nextApplicant}
				onClick={() =>
					nextApplicant && router.push(`${basePath}/${nextApplicant._id}`)
				}
			>
				Next
			</Button>
			<Button
				disabled={!switchTarget}
				onClick={() =>
					switchTarget && router.push(`${basePath}/${switchTarget._id}`)
				}
			>
				{switchLabel}
			</Button>
		</SpaceBetween>
	);
}

export default ApplicantNavigationButtons;
