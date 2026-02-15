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
		} catch (error) {
			setMessage({
				type: "error",
				text:
					error instanceof Error
						? error.message
						: "Unable to update, an error occurred.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return { handleUpdate, isLoading, message, setMessage };
}
