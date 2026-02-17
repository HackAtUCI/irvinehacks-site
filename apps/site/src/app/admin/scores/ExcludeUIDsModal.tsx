"use client";

import { useState, useMemo } from "react";
import {
	Modal,
	Box,
	Button,
	SpaceBetween,
	Input,
	Table,
	Alert,
} from "@cloudscape-design/components";
import axios from "axios";

interface ExcludeUIDsModalProps {
	visible: boolean;
	onDismiss: () => void;
	onSuccess: () => void;
	onError: (error: string) => void;
}

export default function ExcludeUIDsModal({
	visible,
	onDismiss,
	onSuccess,
	onError,
}: ExcludeUIDsModalProps) {
	const [inputValue, setInputValue] = useState("");
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validation = useMemo(() => {
		if (!inputValue.trim()) {
			return { isValid: true, invalidCharIndex: -1, uids: [] };
		}

		// Commas separate UIDs. Spaces around commas are okay.
		const validRegex = /^[a-zA-Z0-9.,_\-\s]+$/;
		const match = validRegex.exec(inputValue);

		if (!match) {
			// Find the first invalid character
			let firstInvalidIndex = -1;
			for (let i = 0; i < inputValue.length; i++) {
				if (!/[a-zA-Z0-9.,_\-\s]/.test(inputValue[i])) {
					firstInvalidIndex = i;
					break;
				}
			}
			return { isValid: false, invalidCharIndex: firstInvalidIndex, uids: [] };
		}

		const uids = inputValue
			.split(",")
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		return { isValid: true, invalidCharIndex: -1, uids };
	}, [inputValue]);

	const { isValid, invalidCharIndex, uids } = validation;

	const handleConfirmSubmit = async () => {
		setIsSubmitting(true);

		await axios
			.post("/api/admin/add-uids-to-exclude-from-normalization", uids)
			.then(() => {
				onSuccess();
				onDismiss();
				// Reset state
				setInputValue("");
				setShowConfirmation(false);
			})
			.catch((error) => {
				onError(
					error.response?.data?.detail || error.message || "Failed to add UIDs",
				);
			})
			.finally(() => {
				setIsSubmitting(false);
			});
	};

	const renderErrorAlert = () => {
		if (isValid || invalidCharIndex === -1) return null;

		const arrow = "─".repeat(invalidCharIndex) + "▲";
		return (
			<Alert type="error" header="invalid format">
				<Box variant="code">
					<pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
						{inputValue}
						{"\n"}
						{arrow}
					</pre>
				</Box>
			</Alert>
		);
	};

	return (
		<>
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				header="Exclude UIDs from Normalization"
				size="medium"
				footer={
					<Box float="right">
						<SpaceBetween direction="horizontal" size="xs">
							<Button variant="link" onClick={onDismiss}>
								Cancel
							</Button>
							<Button
								variant="primary"
								disabled={!inputValue.trim() || !isValid}
								onClick={() => setShowConfirmation(true)}
							>
								Submit
							</Button>
						</SpaceBetween>
					</Box>
				}
			>
				<SpaceBetween size="m">
					<Box variant="p">
						Input all UIDs to exclude with commas between each UID. Ex.
						edu.uci.idai, com.gmail.ian
					</Box>
					<Input
						value={inputValue}
						onChange={({ detail }) => setInputValue(detail.value)}
						placeholder="uid1, uid2, uid3"
					/>
					{renderErrorAlert()}
					<Table
						columnDefinitions={[
							{
								id: "uid",
								header: "UID",
								cell: (item) => item,
							},
						]}
						items={uids}
						variant="embedded"
						empty={
							<Box textAlign="center" color="inherit">
								<b>No UIDs listed</b>
							</Box>
						}
					/>
				</SpaceBetween>
			</Modal>

			<Modal
				visible={showConfirmation}
				onDismiss={() => setShowConfirmation(false)}
				header="Confirm Exclusion"
				footer={
					<Box float="right">
						<SpaceBetween direction="horizontal" size="xs">
							<Button
								variant="link"
								onClick={() => setShowConfirmation(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								onClick={handleConfirmSubmit}
								loading={isSubmitting}
							>
								Confirm
							</Button>
						</SpaceBetween>
					</Box>
				}
			>
				This will replace the existing exclusion list. {uids.length} UID(s) will
				be excluded from score normalization.
			</Modal>
		</>
	);
}
