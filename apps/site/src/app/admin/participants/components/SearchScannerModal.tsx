import { useCallback } from "react";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Modal from "@cloudscape-design/components/modal";

import BadgeScanner from "@/lib/admin/BadgeScanner";

export interface SearchScannerProps {
	onDismiss: () => void;
	onConfirm: (value: string) => void;
	show: boolean;
}

function SearchScannerModal({
	onDismiss,
	onConfirm,
	show,
}: SearchScannerProps) {
	const onScanSuccess = useCallback(
		(decodedText: string) => {
			onConfirm(decodedText);
		},
		[onConfirm],
	);

	return (
		<Modal
			onDismiss={onDismiss}
			visible={show}
			footer={
				<Box float="right">
					<Button variant="link" onClick={onDismiss}>
						Cancel
					</Button>
				</Box>
			}
			header="Scan badge"
		>
			{show && <BadgeScanner onSuccess={onScanSuccess} onError={() => null} />}
		</Modal>
	);
}

export default SearchScannerModal;
