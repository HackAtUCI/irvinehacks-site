"use client";

import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";
import Toggle from "@cloudscape-design/components/toggle";

import { isDirector } from "@/lib/admin/authorization";
import NotificationContext from "@/lib/admin/NotificationContext";
import UserContext from "@/lib/admin/UserContext";

import useOrganizers from "@/lib/admin/useOrganizers";

type AvailabilityOrganizer = {
	id: string;
	name: string;
	committee: string;
	hasSubmitted: boolean;
};

const COMMITTEE_BADGE_COLORS: Record<string, string> = {
	Corporate: "#ead7ff",
	Design: "#d7eadf",
	Logistics: "#fff0c2",
	Marketing: "#d8e8ff",
	Tech: "#ffd8c9",
	Unassigned: "#e9ebed",
};

function getOrganizerName(firstName: string, lastName: string) {
	const fullName = `${firstName} ${lastName}`.trim();
	return fullName || "Unknown Organizer";
}

function getPrimaryCommittee(committees: string[] | undefined) {
	if (!committees || committees.length === 0) {
		return "Unassigned";
	}

	const raw = committees[0];
	return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function getCommitteeColor(committee: string) {
	return COMMITTEE_BADGE_COLORS[committee] ?? "#e9ebed";
}

function groupByCommittee(organizers: AvailabilityOrganizer[]) {
	return organizers.reduce<Record<string, AvailabilityOrganizer[]>>(
		(groups, organizer) => {
			if (!groups[organizer.committee]) {
				groups[organizer.committee] = [];
			}

			groups[organizer.committee].push(organizer);
			return groups;
		},
		{},
	);
}

function OrganizerGroup({
	title,
	organizers,
}: {
	title: string;
	organizers: AvailabilityOrganizer[];
}) {
	const groupedOrganizers = groupByCommittee(organizers);

	return (
		<SpaceBetween size="m">
			<Header variant="h3">{title}</Header>

			{Object.entries(groupedOrganizers).map(
				([committee, committeeOrganizers]) => (
					<SpaceBetween key={committee} size="xs">
						<Box fontWeight="bold">{committee}</Box>

						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: "8px",
							}}
						>
							{committeeOrganizers.map((organizer) => (
								<span
									key={organizer.id}
									style={{
										backgroundColor: getCommitteeColor(organizer.committee),
										borderRadius: "8px",
										padding: "4px 10px",
										fontSize: "14px",
									}}
								>
									{organizer.name}
								</span>
							))}
						</div>
					</SpaceBetween>
				),
			)}
		</SpaceBetween>
	);
}

export default function AvailabilityManagement() {
	const { roles } = useContext(UserContext);
	const { setNotifications } = useContext(NotificationContext);

	const { organizerList, loading, error } = useOrganizers();

	const [isLocked, setIsLocked] = useState(false);

	const organizers: AvailabilityOrganizer[] = useMemo(() => {
		return organizerList.map((organizer) => ({
			id: organizer._id,
			name: getOrganizerName(organizer.first_name, organizer.last_name),
			committee: getPrimaryCommittee(organizer.committees),

			// TODO: Replace with real availability submission status once backend exists.
			hasSubmitted: false,
		}));
	}, [organizerList]);

	const submittedOrganizers = useMemo(
		() => organizers.filter((organizer) => organizer.hasSubmitted),
		[organizers],
	);

	const notSubmittedOrganizers = useMemo(
		() => organizers.filter((organizer) => !organizer.hasSubmitted),
		[organizers],
	);

	const totalOrganizerCount = organizers.length;
	const submittedCount = submittedOrganizers.length;
	const notSubmittedCount = notSubmittedOrganizers.length;

	function showNotification(content: string) {
		if (!setNotifications) return;

		setNotifications([
			{
				type: "success",
				content,
				dismissible: true,
				onDismiss: () => setNotifications([]),
			},
		]);

		window.setTimeout(() => {
			setNotifications([]);
		}, 3000);
	}

	function handleLockToggle(checked: boolean) {
		setIsLocked(checked);

		showNotification(
			checked
				? "Availability submissions are now locked."
				: "Availability submissions are now unlocked.",
		);
	}

    const router = useRouter();

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	if (loading) {
		return (
			<SpaceBetween size="l">
				<Header variant="h1">Availability Management</Header>

				<Container>
					<SpaceBetween size="s" direction="horizontal" alignItems="center">
						<Spinner />
						<Box color="text-body-secondary">
							Loading organizer availability...
						</Box>
					</SpaceBetween>
				</Container>
			</SpaceBetween>
		);
	}

	if (error) {
		return (
			<SpaceBetween size="l">
				<Header variant="h1">Availability Management</Header>

				<Alert type="error" header="Unable to load organizers">
					Please refresh the page and try again.
				</Alert>
			</SpaceBetween>
		);
	}

	return (
		<SpaceBetween size="l">
			<Header
				variant="h1"
				description="Monitor organizer availability submissions and lock availability before generating schedules."
			>
				Availability Management
			</Header>

			<ColumnLayout columns={3} variant="text-grid">
				<Container>
					<SpaceBetween size="xs">
						<Box fontSize="heading-xl" fontWeight="bold">
							{totalOrganizerCount}
						</Box>
						<Box fontWeight="bold">Total organizers</Box>
					</SpaceBetween>
				</Container>

				<Container>
					<SpaceBetween size="xs">
						<Box
							fontSize="heading-xl"
							fontWeight="bold"
							color="text-status-success"
						>
							{submittedCount}
						</Box>
						<Box fontWeight="bold">Submitted</Box>
					</SpaceBetween>
				</Container>

				<Container>
					<SpaceBetween size="xs">
						<Box
							fontSize="heading-xl"
							fontWeight="bold"
							color="text-status-error"
						>
							{notSubmittedCount}
						</Box>
						<Box fontWeight="bold">Not submitted</Box>
					</SpaceBetween>
				</Container>
			</ColumnLayout>

			<Container
				header={
					<Header
						variant="h2"
						description="Organizers can no longer edit their availability."
						actions={
							<Toggle
								checked={isLocked}
								onChange={({ detail }) => handleLockToggle(detail.checked)}
							>
								Lock Availability
							</Toggle>
						}
					>
						Availability
					</Header>
				}
			>
				<SpaceBetween size="l">
					{organizers.length === 0 ? (
						<Alert type="info" header="No organizers found">
							There are no organizers to display yet.
						</Alert>
					) : (
						<OrganizerGroup
							title="Not Submitted"
							organizers={notSubmittedOrganizers}
						/>
					)}
				</SpaceBetween>
			</Container>
		</SpaceBetween>
	);
}
