"use client";

import { useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";

import UserContext from "@/lib/admin/UserContext";
import { isDirector } from "@/lib/admin/authorization";
import useHackerApplicants from "@/lib/admin/useHackerApplicants";
import useHackerReviewAssignments from "@/lib/admin/useHackerReviewAssignments";

interface ApplicantNavigationButtonsProps {
	uid: string;
	basePath: string;
}

function ApplicantNavigationButtons({
	uid,
	basePath,
}: ApplicantNavigationButtonsProps) {
	const router = useRouter();
	const { roles } = useContext(UserContext);
	const useAssignedQueue = !isDirector(roles);
	const { applicantList, loading } = useHackerApplicants();
	const { assignedApplicantIds, loading: assignmentsLoading } =
		useHackerReviewAssignments(useAssignedQueue);

	const navigationList = useMemo(() => {
		if (!useAssignedQueue) return applicantList;

		const applicantById = new Map(
			applicantList.map((applicant) => [applicant._id, applicant]),
		);
		return assignedApplicantIds.flatMap((applicantId) => {
			const applicant = applicantById.get(applicantId);
			return applicant ? [applicant] : [];
		});
	}, [applicantList, assignedApplicantIds, useAssignedQueue]);

	if (loading || assignmentsLoading || applicantList.length === 0) return null;

	if (navigationList.length === 0) return null;

	const currentIndex = navigationList.findIndex((a) => a._id === uid);

	const prevApplicant =
		currentIndex > 0 ? navigationList[currentIndex - 1] : null;

	const nextApplicant =
		currentIndex !== -1 && currentIndex < navigationList.length - 1
			? navigationList[currentIndex + 1]
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
