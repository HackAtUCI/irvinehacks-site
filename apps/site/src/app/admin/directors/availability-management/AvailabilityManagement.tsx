"use client";

import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";
import TextContent from "@cloudscape-design/components/text-content";
import Toggle from "@cloudscape-design/components/toggle";
import axios from "axios";

import { isDirector } from "@/lib/admin/authorization";
import NotificationContext from "@/lib/admin/NotificationContext";
import UserContext from "@/lib/admin/UserContext";

import useAvailabilityLock from "@/lib/admin/useAvailabilityLock";
import useAvailabilitySubmissions from "@/lib/admin/useAvailabilitySubmissions";
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

	const {
		organizerList,
		loading: organizersLoading,
		error: organizersError,
	} = useOrganizers();
	const {
		submittedOrganizerIds,
		loading: submissionsLoading,
		error: submissionsError,
		clearAvailability,
	} = useAvailabilitySubmissions();
	const {
		isLocked,
		loading: lockLoading,
		error: lockError,
		setLocked,
	} = useAvailabilityLock();

	const [savingLock, setSavingLock] = useState(false);
	const [clearingAvailability, setClearingAvailability] = useState(false);
	const [clearModalVisible, setClearModalVisible] = useState(false);

	const submittedOrganizerIdSet = useMemo(
		() => new Set(submittedOrganizerIds),
		[submittedOrganizerIds],
	);

	const organizers: AvailabilityOrganizer[] = useMemo(() => {
		return organizerList.map((organizer) => ({
			id: organizer._id,
			name: getOrganizerName(organizer.first_name, organizer.last_name),
			committee: getPrimaryCommittee(organizer.committees),
			hasSubmitted: submittedOrganizerIdSet.has(organizer._id),
		}));
	}, [organizerList, submittedOrganizerIdSet]);

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

	function showNotification(
		content: string,
		type: "success" | "error" = "success",
	) {
		if (!setNotifications) return;

		setNotifications([
			{
				type,
				content,
				dismissible: true,
				onDismiss: () => setNotifications([]),
			},
		]);

		window.setTimeout(() => {
			setNotifications([]);
		}, 3000);
	}

	async function handleLockToggle(checked: boolean) {
		try {
			setSavingLock(true);
			const nextLocked = await setLocked(checked);

			showNotification(
				nextLocked
					? "Availability submissions are now locked."
					: "Availability submissions are now unlocked.",
			);
		} catch (err) {
			const message =
				axios.isAxiosError(err) && err.response?.status === 403
					? "Only directors can update the availability lock."
					: "Unable to update availability lock. Please try again.";
			showNotification(message, "error");
		} finally {
			setSavingLock(false);
		}
	}

	async function handleClearAvailability() {
		try {
			setClearingAvailability(true);
			await clearAvailability();
			setClearModalVisible(false);
			showNotification("All availability submissions have been cleared.");
		} catch (err) {
			const message =
				axios.isAxiosError(err) && err.response?.status === 403
					? "Only directors can clear availability submissions."
					: "Unable to clear availability submissions. Please try again.";
			showNotification(message, "error");
		} finally {
			setClearingAvailability(false);
		}
	}

	const router = useRouter();

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	const loading = organizersLoading || submissionsLoading || lockLoading;
	const error = organizersError || submissionsError || lockError;

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

			<Container header={<Header variant="h2">Availability</Header>}>
				<SpaceBetween size="l">
					<SpaceBetween size="m">
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: "24px",
							}}
						>
							<div>
								<Box fontSize="heading-m">Lock Availability</Box>
								<Box color="text-body-secondary">
									Organizers can no longer edit their submissions
								</Box>
							</div>

							<Toggle
								checked={isLocked}
								disabled={savingLock}
								onChange={({ detail }) => handleLockToggle(detail.checked)}
							>
								Lock Availability
							</Toggle>
						</div>

						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: "24px",
							}}
						>
							<div>
								<Box fontSize="heading-m">Clear All Availability</Box>
								<Box color="text-body-secondary">
									Remove all recorded availabilities
								</Box>
							</div>

							<Button
								variant="primary"
								disabled={submittedCount === 0}
								onClick={() => setClearModalVisible(true)}
							>
								Confirm
							</Button>
						</div>
					</SpaceBetween>

					<hr
						style={{
							border: 0,
							borderTop: "1px solid #d5dbdb",
							margin: 0,
						}}
					/>

					{organizers.length === 0 ? (
						<Alert type="info" header="No organizers found">
							There are no organizers to display yet.
						</Alert>
					) : (
						<>
							<OrganizerGroup
								title="Submitted"
								organizers={submittedOrganizers}
							/>
							<OrganizerGroup
								title="Not Submitted"
								organizers={notSubmittedOrganizers}
							/>
						</>
					)}
				</SpaceBetween>
			</Container>

			<Modal
				visible={clearModalVisible}
				onDismiss={() => {
					if (!clearingAvailability) {
						setClearModalVisible(false);
					}
				}}
				header="Clear all availability?"
				footer={
					<Box float="right">
						<SpaceBetween direction="horizontal" size="xs">
							<Button
								variant="link"
								disabled={clearingAvailability}
								onClick={() => setClearModalVisible(false)}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								loading={clearingAvailability}
								onClick={handleClearAvailability}
							>
								Clear all availability
							</Button>
						</SpaceBetween>
					</Box>
				}
			>
				<TextContent>
					<p>
						This removes every organizer&apos;s submitted availability. This
						action cannot be undone.
					</p>
				</TextContent>
			</Modal>
		</SpaceBetween>
	);
}
