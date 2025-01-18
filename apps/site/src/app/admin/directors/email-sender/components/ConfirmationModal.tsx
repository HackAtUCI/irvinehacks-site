import { AxiosResponse } from "axios";

import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";

interface ConfirmationModalProps {
	buttonText: string;
	modalText: string;
	onConfirm: () => Promise<void | AxiosResponse>;
	visible: boolean;
	setVisible: (newVisible: boolean) => void;
}

function ConfirmationModal({
	buttonText,
	modalText,
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
							{buttonText}
						</Button>
					</SpaceBetween>
				</Box>
			}
			header="Send Emails"
		>
			<TextContent>
				<p>{modalText}</p>
			</TextContent>
		</Modal>
	);
}

export default ConfirmationModal;
