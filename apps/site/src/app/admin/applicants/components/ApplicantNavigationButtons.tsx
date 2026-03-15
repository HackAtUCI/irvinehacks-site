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

	const currentIndex = applicantList.findIndex((a) => a._id === uid);

	const prevApplicant =
		currentIndex > 0 ? applicantList[currentIndex - 1] : null;

	const nextApplicant =
		currentIndex < applicantList.length - 1
			? applicantList[currentIndex + 1]
			: null;

	const unreviewedApplicants = applicantList.filter(
		(a) => (a.reviewers?.length ?? 0) < 2,
	);

	const nextUnreviewed =
		applicantList
			.slice(currentIndex + 1)
			.find((a) => (a.reviewers?.length ?? 0) < 2) ?? unreviewedApplicants[0];

	const allReviewed = unreviewedApplicants.length === 0;

	const lastUnreviewed =
		!allReviewed &&
		unreviewedApplicants[unreviewedApplicants.length - 1]._id === uid;

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
				disabled={allReviewed || lastUnreviewed}
				onClick={() =>
					nextUnreviewed && router.push(`${basePath}/${nextUnreviewed._id}`)
				}
			>
				Next Unreviewed
			</Button>
		</SpaceBetween>
	);
}

export default ApplicantNavigationButtons;
