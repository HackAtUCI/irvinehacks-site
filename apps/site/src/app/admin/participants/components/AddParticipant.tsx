"use client";

import { useState } from "react";

import axios from "axios";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Modal from "@cloudscape-design/components/modal";
import Select, { SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { ParticipantRole } from "@/lib/userRecord";

import AddParticipantModal from "./AddParticipantModal";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleOptions: SelectProps.Options = [
	{ label: "Sponsor", value: ParticipantRole.Sponsor },
	{ label: "Judge", value: ParticipantRole.Judge },
	{ label: "Workshop Lead", value: ParticipantRole.WorkshopLead },
];

export interface RawNonHackerParticipant {
	email: string;
	first_name: string;
	last_name: string;
	role: ParticipantRole;
}

interface AddParticipantProps {
	onAdded: () => Promise<unknown>;
}

function AddParticipant({ onAdded }: AddParticipantProps) {
	const [visible, setVisible] = useState(false);
	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [selectedRole, setSelectedRole] = useState<SelectProps.Option | null>(
		null,
	);
	const [participant, setParticipant] =
		useState<RawNonHackerParticipant | null>(null);
	const [emailError, setEmailError] = useState("");
	const [firstNameError, setFirstNameError] = useState("");
	const [lastNameError, setLastNameError] = useState("");
	const [roleError, setRoleError] = useState("");
	const [submitError, setSubmitError] = useState("");

	function resetForm() {
		setVisible(false);
		setEmail("");
		setFirstName("");
		setLastName("");
		setSelectedRole(null);
		setParticipant(null);
		setEmailError("");
		setFirstNameError("");
		setLastNameError("");
		setRoleError("");
		setSubmitError("");
	}

	function buildParticipant() {
		const trimmedEmail = email.trim();
		const trimmedFirstName = firstName.trim();
		const trimmedLastName = lastName.trim();
		let hasError = false;

		if (!EMAIL_REGEX.test(trimmedEmail)) {
			setEmailError("Enter a valid email");
			hasError = true;
		} else {
			setEmailError("");
		}

		if (!trimmedFirstName) {
			setFirstNameError("Enter a first name");
			hasError = true;
		} else {
			setFirstNameError("");
		}

		if (!trimmedLastName) {
			setLastNameError("Enter a last name");
			hasError = true;
		} else {
			setLastNameError("");
		}

		if (!selectedRole?.value) {
			setRoleError("Select a role");
			hasError = true;
		} else {
			setRoleError("");
		}

		if (hasError || !selectedRole?.value) {
			return;
		}

		setSubmitError("");
		setVisible(false);
		setParticipant({
			email: trimmedEmail,
			first_name: trimmedFirstName,
			last_name: trimmedLastName,
			role: selectedRole.value as ParticipantRole,
		});
	}

	async function submitParticipant(nextParticipant: RawNonHackerParticipant) {
		try {
			await axios.post("/api/admin/non-hacker-participants", nextParticipant);
			await onAdded();
			resetForm();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const detail = error.response?.data?.detail;
				setSubmitError(
					typeof detail === "string" ? detail : "Could not add participant.",
				);
			} else {
				setSubmitError("Could not add participant.");
			}
			setParticipant(null);
			setVisible(true);
		}
	}

	return (
		<>
			<Button onClick={() => setVisible(true)}>Add Participant</Button>
			<Modal
				onDismiss={resetForm}
				visible={visible}
				header="Add Participant"
				footer={
					<Box float="right">
						<SpaceBetween direction="horizontal" size="xs">
							<Button variant="link" onClick={resetForm}>
								Cancel
							</Button>
							<Button variant="primary" onClick={buildParticipant}>
								Review
							</Button>
						</SpaceBetween>
					</Box>
				}
			>
				<SpaceBetween direction="vertical" size="l">
					<ColumnLayout columns={2}>
						<FormField label="Email" errorText={emailError}>
							<Input
								onChange={({ detail }) => setEmail(detail.value)}
								value={email}
								inputMode="email"
								placeholder="name@example.com"
							/>
						</FormField>
						<FormField label="Role" errorText={roleError}>
							<Select
								selectedOption={selectedRole}
								onChange={({ detail }) =>
									setSelectedRole(detail.selectedOption)
								}
								options={roleOptions}
								placeholder="Select role"
							/>
						</FormField>
						<FormField label="First name" errorText={firstNameError}>
							<Input
								onChange={({ detail }) => setFirstName(detail.value)}
								value={firstName}
								inputMode="text"
								placeholder="First name"
							/>
						</FormField>
						<FormField label="Last name" errorText={lastNameError}>
							<Input
								onChange={({ detail }) => setLastName(detail.value)}
								value={lastName}
								inputMode="text"
								placeholder="Last name"
							/>
						</FormField>
					</ColumnLayout>
					{submitError && <Box color="text-status-error">{submitError}</Box>}
				</SpaceBetween>
			</Modal>
			<AddParticipantModal
				onDismiss={() => setParticipant(null)}
				onConfirm={submitParticipant}
				participant={participant}
			/>
		</>
	);
}

export default AddParticipant;
