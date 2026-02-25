import { useEffect, useState } from "react";

export function useQueuePullTimer() {
	const [lastPull, setLastPull] = useState<number | null>(null);
	const [now, setNow] = useState(Date.now());

	const load = async () => {
		const res = await fetch("/api/checkin-leads/queue-timer");
		const data = await res.json();
		setLastPull(data.last_pull ?? null);
	};

	useEffect(() => {
		load();
		const sync = setInterval(load, 5000); // sync with server
		return () => clearInterval(sync);
	}, []);

	// ticking clock (local only)
	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(interval);
	}, []);

	const markPulled = async () => {
		const res = await fetch("/api/checkin-leads/queue-timer", {
			method: "POST",
		});

		const data = await res.json();
		setLastPull(data.last_pull);
	};

	return {
		lastPull,
		elapsedMs: lastPull ? now - lastPull : null,
		markPulled,
	};
}
