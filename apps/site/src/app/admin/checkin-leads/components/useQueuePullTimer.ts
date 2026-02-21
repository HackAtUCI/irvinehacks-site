import { useEffect, useState } from "react";

const STORAGE_KEY = "checkin_last_batch_pull";
const EVENT = "checkin_timer_updated";

export function useQueuePullTimer() {
	const [lastPull, setLastPull] = useState<number | null>(null);
	const [now, setNow] = useState(Date.now());

	const load = () => {
		const stored = localStorage.getItem(STORAGE_KEY);
		setLastPull(stored ? Number(stored) : null);
	};

	// initial load
	useEffect(() => {
		load();
	}, []);

	// ticking clock
	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(interval);
	}, []);

	// listen for updates from other components
	useEffect(() => {
		const handler = () => load();
		window.addEventListener(EVENT, handler);
		window.addEventListener("storage", handler);
		return () => {
			window.removeEventListener(EVENT, handler);
			window.removeEventListener("storage", handler);
		};
	}, []);

	const markPulled = () => {
		const time = Date.now();
		localStorage.setItem(STORAGE_KEY, String(time));
		setLastPull(time);

		// notify every component using this hook
		window.dispatchEvent(new Event(EVENT));
	};

	return {
		lastPull,
		elapsedMs: lastPull ? now - lastPull : null,
		markPulled,
	};
}
