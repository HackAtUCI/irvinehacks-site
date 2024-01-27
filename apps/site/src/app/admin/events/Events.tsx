"use client";

import { useState } from "react";

import ContentLayout from "@cloudscape-design/components/content-layout";
import Select, { SelectProps } from "@cloudscape-design/components/select";

import useEvents from "@/lib/admin/useEvents";

function Events() {
	const [event, setEvent] = useState<SelectProps.Option | null>(null);

	const { events, loading } = useEvents();

	const options = events.map(({ name, id }) => ({ label: name, value: id }));

	return (
		<ContentLayout>
			<Select
				selectedOption={event}
				onChange={({ detail }) => setEvent(detail.selectedOption)}
				options={options}
				statusType={loading ? "loading" : undefined}
			/>
			{/* TODO: use badge scanner and POST request to events endpoint */}
		</ContentLayout>
	);
}

export default Events;
