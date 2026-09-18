"use client";

import { ChangeEvent, useState } from "react";

import axios from "axios";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Modal from "@cloudscape-design/components/modal";
import Select, { SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table, { TableProps } from "@cloudscape-design/components/table";

import { ParticipantRole } from "@/lib/userRecord";

import AddParticipantModal from "./AddParticipantModal";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleOptions: SelectProps.Options = [
	{ label: "Sponsor", value: ParticipantRole.Sponsor },
	{ label: "Judge", value: ParticipantRole.Judge },
	{ label: "Workshop Lead", value: ParticipantRole.WorkshopLead },
	{ label: "Guest", value: ParticipantRole.Guest },
];

const roleByLabel = new Map(
	roleOptions.flatMap((option) => [
		[String(option.label).toLowerCase(), option.value as ParticipantRole],
		[String(option.value).toLowerCase(), option.value as ParticipantRole],
	]),
);

const csvColumnAliases = {
	email: ["email"],
	first_name: ["first_name", "first name", "firstname"],
	last_name: ["last_name", "last name", "lastname"],
	role: ["role"],
} as const;

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
	const [importVisible, setImportVisible] = useState(false);
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
	const [importError, setImportError] = useState("");
	const [importRows, setImportRows] = useState<RawNonHackerParticipant[]>([]);
	const [importFileName, setImportFileName] = useState("");
	const [isImporting, setIsImporting] = useState(false);

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

	function resetImport() {
		setImportVisible(false);
		setImportRows([]);
		setImportFileName("");
		setImportError("");
		setIsImporting(false);
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

	async function handleCsvFileChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";

		if (!file) return;

		try {
			const text = await file.text();
			const rows = parseParticipantsCsv(text);
			setImportRows(rows);
			setImportFileName(file.name);
			setImportError("");
		} catch (error) {
			setImportRows([]);
			setImportFileName(file.name);
			setImportError(
				error instanceof Error ? error.message : "Could not parse CSV file.",
			);
		}
	}

	async function submitImport() {
		if (importRows.length === 0) return;

		try {
			setIsImporting(true);
			setImportError("");
			await axios.post("/api/admin/non-hacker-participants/import", {
				participants: importRows,
			});
			await onAdded();
			resetImport();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const detail = error.response?.data?.detail;
				setImportError(
					typeof detail === "string"
						? detail
						: "Could not import participants.",
				);
			} else {
				setImportError("Could not import participants.");
			}
		} finally {
			setIsImporting(false);
		}
	}

	return (
		<>
			<SpaceBetween direction="horizontal" size="xs">
				<Button onClick={() => setVisible(true)}>Add Participant</Button>
				<Button onClick={() => setImportVisible(true)}>Import CSV</Button>
			</SpaceBetween>
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
			<Modal
				onDismiss={resetImport}
				visible={importVisible}
				header="Import Participants"
				size="large"
				footer={
					<Box float="right">
						<SpaceBetween direction="horizontal" size="xs">
							<Button variant="link" onClick={resetImport}>
								Cancel
							</Button>
							<Button
								variant="primary"
								onClick={submitImport}
								disabled={importRows.length === 0 || isImporting}
								loading={isImporting}
							>
								Import
							</Button>
						</SpaceBetween>
					</Box>
				}
			>
				<SpaceBetween direction="vertical" size="m">
					<Box variant="p">
						Upload a CSV with columns: email, first_name, last_name, role.
					</Box>
					<FormField label="CSV file">
						<input
							type="file"
							accept=".csv,text/csv"
							onChange={handleCsvFileChange}
						/>
					</FormField>
					{importFileName && <Box>Selected file: {importFileName}</Box>}
					{importError && <Box color="text-status-error">{importError}</Box>}
					{importRows.length > 0 && (
						<Table
							columnDefinitions={importPreviewColumns}
							items={importRows}
							trackBy="email"
							header={`Preview (${importRows.length})`}
							variant="embedded"
						/>
					)}
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

const importPreviewColumns: TableProps.ColumnDefinition<RawNonHackerParticipant>[] =
	[
		{
			id: "email",
			header: "Email",
			cell: (item) => item.email,
		},
		{
			id: "first_name",
			header: "First name",
			cell: (item) => item.first_name,
		},
		{
			id: "last_name",
			header: "Last name",
			cell: (item) => item.last_name,
		},
		{
			id: "role",
			header: "Role",
			cell: (item) => item.role,
		},
	];

function parseParticipantsCsv(csv: string): RawNonHackerParticipant[] {
	const rows = parseCsv(csv).filter((row) =>
		row.some((value) => value.trim() !== ""),
	);
	if (rows.length < 2) {
		throw new Error(
			"CSV must include a header row and at least one participant.",
		);
	}

	const headers = rows[0].map((header) => normalizeCsvHeader(header));
	const columnIndexes = getCsvColumnIndexes(headers);
	const participants = rows.slice(1).map((row, index) => {
		const rowNumber = index + 2;
		const email = (row[columnIndexes.email] ?? "").trim();
		const firstName = (row[columnIndexes.first_name] ?? "").trim();
		const lastName = (row[columnIndexes.last_name] ?? "").trim();
		const roleValue = (row[columnIndexes.role] ?? "").trim();
		const role = roleByLabel.get(roleValue.toLowerCase());

		if (!EMAIL_REGEX.test(email)) {
			throw new Error(`Row ${rowNumber}: enter a valid email.`);
		}
		if (!firstName) {
			throw new Error(`Row ${rowNumber}: first_name is required.`);
		}
		if (!lastName) {
			throw new Error(`Row ${rowNumber}: last_name is required.`);
		}
		if (!role) {
			throw new Error(
				`Row ${rowNumber}: role must be Sponsor, Judge, Workshop Lead, or Guest.`,
			);
		}

		return {
			email,
			first_name: firstName,
			last_name: lastName,
			role,
		};
	});

	const seenEmails = new Set<string>();
	for (const participant of participants) {
		const normalizedEmail = participant.email.toLowerCase();
		if (seenEmails.has(normalizedEmail)) {
			throw new Error(`Duplicate email in CSV: ${participant.email}.`);
		}
		seenEmails.add(normalizedEmail);
	}

	return participants;
}

function getCsvColumnIndexes(headers: string[]) {
	const indexes = {
		email: findCsvColumn(headers, csvColumnAliases.email),
		first_name: findCsvColumn(headers, csvColumnAliases.first_name),
		last_name: findCsvColumn(headers, csvColumnAliases.last_name),
		role: findCsvColumn(headers, csvColumnAliases.role),
	};

	for (const [field, index] of Object.entries(indexes)) {
		if (index === -1) {
			throw new Error(`CSV is missing required column: ${field}.`);
		}
	}

	return indexes;
}

function findCsvColumn(headers: string[], aliases: readonly string[]) {
	return headers.findIndex((header) => aliases.includes(header));
}

function normalizeCsvHeader(header: string) {
	return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseCsv(csv: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let inQuotes = false;

	for (let index = 0; index < csv.length; index += 1) {
		const char = csv[index];
		const nextChar = csv[index + 1];

		if (char === '"') {
			if (inQuotes && nextChar === '"') {
				field += '"';
				index += 1;
			} else {
				inQuotes = !inQuotes;
			}
			continue;
		}

		if (char === "," && !inQuotes) {
			row.push(field);
			field = "";
			continue;
		}

		if ((char === "\n" || char === "\r") && !inQuotes) {
			if (char === "\r" && nextChar === "\n") {
				index += 1;
			}
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
			continue;
		}

		field += char;
	}

	if (inQuotes) {
		throw new Error("CSV has an unclosed quoted field.");
	}

	row.push(field);
	rows.push(row);

	return rows;
}
