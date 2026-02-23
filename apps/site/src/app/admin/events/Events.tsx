"use client";

import { useCallback, useState } from "react";

import ButtonDropdown, {
	ButtonDropdownProps,
} from "@cloudscape-design/components/button-dropdown";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Select, { SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";

import useEvents, { type Event } from "@/lib/admin/useEvents";
import useParticipants from "@/lib/admin/useParticipants";
import type { Participant } from "@/lib/admin/useParticipants";

import SubeventCheckin from "./components/SubeventCheckin";

function getCheckinsSorted(
	checkins: Event["checkins"],
): Array<{ uid: string; date: string }> {
	if (!checkins) return [];
	const entries: Array<{ uid: string; date: string }> = [];
	if (Array.isArray(checkins)) {
		for (const item of checkins) {
			if (Array.isArray(item) && item.length >= 2) {
				entries.push({ uid: String(item[0]), date: String(item[1]) });
			}
		}
	} else if (typeof checkins === "object") {
		for (const [uid, date] of Object.entries(checkins)) {
			entries.push({ uid, date: String(date) });
		}
	}
	entries.sort((a, b) => a.date.localeCompare(b.date));
	return entries;
}

function buildExportText(
	events: Event[],
	participants: Participant[],
	format: "numbered" | "names",
): string {
	const uidToName = new Map(
		participants.map((p) => [p._id, `${p.first_name} ${p.last_name}`]),
	);
	const allEntries: Array<{ uid: string; date: string }> = [];
	for (const ev of events) {
		allEntries.push(...getCheckinsSorted(ev.checkins));
	}
	if (allEntries.length === 0) return "";

	allEntries.sort((a, b) => a.date.localeCompare(b.date));

	const lines: string[] = [];
	if (format === "numbered") {
		allEntries.forEach(({ uid }, i) => {
			const name = uidToName.get(uid) ?? uid;
			lines.push(`${i + 1} ${name}`);
		});
	} else {
		allEntries.forEach(({ uid }) => {
			const name = uidToName.get(uid) ?? uid;
			lines.push(name);
		});
	}

	return lines.join("\n");
}

function buildExportJson(
	events: Event[],
	participants: Participant[],
): Record<string, { name: string; uid: string; workshop: string; timestamp: string }> {
	const uidToName = new Map(
		participants.map((p) => [p._id, `${p.first_name} ${p.last_name}`]),
	);
	const allEntries: Array<{ uid: string; date: string; workshop: string }> = [];
	for (const ev of events) {
		const entries = getCheckinsSorted(ev.checkins);
		allEntries.push(
			...entries.map(({ uid, date }) => ({
				uid,
				date,
				workshop: ev.name,
			})),
		);
	}
	
	allEntries.sort((a, b) => a.date.localeCompare(b.date));

	const result: Record<
		string,
		{ name: string; uid: string; workshop: string; timestamp: string }
	> = {};
	allEntries.forEach(({ uid, workshop, date }, i) => {
		const name = uidToName.get(uid) ?? uid;
		result[String(i + 1)] = { name, uid, workshop, timestamp: date };
	});

	return result;
}

function downloadFile(content: string, filename: string, mimeType: string) {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

function Events() {
	const [event, setEvent] = useState<SelectProps.Option | null>(null);

	const {
		events,
		loading: loadingEvents,
		checkInParticipantSubevent,
	} = useEvents();
	const { participants } = useParticipants();

	const options = events.map(({ name, _id }) => ({ label: name, value: _id }));
	const eventId = event?.value ?? null;

	const handleConfirmCheckin = async (participant: { _id: string }) => {
		if (!eventId) return false;
		return checkInParticipantSubevent(eventId, participant._id);
	};

	const handleExport = useCallback(
		(event: CustomEvent<ButtonDropdownProps.ItemClickDetails>) => {
			const format = event.detail.id as "numbered" | "names" | "json";
			const parts = participants ?? [];

			if (format === "json") {
				const content = JSON.stringify(buildExportJson(events, parts), null, 2);
				downloadFile(content, "event-checkins.json", "application/json");
			} else {
				const content = buildExportText(events, parts, format);
				const filename =
					format === "numbered"
						? "event-checkins-numbered.txt"
						: "event-checkins-names.txt";
				downloadFile(content, filename, "text/plain");
			}
		},
		[events, participants],
	);

	const exportItems: ButtonDropdownProps.Item[] = [
		{
			id: "numbered",
			text: "Export as numbered list (#, name)",
			description: "1 -> test hacker, edu.uci.tseterh",
		},
		{
			id: "json",
			text: "Export as JSON (integer → name, uid, workshop, timestamp)",
			description: '{"1": {"name": "test hacker", "uid": "edu.uci.tstats", "workshop": "Intro to React", "timestamp": "2026-02-23T12:00:00Z"}}',
		},
		{
			id: "names",
			text: "Export as names only",
			description: "One name per line",
		},
	];

	return (
		<ContentLayout>
			<SpaceBetween size="m">
				<SpaceBetween direction="horizontal" size="xs">
					<Select
						selectedOption={event}
						onChange={({ detail }) => setEvent(detail.selectedOption)}
						options={options}
						statusType={loadingEvents ? "loading" : undefined}
						placeholder="Choose an event (e.g. workshop)"
					/>
					<ButtonDropdown
						items={exportItems}
						onItemClick={handleExport}
						variant="normal"
					>
						Export check-ins
					</ButtonDropdown>
				</SpaceBetween>
				{eventId && (
					<SubeventCheckin
						participants={participants ?? []}
						onConfirm={handleConfirmCheckin}
					/>
				)}
			</SpaceBetween>
		</ContentLayout>
	);
}

export default Events;
