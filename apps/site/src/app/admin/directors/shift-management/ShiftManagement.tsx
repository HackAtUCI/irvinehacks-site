"use client";

import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import Modal from "@cloudscape-design/components/modal";
import Select, { SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";
import TextContent from "@cloudscape-design/components/text-content";
import axios from "axios";

import { isDirector } from "@/lib/admin/authorization";
import NotificationContext from "@/lib/admin/NotificationContext";
import UserContext from "@/lib/admin/UserContext";

import useAvailabilityTemplate from "@/lib/admin/useAvailabilityTemplate";
import useOrganizers from "@/lib/admin/useOrganizers";
import useTemplates from "@/lib/admin/useTemplates";

interface GenerateDraftResponse {
	draft: { draft_name: string };
	status: "optimal" | "feasible";
	understaffed_shifts: string[];
	under_points_floor: string[];
	warnings: string[];
}

export default function ShiftManagement() {
	const { roles } = useContext(UserContext);
	const { setNotifications } = useContext(NotificationContext);

	const {
		organizerList,
		loading: organizersLoading,
		error: organizersError,
	} = useOrganizers();

	const {
		templateName,
		loading: availabilityTemplateLoading,
		error: availabilityTemplateError,
		requestAvailabilityTemplate,
		resetAvailabilityTemplate,
	} = useAvailabilityTemplate();
	const {
		templateList,
		loading: templatesLoading,
		mutate: mutateTemplates,
	} = useTemplates();

	const [clearingAvailability, setClearingAvailability] = useState(false);
	const [clearModalVisible, setClearModalVisible] = useState(false);
	const [requestingTemplate, setRequestingTemplate] = useState(false);
	const [resettingTemplate, setResettingTemplate] = useState(false);
	const [resetModalVisible, setResetModalVisible] = useState(false);
	const [selectedTemplate, setSelectedTemplate] =
		useState<SelectProps.Option | null>(null);
	const [minimumPts, setMinimumPts] = useState("");
	const [draftName, setDraftName] = useState("");
	const [generateModalVisible, setGenerateModalVisible] = useState(false);
	const [generatingDraft, setGeneratingDraft] = useState(false);
	const [generateError, setGenerateError] = useState<string | null>(null);
	const [lastDraftResult, setLastDraftResult] =
		useState<GenerateDraftResponse | null>(null);

	const minimumPtsValid = /^\d+$/.test(minimumPts.trim());

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

	async function handleClearAvailability() {
		try {
			setClearingAvailability(true);
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
			setSelectedTemplate(null);
			setResetModalVisible(false);
			showNotification("Availability template has been reset.");
		} catch (err) {
			const message =
				axios.isAxiosError(err) && err.response?.status === 403
					? "Only directors can reset the template."
					: "Unable to reset template. Please try again.";
			showNotification(message, "error");
		} finally {
			setResettingTemplate(false);
		}
	}

	async function handleGenerateDraft() {
		if (!templateName || !draftName.trim() || !minimumPtsValid) return;

		try {
			setGeneratingDraft(true);
			setGenerateError(null);
			const res = await axios.post<GenerateDraftResponse>(
				`/api/director/templates/${encodeURIComponent(
					templateName,
				)}/generate-draft`,
				{
					draft_name: draftName.trim(),
					minimum_pts: Number(minimumPts.trim()),
				},
			);
			setLastDraftResult(res.data);
			setGenerateModalVisible(false);
			setDraftName("");
			await mutateTemplates();
			showNotification(`Draft "${res.data.draft.draft_name}" has been created.`);
		} catch (err) {
			let message = "Unable to generate a draft. Please try again.";
			if (axios.isAxiosError(err)) {
				const detail = err.response?.data?.detail;
				if (err.response?.status === 400) {
					message = "A draft with that name already exists.";
				} else if (err.response?.status === 404) {
					message = "That template could not be found.";
				} else if (err.response?.status === 422) {
					const shifts: string[] = detail?.shifts_without_candidates ?? [];
					message =
						(detail?.message ?? "No feasible schedule exists.") +
						(shifts.length > 0
							? ` Shifts with no available, eligible organizers: ${shifts.join(
									", ",
							  )}.`
							: "");
				}
			}
			setGenerateError(message);
		} finally {
			setGeneratingDraft(false);
		}
	}

	const router = useRouter();

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	const loading =
		organizersLoading || availabilityTemplateLoading || templatesLoading;
	const error = organizersError || availabilityTemplateError;

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
				<Header variant="h1">Shift Management</Header>

				<Container>
					<SpaceBetween size="m">
						<Header variant="h2">Choose a template</Header>
						{templateList.length === 0 ? (
							<Alert type="info" header="No templates created">
								Create a shift template before creating a shift draft.
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
				{templateName} Shift Management
			</Header>

			<Container header={<Header variant="h2">Shift Settings</Header>}>
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
							<Box fontSize="heading-m">Minimum shift points</Box>
							<Box color="text-body-secondary">
								Each organizer must be assigned at least this many points.
							</Box>
						</div>
						<FormField
							errorText={
								minimumPts && !minimumPtsValid
									? "Enter a whole number of points."
									: undefined
							}
						>
							<Input
								value={minimumPts}
								onChange={({ detail }) => setMinimumPts(detail.value)}
								inputMode="numeric"
								placeholder="e.g. 4"
							/>
						</FormField>
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
							<Box fontSize="heading-m">Auto-assign shifts</Box>
							<Box color="text-body-secondary">
								Assign shifts based on availability and minimum points.
							</Box>
						</div>
						<Button
							variant="primary"
							disabled={!minimumPtsValid}
							onClick={() => {
								setGenerateError(null);
								setGenerateModalVisible(true);
							}}
						>
							Auto-assign
						</Button>
					</div>
				</SpaceBetween>
			</Container>

			{lastDraftResult &&
				(lastDraftResult.understaffed_shifts.length > 0 ||
				lastDraftResult.under_points_floor.length > 0 ||
				lastDraftResult.warnings.length > 0 ? (
					<Alert
						type="warning"
						header={`Draft "${lastDraftResult.draft.draft_name}" created with warnings`}
						dismissible
						onDismiss={() => setLastDraftResult(null)}
					>
						<SpaceBetween size="xs">
							{lastDraftResult.understaffed_shifts.length > 0 && (
								<Box>
									Understaffed shifts:{" "}
									{lastDraftResult.understaffed_shifts.join(", ")}
								</Box>
							)}
							{lastDraftResult.under_points_floor.length > 0 && (
								<Box>
									Organizers below the points minimum:{" "}
									{lastDraftResult.under_points_floor.join(", ")}
								</Box>
							)}
							{lastDraftResult.warnings.map((warning) => (
								<Box key={warning}>{warning}</Box>
							))}
						</SpaceBetween>
					</Alert>
				) : (
					<Alert
						type="success"
						header={`Draft "${lastDraftResult.draft.draft_name}" created`}
						dismissible
						onDismiss={() => setLastDraftResult(null)}
					>
						Every shift is fully staffed and every organizer meets the points
						minimum.
					</Alert>
				))}

			<Modal
				visible={generateModalVisible}
				onDismiss={() => {
					if (!generatingDraft) {
						setGenerateModalVisible(false);
					}
				}}
				header="Generate a shift draft"
				footer={
					<Box float="right">
						<SpaceBetween direction="horizontal" size="xs">
							<Button
								variant="link"
								disabled={generatingDraft}
								onClick={() => setGenerateModalVisible(false)}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								loading={generatingDraft}
								disabled={!draftName.trim()}
								onClick={handleGenerateDraft}
							>
								Generate draft
							</Button>
						</SpaceBetween>
					</Box>
				}
			>
				<SpaceBetween size="m">
					<TextContent>
						<p>
							Shifts will be assigned automatically from submitted availability,
							with at least {minimumPts.trim() || "0"} points per organizer. The
							result is saved as a new draft; the template itself is not
							changed.
						</p>
					</TextContent>
					<FormField label="Draft name" errorText={generateError ?? undefined}>
						<Input
							value={draftName}
							onChange={({ detail }) => setDraftName(detail.value)}
							placeholder="e.g. Auto draft 1"
						/>
					</FormField>
				</SpaceBetween>
			</Modal>

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
				header="Reset template?"
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
