"use client";

import { useEffect, useRef } from "react";
import axios from "axios";

import { DraftFieldValue } from "@/lib/components/forms/shared/DraftContext";

// Prevent excessive API calls by debouncing the autosave
const DEBOUNCE_MS = 800;

type ApplicationType = "Hacker" | "Mentor" | "Volunteer";

export default function useDraftAutosave(
	applicationType: ApplicationType,
	fields: Record<string, DraftFieldValue>,
	hasUserEdited: boolean,
	onSessionExpired: () => void,
) {
	const onSessionExpiredRef = useRef(onSessionExpired);

	useEffect(() => {
		onSessionExpiredRef.current = onSessionExpired;
	}, [onSessionExpired]);

	useEffect(() => {
		if (!hasUserEdited) {
			return;
		}

		const timeoutId = setTimeout(() => {
			axios
				.post("/api/user/application/draft", {
					application_type: applicationType,
					fields,
				})
				.catch((err) => {
					if (axios.isAxiosError(err) && err.response?.status === 401) {
						onSessionExpiredRef.current();
					}
				});
		}, DEBOUNCE_MS);

		return () => clearTimeout(timeoutId);
	}, [applicationType, fields, hasUserEdited]);
}
