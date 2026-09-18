"use client";

import { useState, useEffect } from "react";
import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Checkbox from "@cloudscape-design/components/checkbox";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";

import { Organizer } from "@/lib/admin/useOrganizers";
import { EDITABLE_COMMITTEES, EDITABLE_ROLES } from "@/lib/admin/EditableRoles";

export interface OrganizerUpdate {
	first_name: string;
	last_name: string;
	roles: string[];
	committees: string[];
}

export interface EditOrganizerModalProps {
	organizer: Organizer | null;
	onDismissAction: () => void;
	onConfirmAction: (organizer: OrganizerUpdate) => Promise<void>;
}

export default function EditOrganizerModal({
	organizer,
	onDismissAction,
	onConfirmAction,
}: EditOrganizerModalProps) {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
	const [selectedCommittees, setSelectedCommittees] = useState<Set<string>>(
		new Set(),
	);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (organizer) {
			setFirstName(organizer.first_name);
			setLastName(organizer.last_name);
			setSelectedRoles(new Set(organizer.roles));
			setSelectedCommittees(new Set(organizer.committees));
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

	function toggleCommittee(committee: string) {
		setSelectedCommittees((prev) => {
			const next = new Set(prev);
			if (next.has(committee)) {
				next.delete(committee);
			} else {
				next.add(committee);
			}
			return next;
		});
	}

	async function handleConfirm() {
		setLoading(true);
		try {
			await onConfirmAction({
				first_name: firstName,
				last_name: lastName,
				roles: Array.from(selectedRoles),
				committees: Array.from(selectedCommittees),
			});
		} finally {
			setLoading(false);
		}
	}

	return (
		<Modal
			visible={organizer !== null}
			onDismiss={onDismissAction}
			header={`Edit organizer ${organizer?.first_name} ${organizer?.last_name}`}
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
			<SpaceBetween direction="vertical" size="m">
				<ColumnLayout columns={2}>
					<FormField label="First name">
						<Input
							value={firstName}
							onChange={({ detail }) => setFirstName(detail.value)}
						/>
					</FormField>
					<FormField label="Last name">
						<Input
							value={lastName}
							onChange={({ detail }) => setLastName(detail.value)}
						/>
					</FormField>
				</ColumnLayout>
				<FormField label="Roles">
					<ColumnLayout columns={2}>
						{EDITABLE_ROLES.map((role) => (
							<Checkbox
								key={role}
								checked={selectedRoles.has(role)}
								onChange={() => toggleRole(role)}
							>
								{role}
							</Checkbox>
						))}
					</ColumnLayout>
				</FormField>
				<FormField label="Committees">
					<ColumnLayout columns={2}>
						{EDITABLE_COMMITTEES.map((committee) => (
							<Checkbox
								key={committee}
								checked={selectedCommittees.has(committee)}
								onChange={() => toggleCommittee(committee)}
							>
								{committee}
							</Checkbox>
						))}
					</ColumnLayout>
				</FormField>
			</SpaceBetween>
		</Modal>
	);
}
