import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const SESSION_DURATION = 60 * 60 * 1000; // Based on JWT token expiration (1 hour)
const WARNING_TIME = 2 * 60 * 1000; // Warn 2 minutes before expiration
const STORAGE_KEY = "irvinehacks_session_start"; // For localStorage

interface UseSessionTimeoutOptions {
	onWarning: () => void;
	onExpired: () => void;
}

export function useSessionTimeout({
	onWarning,
	onExpired,
}: UseSessionTimeoutOptions) {
	const router = useRouter();
	const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const expirationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const clearTimers = useCallback(() => {
		if (warningTimerRef.current) {
			clearTimeout(warningTimerRef.current);
		}
		if (expirationTimerRef.current) {
			clearTimeout(expirationTimerRef.current);
		}
	}, []);

	const logout = useCallback(() => {
		clearTimers();
		localStorage.removeItem(STORAGE_KEY);
		router.push("/logout");
	}, [clearTimers, router]);

	const scheduleTimers = useCallback(
		(remainingTime: number) => {
			clearTimers();
			if (remainingTime <= WARNING_TIME) {
				onWarning();
				expirationTimerRef.current = setTimeout(() => {
					onExpired();
					logout();
				}, remainingTime);
				return;
			}
			warningTimerRef.current = setTimeout(() => {
				onWarning();
				expirationTimerRef.current = setTimeout(() => {
					onExpired();
					logout();
				}, WARNING_TIME);
			}, remainingTime - WARNING_TIME);
		},
		[clearTimers, logout, onExpired, onWarning],
	);

	const extendSession = useCallback(async () => {
		try {
			await axios.post("/api/user/refresh");
			localStorage.setItem(STORAGE_KEY, Date.now().toString());
			scheduleTimers(SESSION_DURATION);
		} catch (err) {
			console.error("Failed to extend session:", err);
			logout();
		}
	}, [logout, scheduleTimers]);

	useEffect(() => {
		if (!localStorage.getItem(STORAGE_KEY)) {
			localStorage.setItem(STORAGE_KEY, Date.now().toString());
		}
		const sessionStart = parseInt(
			localStorage.getItem(STORAGE_KEY) ?? Date.now.toString(),
			10,
		);
		const elapsed = Date.now() - sessionStart;
		const remaining = SESSION_DURATION - elapsed;
		if (remaining <= 0) {
			onExpired();
			logout();
			return;
		}
		scheduleTimers(remaining);
		return clearTimers;
	}, [clearTimers, logout, onExpired, scheduleTimers]);

	return { logout, extendSession };
}
