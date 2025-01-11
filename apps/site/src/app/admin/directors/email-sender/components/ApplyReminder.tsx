import axios from "axios";

import { useState } from "react";

import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";
import ConfirmationModal from "./ConfirmationModal";
import { Flashbar, FlashbarProps } from "@cloudscape-design/components";

function ApplyReminder() {
	const [visible, setVisible] = useState(false);
	const [flashBarItems, setFlashBarItems] = useState<
		ReadonlyArray<FlashbarProps.MessageDefinition>
	>([]);

	return (
		<SpaceBetween size="m">
			<SpaceBetween size="m" direction="horizontal">
				<TextContent>
					Send out email reminders to users who haven&apos;t submitted an app
				</TextContent>
				<Button variant="primary" onClick={() => setVisible(true)}>
					Send Emails
				</Button>
				<ConfirmationModal
					visible={visible}
					setVisible={setVisible}
					onConfirm={async () =>
						await axios
							.post("/api/director/apply-reminder")
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
							})
							.catch(() => {
								console.error("Unable to send out apply reminder emails");
								setFlashBarItems([
									{
										type: "error",
										content: "Emails failed to send.",
										dismissible: true,
										dismissLabel: "Dismiss message",
										onDismiss: () => setFlashBarItems([]),
									},
								]);
							})
					}
				/>
			</SpaceBetween>
			<Flashbar items={flashBarItems} />
		</SpaceBetween>
	);
}

export default ApplyReminder;
