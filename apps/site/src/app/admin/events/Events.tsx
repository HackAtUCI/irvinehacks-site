"use client";

import { useState } from "react";

import ContentLayout from "@cloudscape-design/components/content-layout";
import Select, { SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";

import useEvents from "@/lib/admin/useEvents";
import useParticipants from "@/lib/admin/useParticipants";

import SubeventCheckin from "./components/SubeventCheckin";

function Events() {
	const [event, setEvent] = useState<SelectProps.Option | null>(null);

	const { events, loading: loadingEvents, checkInParticipantSubevent } =
		useEvents();
	const { participants } = useParticipants();

	const options = events.map(({ name, _id }) => ({ label: name, value: _id }));
	const eventId = event?.value ?? null;

	const handleConfirmCheckin = async (participant: { _id: string }) => {
		if (!eventId) return false;
		return checkInParticipantSubevent(eventId, participant._id);
	};

	return (
		<ContentLayout>
			<SpaceBetween size="m">
				<Select
					selectedOption={event}
					onChange={({ detail }) => setEvent(detail.selectedOption)}
					options={options}
					statusType={loadingEvents ? "loading" : undefined}
					placeholder="Choose an event (e.g. workshop)"
				/>
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
