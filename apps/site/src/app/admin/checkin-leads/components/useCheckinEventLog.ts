import { useEffect, useState } from "react";

const KEY = "checkin_event_log";
const EVENT = "checkin_log_updated";

export interface CheckinEvent {
	time: number;
	text: string;
}

export function useCheckinEventLog() {
	const [events, setEvents] = useState<CheckinEvent[]>([]);

	const load = () => {
		const stored = localStorage.getItem(KEY);
		setEvents(stored ? JSON.parse(stored) : []);
	};

	useEffect(() => {
		load();
	}, []);

	useEffect(() => {
		const handler = () => load();
		window.addEventListener(EVENT, handler);
		window.addEventListener("storage", handler);
		return () => {
			window.removeEventListener(EVENT, handler);
			window.removeEventListener("storage", handler);
		};
	}, []);

	const log = (text: string) => {
		const newEvent = { time: Date.now(), text };

		const stored = localStorage.getItem(KEY);
		const existing: CheckinEvent[] = stored ? JSON.parse(stored) : [];

		const updated = [newEvent, ...existing].slice(0, 50);
		localStorage.setItem(KEY, JSON.stringify(updated));

		setEvents(updated);

		// notify listeners
		window.dispatchEvent(new Event(EVENT));
	};

	return { events, log };
}
