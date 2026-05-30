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
import useAvailabilityTemplate, {
	AvailabilityTemplateShift,
} from "@/lib/admin/useAvailabilityTemplate";

type AvailabilityStatus = "not-submitted" | "submitted" | "editing";
type DragMode = "select" | "deselect" | null;

type EventDay = {
	date: string;
	label: string;
	weekday: string;
};

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

function getDatePart(dateTime: string) {
	return dateTime.split("T")[0] ?? "";
}

function getMinutesFromDateTime(dateTime: string) {
	const time = dateTime.split("T")[1]?.slice(0, 5) ?? "00:00";
	const [hour, minute] = time.split(":").map(Number);
	return hour * 60 + minute;
}

function getEventDays(eventDates: string[]): EventDay[] {
	if (eventDates.length === 0) return [];

	const startDate = getDatePart(eventDates[0]);
	const endDate = getDatePart(eventDates[eventDates.length - 1]);
	if (!startDate || !endDate) return [];

	const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
	const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
	const current = new Date(Date.UTC(startYear, startMonth - 1, startDay));
	const end = new Date(Date.UTC(endYear, endMonth - 1, endDay));
	const days: EventDay[] = [];

	while (current <= end) {
		const date = current.toISOString().slice(0, 10);
		days.push({
			date,
			label: current.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				timeZone: "UTC",
			}),
			weekday: current.toLocaleDateString("en-US", {
				weekday: "short",
				timeZone: "UTC",
			}),
		});
		current.setUTCDate(current.getUTCDate() + 1);
	}

	return days;
}

function getSlotStartMinutes(
	eventDates: string[],
	shifts: AvailabilityTemplateShift[],
) {
	const shiftTimes = shifts.flatMap((shift) => [
		getMinutesFromDateTime(shift.hour.start_time),
		getMinutesFromDateTime(shift.hour.end_time),
	]);
	const start =
		shiftTimes.length > 0
			? Math.min(...shiftTimes)
			: eventDates[0]
			  ? getMinutesFromDateTime(eventDates[0])
			  : 9 * 60;
	const end =
		shiftTimes.length > 0
			? Math.max(...shiftTimes)
			: eventDates[eventDates.length - 1]
			  ? getMinutesFromDateTime(eventDates[eventDates.length - 1])
			  : 24 * 60;
	const roundedStart = Math.floor(start / 30) * 30;
	const roundedEnd = Math.ceil(end / 30) * 30;
	const slotCount = Math.max((roundedEnd - roundedStart) / 30, 0);

	return Array.from(
		{ length: slotCount },
		(_, index) => roundedStart + index * 30,
	);
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
		template,
		templateName,
		loading: templateLoading,
		error: templateError,
	} = useAvailabilityTemplate();
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
	const isLoading = availabilityLoading || lockLoading || templateLoading;
	const error = availabilityError || lockError || templateError;
	const isEditable = !isLocked && status !== "submitted" && !saving;
	const eventDays = template ? getEventDays(template.event_dates) : [];
	const slotStartMinutes = template
		? getSlotStartMinutes(template.event_dates, template.shifts)
		: [];

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
				<Header variant="h1">My Availability</Header>

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
				<Header variant="h1">My Availability</Header>

				<Alert type="error" header="Unable to load availability">
					Please refresh the page and try again.
				</Alert>
			</SpaceBetween>
		);
	}

	if (!templateName || !template) {
		return (
			<SpaceBetween size="l">
				<Header variant="h1">My Availability</Header>

				<Alert type="info" header="Availability has not been requested">
					Directors have not opened organizer availability yet.
				</Alert>
			</SpaceBetween>
		);
	}

	if (eventDays.length === 0 || slotStartMinutes.length === 0) {
		return (
			<SpaceBetween size="l">
				<Header variant="h1">{templateName} Availability</Header>

				<Alert type="warning" header="Template is missing availability times">
					Ask a director to add event dates and shifts before submitting
					availability.
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
				{templateName} Availability
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
						{slotStartMinutes.map((slotStartMinute) => (
							<Box key={slotStartMinute} fontSize="body-m">
								<div
									style={{
										height: "28px",
										display: "flex",
										alignItems: "flex-start",
									}}
								>
									{slotStartMinute % 60 === 0
										? formatHourLabel(slotStartMinute)
										: ""}
								</div>
							</Box>
						))}
					</div>

					<div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: `repeat(${eventDays.length}, 1fr)`,
								height: "58px",
							}}
						>
							{eventDays.map((day) => (
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
								gridTemplateColumns: `repeat(${eventDays.length}, 1fr)`,
								borderTop: "1px solid #d0d0d0",
								borderLeft: "1px solid #d0d0d0",
								borderBottom: "1px solid #d0d0d0",
							}}
						>
							{eventDays.map((day) => (
								<div
									key={day.date}
									style={{
										display: "flex",
										flexDirection: "column",
										borderRight: "1px solid #111",
									}}
								>
									{slotStartMinutes.map((slotStartMinute, slotIndex) => {
										const startTime = getSlotStartTime(slotStartMinute);
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
												}, ${formatSlotTime(slotStartMinute)}`}
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
														slotIndex === slotStartMinutes.length - 1
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
