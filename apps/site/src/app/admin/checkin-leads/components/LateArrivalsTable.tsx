"use client";

import { useCallback, useContext, useState } from "react";
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

/** Returns true if the current wall-clock time (HH:MM) is >= the row's arrival_time. */
function isPastArrivalTime(arrivalTime: string): boolean {
	const now = new Date();
	const currentHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(
		now.getMinutes(),
	).padStart(2, "0")}`;
	return currentHHMM >= arrivalTime;
}

const IdCell = (item: LateArrivalRecord) => item.id;

const NameCell = (item: LateArrivalRecord) =>
	`${item.first_name} ${item.last_name}`;

const ArrivalTimeCell = (item: LateArrivalRecord) => {
	const [hours, minutes] = item.arrival_time.split(":");
	const date = new Date();
	date.setHours(Number(hours), Number(minutes));

	return date.toLocaleString("en-US", {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	});
};

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
	const [movingIds, setMovingIds] = useState<Set<string>>(new Set());
	const [pendingItem, setPendingItem] = useState<LateArrivalRecord | null>(
		null,
	);

	const handleMoveToWaitlist = async (id: string) => {
		setMovingIds((prev) => new Set(prev).add(id));
		try {
			await axios.post(`/api/checkin-leads/move-to-waitlist/${id}`);
			await mutate();
			if (setNotifications) {
				const msgId = `waitlist-success-${id}-${Date.now()}`;
				const successMsg: FlashbarProps.MessageDefinition = {
					type: "success",
					content: `Successfully moved ${id} to waitlist (status: WAIVER_SIGNED).`,
					id: msgId,
					dismissible: true,
					onDismiss: () =>
						setNotifications((prev) => prev.filter((m) => m.id !== msgId)),
				};
				setNotifications((prev) => [successMsg, ...prev]);
			}
		} catch (err) {
			if (setNotifications) {
				const msgId = `waitlist-error-${id}-${Date.now()}`;
				const detail = axios.isAxiosError(err)
					? err.response?.data?.detail ?? err.message
					: String(err);
				const errorMsg: FlashbarProps.MessageDefinition = {
					type: "error",
					content: `Failed to move ${id} to waitlist: ${detail}`,
					id: msgId,
					dismissible: true,
					onDismiss: () =>
						setNotifications((prev) => prev.filter((m) => m.id !== msgId)),
				};
				setNotifications((prev) => [errorMsg, ...prev]);
			}
		} finally {
			setMovingIds((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		}
	};

	const ActionCell = useCallback(
		(item: LateArrivalRecord) => (
			<Button
				variant="inline-link"
				loading={movingIds.has(item.id)}
				onClick={() => setPendingItem(item)}
			>
				Move to Waitlist
			</Button>
		),
		[movingIds],
	);

	const columnDefinitions = [
		{
			id: "arrival_status",
			header: "Past arrival time?",
			cell: ArrivalStatusCell,
		},
		{ id: "arrival_time", header: "Arrival Time", cell: ArrivalTimeCell },
		{ id: "id", header: "ID", cell: IdCell },
		{ id: "name", header: "Name", cell: NameCell },
		{ id: "status", header: "Status", cell: StatusCell },
		{ id: "decision", header: "Decision", cell: DecisionCell },
		{ id: "action", header: "Action", cell: ActionCell },
	];

	return (
		<>
			<Modal
				visible={pendingItem !== null}
				onDismiss={() => setPendingItem(null)}
				header="Are you sure?"
				footer={
					<Box float="right">
						<SpaceBetween direction="horizontal" size="xs">
							<Button variant="link" onClick={() => setPendingItem(null)}>
								Cancel
							</Button>
							<Button
								variant="primary"
								loading={pendingItem !== null && movingIds.has(pendingItem.id)}
								onClick={() => {
									if (!pendingItem) return;
									const id = pendingItem.id;
									setPendingItem(null);
									handleMoveToWaitlist(id);
								}}
							>
								Confirm
							</Button>
						</SpaceBetween>
					</Box>
				}
			>
				<TextContent>
					<p>
						Confirm moving <strong>{pendingItem?.id}</strong> to waitlist and
						setting status to <strong>WAIVER_SIGNED</strong>?
					</p>
				</TextContent>
			</Modal>

			<Container
				header={
					<Header
						variant="h2"
						description="Confirmed hackers with a non-default (late) arrival time"
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
