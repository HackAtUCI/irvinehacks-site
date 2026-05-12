"use client";

import { useContext, useState } from "react";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

import NotificationContext from "@/lib/admin/NotificationContext";

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

const HOURS = Array.from({ length: 16 }, (_, index) => 9 + index);

function formatHour(hour: number) {
	if (hour === 24) return "12 AM";
	if (hour === 12) return "12 PM";
	if (hour > 12) return `${hour - 12} PM`;
	return `${hour} AM`;
}

function getBlockId(date: string, hour: number) {
	return `${date}-${hour}`;
}

export default function MyAvailability() {
	const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
	const [status, setStatus] = useState<AvailabilityStatus>("not-submitted");
	const [dragMode, setDragMode] = useState<DragMode>(null);

	const { setNotifications } = useContext(NotificationContext);

	// TODO: locked feature from backend
	const isLocked = false;

	const selectedCount = selectedBlocks.size;
	const isEditable = !isLocked && status !== "submitted";

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

	function handleBlockMouseDown(date: string, hour: number) {
		if (!isEditable) return;

		const blockId = getBlockId(date, hour);
		const nextDragMode: Exclude<DragMode, null> = selectedBlocks.has(blockId)
			? "deselect"
			: "select";

		setDragMode(nextDragMode);
		applyBlockSelection(blockId, nextDragMode);
	}

	function handleBlockMouseEnter(date: string, hour: number) {
		if (!isEditable || dragMode === null) return;

		const blockId = getBlockId(date, hour);
		applyBlockSelection(blockId, dragMode);
	}

	function stopDragging() {
		setDragMode(null);
	}

	function handleSubmit() {
		const wasEditing = status === "editing";

		// TODO: submit to backend
		setStatus("submitted");

		showSuccessNotification(
			wasEditing
				? "Availability updated successfully."
				: "Availability submitted successfully.",
		);
	}

	function handleEdit() {
		if (isLocked) return;
		setStatus("editing");
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
							disabled={isLocked || selectedCount === 0}
						>
							Submit Availability
						</Button>
					)
				}
			>
				IrvineHacks 2027 Availability
			</Header>

			<SpaceBetween size="s">
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

						{HOURS.map((hour) => (
							<Box key={hour} fontSize="body-m">
								<div
									style={{
										height: "44px",
										display: "flex",
										alignItems: "flex-start",
									}}
								>
									{formatHour(hour)}
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
									{HOURS.map((hour, hourIndex) => {
										const blockId = getBlockId(day.date, hour);
										const isSelected = selectedBlocks.has(blockId);

										return (
											<button
												key={blockId}
												type="button"
												disabled={!isEditable}
												aria-pressed={isSelected}
												aria-label={`${day.weekday}, ${day.label}, ${formatHour(
													hour,
												)}`}
												onMouseDown={(event) => {
													event.preventDefault();
													handleBlockMouseDown(day.date, hour);
												}}
												onMouseEnter={() =>
													handleBlockMouseEnter(day.date, hour)
												}
												style={{
													height: "44px",
													border: "none",
													borderBottom:
														hourIndex === HOURS.length - 1
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