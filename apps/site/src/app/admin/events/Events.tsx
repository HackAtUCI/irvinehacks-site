"use client";

import { useState } from "react";

import ContentLayout from "@cloudscape-design/components/content-layout";
import Select, { SelectProps } from "@cloudscape-design/components/select";

import useEvents from "@/lib/admin/useEvents";
import useParticipants, { Participant } from "@/lib/admin/useParticipants";

import SubeventCheckin from "./components/SubeventCheckin";

function Events() {
	const [event, setEvent] = useState<SelectProps.Option | null>(null);

	const {
		events,
		loading: loadingEvents,
		checkInParticipantSubevent,
	} = useEvents();
	const { participants, loading: loadingParticipants } = useParticipants();

	const options = events.map(({ name, _id }) => ({ label: name, value: _id }));

	const onConfirm = async (participant: Participant): Promise<boolean> => {
		if (event !== null && event.value !== undefined) {
			return await checkInParticipantSubevent(event.value, participant._id);
		}
		return false;
	};

	return (
		<ContentLayout>
			<Select
				selectedOption={event}
				onChange={({ detail }) => setEvent(detail.selectedOption)}
				options={options}
				statusType={loadingEvents ? "loading" : undefined}
			/>
			{event && !loadingParticipants && (
				<SubeventCheckin participants={participants} onConfirm={onConfirm} />
			)}
		</ContentLayout>
	);
}

export default Events;
