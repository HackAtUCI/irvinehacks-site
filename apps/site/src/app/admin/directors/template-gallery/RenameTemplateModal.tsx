"use client";

import { useState, useEffect } from "react";
import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import SpaceBetween from "@cloudscape-design/components/space-between";

interface RenameTemplateModalProps {
	templateName: string | null;
	onDismiss: () => void;
	onConfirm: (newName: string) => Promise<void>;
}

export default function RenameTemplateModal({
	templateName,
	onDismiss,
	onConfirm,
}: RenameTemplateModalProps) {
	const [newName, setNewName] = useState("");

	// Pre-fill with current name when modal opens
	useEffect(() => {
		if (templateName) setNewName(templateName);
	}, [templateName]);

	async function handleConfirm() {
		if (!newName || newName === templateName) return;
		await onConfirm(newName);
		onDismiss();
	}

	return (
		<Modal
			visible={templateName !== null}
			onDismiss={onDismiss}
			header="Rename Template"
			footer={
				<Box float="right">
					<SpaceBetween direction="horizontal" size="xs">
						<Button variant="link" onClick={onDismiss}>
							Cancel
						</Button>
						<Button variant="primary" onClick={handleConfirm}>
							Rename
						</Button>
					</SpaceBetween>
				</Box>
			}
		>
			<FormField label="New template name">
				<Input
					value={newName}
					onChange={({ detail }) => setNewName(detail.value)}
					onKeyDown={({ detail }) => {
						if (detail.key === "Enter") handleConfirm();
					}}
				/>
			</FormField>
		</Modal>
	);
}
