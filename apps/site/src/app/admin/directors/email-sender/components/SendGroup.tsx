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

interface SendGroupProps {
	description: string;
	buttonText: string;
	route: string;
	mutate?: KeyedMutator<Sender[]>;
}

function SendGroup({ description, buttonText, route, mutate }: SendGroupProps) {
	const [visible, setVisible] = useState(false);
	const [flashBarItems, setFlashBarItems] = useState<
		ReadonlyArray<FlashbarProps.MessageDefinition>
	>([]);

	const handleClick = async () => {
		await axios
			.post(route)
			.then(() => {
				setFlashBarItems([
					{
						type: "success",
						content: "Successfully sent emails.",
						dismissible: true,
						dismissLabel: "Dismiss message",
						onDismiss: () => setFlashBarItems([]),
					},
				]);
				mutate?.();
			})
			.catch(() => {
				console.error("Unable to send out emails");
				setFlashBarItems([
					{
						type: "error",
						content: "Emails failed to send.",
						dismissible: true,
						dismissLabel: "Dismiss message",
						onDismiss: () => setFlashBarItems([]),
					},
				]);
			});
	};

	return (
		<SpaceBetween size="m">
			<SpaceBetween size="m" direction="horizontal">
				<TextContent>{description}</TextContent>
				<Button variant="primary" onClick={() => setVisible(true)}>
					{buttonText}
				</Button>
				<ConfirmationModal
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
