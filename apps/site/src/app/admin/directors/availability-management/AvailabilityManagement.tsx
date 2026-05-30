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
import Select, { SelectProps } from "@cloudscape-design/components/select";
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
import useAvailabilityTemplate from "@/lib/admin/useAvailabilityTemplate";
import useOrganizers from "@/lib/admin/useOrganizers";
import useTemplates from "@/lib/admin/useTemplates";

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
		mutate: mutateSubmissions,
	} = useAvailabilitySubmissions();
	const {
		isLocked,
		loading: lockLoading,
		error: lockError,
		setLocked,
	} = useAvailabilityLock();
	const {
		templateName,
		loading: availabilityTemplateLoading,
		error: availabilityTemplateError,
		requestAvailabilityTemplate,
		resetAvailabilityTemplate,
	} = useAvailabilityTemplate();
	const { templateList, loading: templatesLoading } = useTemplates();

	const [savingLock, setSavingLock] = useState(false);
	const [clearingAvailability, setClearingAvailability] = useState(false);
	const [clearModalVisible, setClearModalVisible] = useState(false);
	const [requestingTemplate, setRequestingTemplate] = useState(false);
	const [resettingTemplate, setResettingTemplate] = useState(false);
	const [resetModalVisible, setResetModalVisible] = useState(false);
	const [selectedTemplate, setSelectedTemplate] =
		useState<SelectProps.Option | null>(null);

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

	async function handleRequestTemplate() {
		if (!selectedTemplate?.value) return;

		try {
			setRequestingTemplate(true);
			await requestAvailabilityTemplate(selectedTemplate.value);
			await mutateSubmissions([], false);
			showNotification("Availability has been requested.");
		} catch (err) {
			const message =
				axios.isAxiosError(err) && err.response?.status === 404
					? "That template could not be found."
					: "Unable to request availability. Please try again.";
			showNotification(message, "error");
		} finally {
			setRequestingTemplate(false);
		}
	}

	async function handleResetTemplate() {
		try {
			setResettingTemplate(true);
			await resetAvailabilityTemplate();
			await mutateSubmissions([], false);
			setSelectedTemplate(null);
			setResetModalVisible(false);
			showNotification("Availability template has been reset.");
		} catch (err) {
			const message =
				axios.isAxiosError(err) && err.response?.status === 403
					? "Only directors can reset the availability template."
					: "Unable to reset availability template. Please try again.";
			showNotification(message, "error");
		} finally {
			setResettingTemplate(false);
		}
	}

	const router = useRouter();

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	const loading =
		organizersLoading ||
		submissionsLoading ||
		lockLoading ||
		availabilityTemplateLoading ||
		templatesLoading;
	const error =
		organizersError ||
		submissionsError ||
		lockError ||
		availabilityTemplateError;

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

	const templateOptions: SelectProps.Options = templateList.map((template) => ({
		label: template.name,
		value: template.name,
		description:
			template.startDate && template.endDate
				? `${new Date(template.startDate).toLocaleDateString()} - ${new Date(
						template.endDate,
				  ).toLocaleDateString()}`
				: undefined,
	}));

	if (!templateName) {
		return (
			<SpaceBetween size="l">
				<Header variant="h1">Availability Management</Header>

				<Container>
					<SpaceBetween size="m">
						<Header variant="h2">Choose a template</Header>
						{templateList.length === 0 ? (
							<Alert type="info" header="No templates created">
								Create a shift template before requesting organizer
								availability.
							</Alert>
						) : (
							<SpaceBetween direction="horizontal" size="s" alignItems="center">
								<div style={{ width: "360px" }}>
									<Select
										selectedOption={selectedTemplate}
										onChange={({ detail }) =>
											setSelectedTemplate(detail.selectedOption)
										}
										options={templateOptions}
										placeholder="Choose a template"
									/>
								</div>
								<Button
									variant="primary"
									onClick={handleRequestTemplate}
									disabled={!selectedTemplate?.value}
									loading={requestingTemplate}
								>
									Submit
								</Button>
							</SpaceBetween>
						)}
					</SpaceBetween>
				</Container>
			</SpaceBetween>
		);
	}

	return (
		<SpaceBetween size="l">
			<Header
				variant="h1"
				description={`Current template: ${templateName}`}
				actions={
					<Button
						onClick={() => setResetModalVisible(true)}
						disabled={resettingTemplate}
						loading={resettingTemplate}
					>
						Reset template
					</Button>
				}
			>
				{templateName} Availability Management
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

			<Modal
				visible={resetModalVisible}
				onDismiss={() => {
					if (!resettingTemplate) {
						setResetModalVisible(false);
					}
				}}
				header="Reset availability template?"
				footer={
					<Box float="right">
						<SpaceBetween direction="horizontal" size="xs">
							<Button
								variant="link"
								disabled={resettingTemplate}
								onClick={() => setResetModalVisible(false)}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								loading={resettingTemplate}
								onClick={handleResetTemplate}
							>
								Reset template
							</Button>
						</SpaceBetween>
					</Box>
				}
			>
				<TextContent>
					<p>
						Are you sure you want to clear all availabilities? This resets the
						current template and removes every organizer&apos;s submitted
						availability.
					</p>
				</TextContent>
			</Modal>
		</SpaceBetween>
	);
}
