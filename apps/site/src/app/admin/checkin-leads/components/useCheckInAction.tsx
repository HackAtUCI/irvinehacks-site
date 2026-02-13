import { useState } from "react";
import axios from "axios";
import { SelectProps } from "@cloudscape-design/components/select";

export function useCheckInAction() {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const handleUpdate = async (selectedAction: SelectProps.Option | null) => {
		if (!selectedAction) return;

		setLoading(true);
		setMessage(null);

		try {
			let endpoint = "";
			const actionValue = selectedAction.value as string;

			if (actionValue === "end-accepted-checkin") {
				endpoint = "/api/admin/checkin-leads/queue-removal";
			} else if (actionValue === "get-next-batch") {
				endpoint = "/api/admin/checkin-leads/queue-participants";
			} else if (actionValue === "notify-venue-full") {
				endpoint = "/api/admin/checkin-leads/close-walkins";
			}

			if (endpoint) {
				const method = endpoint.includes("close-walkins") ? "get" : "post";
				await axios[method](endpoint);
				setMessage({
					type: "success",
					text: `Successfully executed: ${selectedAction.label}`,
				});
			}
		} catch (error) {
			setMessage({
				type: "error",
				text: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setLoading(false);
		}
	};

	return { handleUpdate, loading, message, setMessage };
}
