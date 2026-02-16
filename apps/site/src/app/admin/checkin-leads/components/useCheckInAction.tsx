import { useState } from "react";
import axios from "axios";
import { SelectProps } from "@cloudscape-design/components/select";

const optionEndpoints: Record<string, string> = {
	"end-accepted-checkin": "/api/checkin-leads/queue-removal",
	"get-next-batch": "/api/checkin-leads/queue-participants",
	"notify-venue-full": "/api/checkin-leads/close-walkins",
};

export function useCheckInAction() {
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const handleUpdate = async (selectedAction: SelectProps.Option | null) => {
		const actionValue = selectedAction?.value;
		if (!actionValue) return;

		const endpoint = optionEndpoints[actionValue as string];

		setIsLoading(true);
		setMessage(null);

		try {
			const method = endpoint.includes("close-walkins") ? "get" : "post";

			await axios[method](endpoint);

			setMessage({
				type: "success",
				text: `Successfully executed: ${selectedAction.label}`,
			});
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const errorDetail = err.response?.data?.detail;

				if (errorDetail === "QUEUE_EMPTY") {
					setMessage({
						type: "error",
						text: "There are no participants waiting in the queue.",
					});
				} else if (errorDetail === "VENUE_FULL") {
					setMessage({
						type: "error",
						text: "Cannot queue more participants: Venue is at maximum capacity.",
					});
				} else {
					setMessage({
						type: "error",
						text: errorDetail || err.message || "An unexpected error occurred.",
					});
				}
			} else {
				setMessage({
					type: "error",
					text:
						err instanceof Error ? err.message : "An unknown error occurred.",
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	return { handleUpdate, isLoading, message, setMessage };
}
