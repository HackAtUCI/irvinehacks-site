import { AxiosResponse } from "axios";

import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";

interface ConfirmationModalProps {
	onConfirm: () => Promise<void | AxiosResponse>;
	visible: boolean;
	setVisible: (newVisible: boolean) => void;
}

function ConfirmationModal({
	onConfirm,
	visible,
	setVisible,
}: ConfirmationModalProps) {
	return (
		<Modal
			onDismiss={() => setVisible(false)}
			visible={visible}
			footer={
				<Box float="right">
					<SpaceBetween direction="horizontal" size="xs">
						<Button variant="link" onClick={() => setVisible(false)}>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={() => {
								setVisible(false);
								onConfirm();
							}}
						>
							Send Emails
						</Button>
					</SpaceBetween>
				</Box>
			}
			header="Send Reminder Emails"
		>
			<TextContent>
				<p>You are about to send out emails</p>
			</TextContent>
		</Modal>
	);
}

export default ConfirmationModal;
