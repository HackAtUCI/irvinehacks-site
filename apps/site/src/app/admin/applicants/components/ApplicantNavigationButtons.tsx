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
		currentIndex !== -1 && currentIndex < applicantList.length - 1
			? applicantList[currentIndex + 1]
			: null;

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
		</SpaceBetween>
	);
}

export default ApplicantNavigationButtons;
