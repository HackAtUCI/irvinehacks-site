	import { useCallback, useState, useEffect } from "react";

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
	// use a key to force remount of scanner when modal reopens
	const [scannerKey, setScannerKey] = useState(0);

	// reset scanner key when modal opens to ensure fresh scanner instance
	useEffect(() => {
		if (show) {
			setScannerKey((prev) => prev + 1);
		}
	}, [show]);

	const onScanSuccess = useCallback(
		(decodedText: string) => {
			onConfirm(decodedText);
			// onConfirm in parent component (ParticipantsTable) will close the modal
		},
		[onConfirm],
	);

	const handleDismiss = useCallback(() => {
		onDismiss();
	}, [onDismiss]);

	return (
		<Modal
			onDismiss={handleDismiss}
			visible={show}
			footer={
				<Box float="right">
					<Button variant="link" onClick={handleDismiss}>
						Cancel
					</Button>
				</Box>
			}
			header="Scan badge"
		>
			{show && (
				<BadgeScanner
					key={scannerKey}
					onSuccess={onScanSuccess}
					onError={() => null}
				/>
			)}
		</Modal>
	);
}

export default SearchScannerModal;
