import { useState } from "react";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";
import ConfirmationModal from "./ConfirmationModal";

function ApplyReminder() {
	const [visible, setVisible] = useState(false);

	return (
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
				onConfirm={() => null}
			/>
		</SpaceBetween>
	);
}

export default ApplyReminder;
