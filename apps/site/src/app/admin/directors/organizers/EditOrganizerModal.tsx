"use client";

import { useState, useEffect } from "react";
import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Checkbox from "@cloudscape-design/components/checkbox";

import { Organizer } from "@/lib/admin/useOrganizers";
import { EDITABLE_ROLES } from "@/lib/admin/EditableRoles";

export interface EditOrganizerModalProps {
	organizer: Organizer | null;
	onDismissAction: () => void;
	onConfirmAction: (roles: string[]) => Promise<void>;
}

export default function EditOrganizerModal({
	organizer,
	onDismissAction,
	onConfirmAction,
}: EditOrganizerModalProps) {
	const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		if (organizer) {
			setSelectedRoles(new Set(organizer.roles));
		}
	}, [organizer]);

	function toggleRole(role: string) {
		setSelectedRoles((prev) => {
			const next = new Set(prev);
			if (next.has(role)) {
				next.delete(role);
			} else {
				next.add(role);
			}
			return next;
		});
	}

	async function handleConfirm() {
		setLoading(true);
		await onConfirmAction(Array.from(selectedRoles));
		setLoading(false);
	}

	return (
		<Modal
			visible={organizer !== null}
			onDismiss={onDismissAction}
			header={`Edit roles for ${organizer?.first_name} ${organizer?.last_name}`}
			footer={
				<Box float="right">
					<SpaceBetween direction="horizontal" size="xs">
						<Button variant="link" onClick={onDismissAction}>
							Cancel
						</Button>
						<Button variant="primary" onClick={handleConfirm} loading={loading}>
							Save
						</Button>
					</SpaceBetween>
				</Box>
			}
		>
			<SpaceBetween direction="vertical" size="xs">
				{EDITABLE_ROLES.map((role) => (
					<Checkbox
						key={role}
						checked={selectedRoles.has(role)}
						onChange={() => toggleRole(role)}
					>
						{role}
					</Checkbox>
				))}
			</SpaceBetween>
		</Modal>
	);
}
