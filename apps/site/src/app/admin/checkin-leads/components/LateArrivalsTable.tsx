"use client";

import React, { useCallback, useContext, useState } from "react";
import axios from "axios";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import { FlashbarProps } from "@cloudscape-design/components/flashbar";
import Header from "@cloudscape-design/components/header";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import TextContent from "@cloudscape-design/components/text-content";

import NotificationContext from "@/lib/admin/NotificationContext";
import useLateArrivals, { LateArrivalRecord } from "./useLateArrivals";

function formatTime(value: string): string {
	const [hours, minutes] = value.split(":");
	const date = new Date();
	date.setHours(Number(hours), Number(minutes));
	return date.toLocaleString("en-US", {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	});
}

function isPastArrivalTime(arrivalTime: string): boolean {
	const now = new Date();
	const currentHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(
		now.getMinutes(),
	).padStart(2, "0")}`;
	return currentHHMM >= arrivalTime;
}

type ModalAction =
	| { type: "waitlist"; item: LateArrivalRecord }
	| { type: "approve"; item: LateArrivalRecord }
	| { type: "reject"; item: LateArrivalRecord };

const IdCell = (item: LateArrivalRecord) => item.id;
const NameCell = (item: LateArrivalRecord) =>
	`${item.first_name} ${item.last_name}`;
const ArrivalTimeCell = (item: LateArrivalRecord) => formatTime(item.arrival_time);
const RequestedTimeCell = (item: LateArrivalRecord) =>
	item.late_arrival_edit_request ? (
		<StatusIndicator type="warning">
			{formatTime(item.late_arrival_edit_request)}
		</StatusIndicator>
	) : (
		"—"
	);
const StatusCell = (item: LateArrivalRecord) => item.status;
const DecisionCell = (item: LateArrivalRecord) => item.decision ?? "—";
const ArrivalStatusCell = (item: LateArrivalRecord) =>
	isPastArrivalTime(item.arrival_time) ? (
		<StatusIndicator type="error">Past</StatusIndicator>
	) : (
		<StatusIndicator type="success">Not Past</StatusIndicator>
	);

function LateArrivalsTable() {
	const { setNotifications } = useContext(NotificationContext);
	const { lateArrivals, loading, error, mutate } = useLateArrivals();
	const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
	const [pendingAction, setPendingAction] = useState<ModalAction | null>(null);

	const notify = useCallback(
		(type: FlashbarProps.MessageDefinition["type"], content: string) => {
			if (!setNotifications) return;
			const msgId = `${type}-${Date.now()}`;
			setNotifications((prev) => [
				{
					type,
					content,
					id: msgId,
					dismissible: true,
					onDismiss: () =>
						setNotifications((p) => p.filter((m) => m.id !== msgId)),
				},
				...prev,
			]);
		},
		[setNotifications],
	);

	const handleAction = async (action: ModalAction) => {
		const { id } = action.item;
		setLoadingIds((prev) => new Set(prev).add(id));
		try {
			if (action.type === "waitlist") {
				await axios.post(`/api/checkin-leads/move-to-waitlist/${id}`);
				notify("success", `Moved ${id} to waitlist.`);
			} else if (action.type === "approve") {
				await axios.post(`/api/checkin-leads/approve-late-arrival-edit/${id}`);
				notify("success", `Approved arrival time edit for ${id}.`);
			} else if (action.type === "reject") {
				await axios.post(`/api/checkin-leads/reject-late-arrival-edit/${id}`);
				notify("info", `Rejected arrival time edit for ${id}.`);
			}
			await mutate();
		} catch (err) {
			const detail = axios.isAxiosError(err)
				? (err.response?.data?.detail ?? err.message)
				: String(err);
			notify("error", `Action failed for ${id}: ${detail}`);
		} finally {
			setLoadingIds((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		}
	};

	const ActionCell = useCallback(
		(item: LateArrivalRecord) => {
			if (item.late_arrival_edit_request) {
				return (
					<SpaceBetween direction="horizontal" size="xs">
						<Button
							variant="inline-link"
							loading={loadingIds.has(item.id)}
							onClick={() => setPendingAction({ type: "approve", item })}
						>
							Approve
						</Button>
						<Button
							variant="inline-link"
							loading={loadingIds.has(item.id)}
							onClick={() => setPendingAction({ type: "reject", item })}
						>
							Reject
						</Button>
					</SpaceBetween>
				);
			}
			return (
				<Button
					variant="inline-link"
					loading={loadingIds.has(item.id)}
					onClick={() => setPendingAction({ type: "waitlist", item })}
				>
					Move to Waitlist
				</Button>
			);
		},
		[loadingIds],
	);

	const columnDefinitions = [
		{
			id: "arrival_status",
			header: "Past arrival time?",
			cell: ArrivalStatusCell,
		},
		{ id: "arrival_time", header: "Arrival Time", cell: ArrivalTimeCell },
		{
			id: "requested_time",
			header: "Requested Time",
			cell: RequestedTimeCell,
		},
		{ id: "id", header: "ID", cell: IdCell },
		{ id: "name", header: "Name", cell: NameCell },
		{ id: "status", header: "Status", cell: StatusCell },
		{ id: "decision", header: "Decision", cell: DecisionCell },
		{ id: "action", header: "Action", cell: ActionCell },
	];

	const modalContent: Record<
		ModalAction["type"],
		{ header: string; body: (item: LateArrivalRecord) => React.ReactNode }
	> = {
		waitlist: {
			header: "Move to waitlist?",
			body: (item) => (
				<p>
					Confirm moving <strong>{item.id}</strong> to waitlist and setting
					status to <strong>WAIVER_SIGNED</strong>?
				</p>
			),
		},
		approve: {
			header: "Approve arrival time edit?",
			body: (item) => (
				<p>
					Approve changing <strong>{item.id}</strong>&apos;s arrival time from{" "}
					<strong>{formatTime(item.arrival_time)}</strong> to{" "}
					<strong>{formatTime(item.late_arrival_edit_request!)}</strong>?
				</p>
			),
		},
		reject: {
			header: "Reject arrival time edit?",
			body: (item) => (
				<p>
					Reject the edit request for <strong>{item.id}</strong>? Their arrival
					time will remain <strong>{formatTime(item.arrival_time)}</strong>.
				</p>
			),
		},
	};

	return (
		<>
			<Modal
				visible={pendingAction !== null}
				onDismiss={() => setPendingAction(null)}
				header={
					pendingAction ? modalContent[pendingAction.type].header : ""
				}
				footer={
					<Box float="right">
						<SpaceBetween direction="horizontal" size="xs">
							<Button variant="link" onClick={() => setPendingAction(null)}>
								Cancel
							</Button>
							<Button
								variant="primary"
								loading={
									pendingAction !== null &&
									loadingIds.has(pendingAction.item.id)
								}
								onClick={() => {
									if (!pendingAction) return;
									const action = pendingAction;
									setPendingAction(null);
									handleAction(action);
								}}
							>
								Confirm
							</Button>
						</SpaceBetween>
					</Box>
				}
			>
				<TextContent>
					{pendingAction &&
						modalContent[pendingAction.type].body(pendingAction.item)}
				</TextContent>
			</Modal>

			<Container
				header={
					<Header
						variant="h2"
						description="Confirmed hackers with a late arrival time or a pending edit request"
					>
						Late Arrivals
					</Header>
				}
			>
				{error ? (
					<Box color="text-status-error">Failed to load late arrivals.</Box>
				) : (
					<Table<LateArrivalRecord>
						loading={loading}
						loadingText="Loading late arrivals…"
						items={lateArrivals}
						columnDefinitions={columnDefinitions}
						empty={
							<Box textAlign="center" color="inherit">
								<Box variant="strong">No late arrivals</Box>
								<Box color="inherit">
									No confirmed hackers have a non-default arrival time.
								</Box>
							</Box>
						}
					/>
				)}
			</Container>
		</>
	);
}

export default LateArrivalsTable;
