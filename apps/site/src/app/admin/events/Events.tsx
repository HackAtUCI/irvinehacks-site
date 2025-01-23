"use client";

import { useState } from "react";

import ContentLayout from "@cloudscape-design/components/content-layout";
import Select, { SelectProps } from "@cloudscape-design/components/select";

import useEvents from "@/lib/admin/useEvents";

function Events() {
	const [event, setEvent] = useState<SelectProps.Option | null>(null);

	const { events, loading: loadingEvents } = useEvents();
	const options = events.map(({ name, _id }) => ({ label: name, value: _id }));

	return (
		<ContentLayout>
			<Select
				selectedOption={event}
				onChange={({ detail }) => setEvent(detail.selectedOption)}
				options={options}
				statusType={loadingEvents ? "loading" : undefined}
			/>
		</ContentLayout>
	);
}

export default Events;
