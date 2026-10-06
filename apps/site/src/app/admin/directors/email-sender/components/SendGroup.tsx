import axios from "axios";

import { useState } from "react";

import { KeyedMutator } from "swr";

import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";
import Flashbar, {
	FlashbarProps,
} from "@cloudscape-design/components/flashbar";

import ConfirmationModal from "./ConfirmationModal";
import { Sender } from "@/lib/admin/useEmailSenders";

interface SendResponse {
	processed?: number;
	remaining?: number;
	complete?: boolean;
}

interface SendGroupProps {
	description: string;
	buttonText: string;
	modalText: string;
	route: string;
	mutate?: KeyedMutator<Sender[]>;
}

function SendGroup({
	description,
	buttonText,
	modalText,
	route,
	mutate,
}: SendGroupProps) {
	const [visible, setVisible] = useState(false);
	const [flashBarItems, setFlashBarItems] = useState<
		ReadonlyArray<FlashbarProps.MessageDefinition>
	>([]);

	const handleClick = async () => {
		try {
			let totalProcessed = 0;
			let lastRemaining = 0;

			for (let i = 0; i < 100; i += 1) {
				const { data } = await axios.post<SendResponse | null>(route);
				if (!data || typeof data.processed !== "number") {
					break;
				}

				totalProcessed += data.processed;
				lastRemaining = data.remaining ?? 0;

				if (data.complete) {
					break;
				}

				if (data.processed === 0) {
					throw new Error("Email batch made no progress");
				}
			}

			const content =
				totalProcessed > 0
					? `Success! Processed ${totalProcessed} email(s).`
					: "Success!";
			setFlashBarItems([
				{
					type: "success",
					content:
						lastRemaining > 0
							? `${content} ${lastRemaining} remaining.`
							: content,
					dismissible: true,
					dismissLabel: "Dismiss message",
					onDismiss: () => setFlashBarItems([]),
				},
			]);
			mutate?.();
		} catch {
			console.error("Unable to send out emails");
			setFlashBarItems([
				{
					type: "error",
					content: "Failed!",
					dismissible: true,
					dismissLabel: "Dismiss message",
					onDismiss: () => setFlashBarItems([]),
				},
			]);
		}
	};

	return (
		<SpaceBetween size="m">
			<SpaceBetween size="m" direction="horizontal">
				<TextContent>{description}</TextContent>
				<Button variant="primary" onClick={() => setVisible(true)}>
					{buttonText}
				</Button>
				<ConfirmationModal
					buttonText={buttonText}
					modalText={modalText}
					visible={visible}
					setVisible={setVisible}
					onConfirm={handleClick}
				/>
			</SpaceBetween>
			<Flashbar items={flashBarItems} />
		</SpaceBetween>
	);
}

export default SendGroup;
