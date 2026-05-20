"use client";

import { useContext, useEffect, useState } from "react";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";
import axios from "axios";

import NotificationContext from "@/lib/admin/NotificationContext";
import useAvailability, { AvailabilitySlot } from "@/lib/admin/useAvailability";
import useAvailabilityLock from "@/lib/admin/useAvailabilityLock";

type AvailabilityStatus = "not-submitted" | "submitted" | "editing";
type DragMode = "select" | "deselect" | null;

type EventDay = {
	date: string;
	label: string;
	weekday: string;
};

const EVENT_DAYS: EventDay[] = [
	{ date: "2027-10-09", label: "Oct 9", weekday: "Fri" },
	{ date: "2027-10-10", label: "Oct 10", weekday: "Sat" },
	{ date: "2027-10-11", label: "Oct 11", weekday: "Sun" },
];

const SLOT_START_MINUTES = Array.from(
	{ length: 30 },
	(_, index) => 9 * 60 + index * 30,
);

function formatSlotTime(totalMinutes: number) {
	const hour = Math.floor(totalMinutes / 60);
	const minute = totalMinutes % 60;
	const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
	const period = hour >= 12 ? "PM" : "AM";
	return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

function formatHourLabel(totalMinutes: number) {
	const hour = Math.floor(totalMinutes / 60);
	const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
	const period = hour >= 12 ? "PM" : "AM";
	return `${displayHour} ${period}`;
}

function getSlotStartTime(totalMinutes: number) {
	const hour = Math.floor(totalMinutes / 60);
	const minute = totalMinutes % 60;
	return `${hour.toString().padStart(2, "0")}:${minute
		.toString()
		.padStart(2, "0")}`;
}

function getBlockId(date: string, startTime: string) {
	return `${date}-${startTime}`;
}

function slotsToBlockIds(availability: AvailabilitySlot[]) {
	return new Set(
		availability.map((slot) => getBlockId(slot.date, slot.start_time)),
	);
}

function blockIdsToSlots(blockIds: Set<string>): AvailabilitySlot[] {
	return Array.from(blockIds)
		.map((blockId) => {
			const [year, month, day, startTime] = blockId.split("-");
			return {
				date: `${year}-${month}-${day}`,
				start_time: startTime,
			};
		})
		.sort(
			(a, b) =>
				a.date.localeCompare(b.date) ||
				a.start_time.localeCompare(b.start_time),
		);
}

export default function MyAvailability() {
	const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
	const [status, setStatus] = useState<AvailabilityStatus>("not-submitted");
	const [dragMode, setDragMode] = useState<DragMode>(null);
	const [saving, setSaving] = useState(false);

	const { setNotifications } = useContext(NotificationContext);
	const {
		availability,
		submittedAt,
		loading: availabilityLoading,
		error: availabilityError,
		submitAvailability,
	} = useAvailability();
	const {
		isLocked,
		loading: lockLoading,
		error: lockError,
	} = useAvailabilityLock();

	useEffect(() => {
		setSelectedBlocks(slotsToBlockIds(availability));
		setStatus(submittedAt ? "submitted" : "not-submitted");
	}, [availability, submittedAt]);

	const selectedCount = selectedBlocks.size;
	const isLoading = availabilityLoading || lockLoading;
	const error = availabilityError || lockError;
	const isEditable = !isLocked && status !== "submitted" && !saving;

	function showSuccessNotification(content: string) {
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

	function applyBlockSelection(blockId: string, mode: Exclude<DragMode, null>) {
		setSelectedBlocks((previous) => {
			const next = new Set(previous);

			if (mode === "select") {
				next.add(blockId);
			} else {
				next.delete(blockId);
			}

			return next;
		});
	}

	function handleBlockMouseDown(date: string, startTime: string) {
		if (!isEditable) return;

		const blockId = getBlockId(date, startTime);
		const nextDragMode: Exclude<DragMode, null> = selectedBlocks.has(blockId)
			? "deselect"
			: "select";

		setDragMode(nextDragMode);
		applyBlockSelection(blockId, nextDragMode);
	}

	function handleBlockMouseEnter(date: string, startTime: string) {
		if (!isEditable || dragMode === null) return;

		const blockId = getBlockId(date, startTime);
		applyBlockSelection(blockId, dragMode);
	}

	function stopDragging() {
		setDragMode(null);
	}

	function showErrorNotification(content: string) {
		if (!setNotifications) return;

		setNotifications([
			{
				type: "error",
				content,
				dismissible: true,
				onDismiss: () => setNotifications([]),
			},
		]);
	}

	async function handleSubmit() {
		const wasEditing = status === "editing";

		try {
			setSaving(true);
			await submitAvailability(blockIdsToSlots(selectedBlocks));
			setStatus("submitted");

			showSuccessNotification(
				wasEditing
					? "Availability updated successfully."
					: "Availability submitted successfully.",
			);
		} catch (err) {
			const message =
				axios.isAxiosError(err) && err.response?.status === 403
					? "Availability submissions are locked."
					: "Unable to save availability. Please try again.";
			showErrorNotification(message);
		} finally {
			setSaving(false);
		}
	}

	function handleEdit() {
		if (isLocked) return;
		setStatus("editing");
	}

	if (isLoading) {
		return (
			<SpaceBetween size="l">
				<Header variant="h1">IrvineHacks 2027 Availability</Header>

				<Container>
					<SpaceBetween size="s" direction="horizontal" alignItems="center">
						<Spinner />
						<Box color="text-body-secondary">Loading availability...</Box>
					</SpaceBetween>
				</Container>
			</SpaceBetween>
		);
	}

	if (error) {
		return (
			<SpaceBetween size="l">
				<Header variant="h1">IrvineHacks 2027 Availability</Header>

				<Alert type="error" header="Unable to load availability">
					Please refresh the page and try again.
				</Alert>
			</SpaceBetween>
		);
	}

	return (
		<SpaceBetween size="s">
			<Header
				variant="h1"
				description="Please provide at least X hours of availability across the entire event."
				actions={
					status === "submitted" ? (
						<Button onClick={handleEdit} disabled={isLocked}>
							Edit Availability
						</Button>
					) : (
						<Button
							variant="primary"
							onClick={handleSubmit}
							disabled={isLocked || selectedCount === 0 || saving}
							loading={saving}
						>
							Submit Availability
						</Button>
					)
				}
			>
				IrvineHacks 2027 Availability
			</Header>

			<SpaceBetween size="s">
				{isLocked && (
					<Alert type="warning" header="Availability is locked">
						Availability submissions are no longer editable.
					</Alert>
				)}

				<Box>Shifts before 10 AM are worth 2x points.</Box>

				<div
					onMouseUp={stopDragging}
					onMouseLeave={stopDragging}
					style={{
						display: "grid",
						gridTemplateColumns: "64px 1fr",
						maxWidth: "1180px",
						userSelect: "none",
					}}
				>
					<div>
						<div style={{ height: "58px" }} />

						{SLOT_START_MINUTES.map((slotStartMinutes) => (
							<Box key={slotStartMinutes} fontSize="body-m">
								<div
									style={{
										height: "28px",
										display: "flex",
										alignItems: "flex-start",
									}}
								>
									{slotStartMinutes % 60 === 0
										? formatHourLabel(slotStartMinutes)
										: ""}
								</div>
							</Box>
						))}
					</div>

					<div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(3, 1fr)",
								height: "58px",
							}}
						>
							{EVENT_DAYS.map((day) => (
								<div
									key={day.date}
									style={{
										textAlign: "center",
										display: "flex",
										flexDirection: "column",
										justifyContent: "flex-end",
										paddingBottom: "10px",
									}}
								>
									<div style={{ fontSize: "16px" }}>{day.label}</div>

									<div style={{ fontSize: "22px" }}>{day.weekday}</div>
								</div>
							))}
						</div>

						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(3, 1fr)",
								borderTop: "1px solid #d0d0d0",
								borderLeft: "1px solid #d0d0d0",
								borderBottom: "1px solid #d0d0d0",
							}}
						>
							{EVENT_DAYS.map((day) => (
								<div
									key={day.date}
									style={{
										display: "flex",
										flexDirection: "column",
										borderRight: "1px solid #111",
									}}
								>
									{SLOT_START_MINUTES.map((slotStartMinutes, slotIndex) => {
										const startTime = getSlotStartTime(slotStartMinutes);
										const blockId = getBlockId(day.date, startTime);
										const isSelected = selectedBlocks.has(blockId);

										return (
											<button
												key={blockId}
												type="button"
												disabled={!isEditable}
												aria-pressed={isSelected}
												aria-label={`${day.weekday}, ${
													day.label
												}, ${formatSlotTime(slotStartMinutes)}`}
												onMouseDown={(event) => {
													event.preventDefault();
													handleBlockMouseDown(day.date, startTime);
												}}
												onMouseEnter={() =>
													handleBlockMouseEnter(day.date, startTime)
												}
												style={{
													height: "28px",
													border: "none",
													borderBottom:
														slotIndex === SLOT_START_MINUTES.length - 1
															? "none"
															: "1px dotted #8f8f8f",
													background: isSelected ? "#bfbfbf" : "white",
													cursor: isEditable ? "pointer" : "default",
													padding: 0,
												}}
											/>
										);
									})}
								</div>
							))}
						</div>
					</div>
				</div>
			</SpaceBetween>
		</SpaceBetween>
	);
}
