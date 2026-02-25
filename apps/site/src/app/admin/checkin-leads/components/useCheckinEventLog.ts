import { useEffect, useState } from "react";

export interface CheckinEvent {
	time: number;
	text: string;
}

export function useCheckinEventLog() {
	const [events, setEvents] = useState<CheckinEvent[]>([]);

	const load = async () => {
		const res = await fetch("/api/checkin-leads/checkin-log");
		const data = await res.json();
		setEvents(Array.isArray(data) ? data : []);
	};

	useEffect(() => {
		load();
		const interval = setInterval(load, 4000);
		return () => clearInterval(interval);
	}, []);

	const log = async (text: string) => {
		await fetch("/api/checkin-leads/checkin-log", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Hackathon-Name": process.env.NEXT_PUBLIC_HACKATHON_NAME!,
			},
			body: JSON.stringify({ text }),
		});

		await load();
	};

	return { events, log };
}
