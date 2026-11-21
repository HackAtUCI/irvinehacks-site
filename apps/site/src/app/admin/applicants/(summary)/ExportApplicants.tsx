"use client";

import { useState } from "react";

import axios from "axios";

import Alert from "@cloudscape-design/components/alert";
import Button from "@cloudscape-design/components/button";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Container from "@cloudscape-design/components/container";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Multiselect, {
	MultiselectProps,
} from "@cloudscape-design/components/multiselect";
import Select, { SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { ParticipantRole, Status } from "@/lib/userRecord";

type ExportRole = ParticipantRole.Hacker | ParticipantRole.Mentor;

interface ApplicantExportRecord {
	first_name: string;
	last_name: string;
	email: string;
	status: Status;
}

const STATUS_LABELS: Partial<Record<Status, string>> = {
	[Status.Confirmed]: "Confirmed",
	[Status.Waitlisted]: "Waitlisted",
	[Status.Rejected]: "Rejected",
	[Status.Signed]: "Waiver Signed",
};

const EXPORTABLE_STATUSES: Record<ExportRole, Status[]> = {
	[ParticipantRole.Hacker]: [
		Status.Confirmed,
		Status.Waitlisted,
		Status.Rejected,
	],
	[ParticipantRole.Mentor]: [Status.Confirmed, Status.Rejected, Status.Signed],
};

const ROLE_OPTIONS: SelectProps.Option[] = [
	{ label: "Hackers", value: ParticipantRole.Hacker },
	{ label: "Mentors", value: ParticipantRole.Mentor },
];

function escapeCSV(value: string): string {
	if (/[",\n]/.test(value)) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

function downloadCSV(records: ApplicantExportRecord[], filename: string) {
	const header = ["First Name", "Last Name", "Email", "Status"];
	const rows = records.map((r) =>
		[r.first_name, r.last_name, r.email, STATUS_LABELS[r.status] ?? r.status]
			.map(escapeCSV)
			.join(","),
	);
	const csv = [header.join(","), ...rows].join("\n");

	const url = URL.createObjectURL(
		new Blob([csv], { type: "text/csv;charset=utf-8;" }),
	);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function ExportApplicants() {
	const [roleOption, setRoleOption] = useState<SelectProps.Option>(
		ROLE_OPTIONS[0],
	);
	const [selectedStatuses, setSelectedStatuses] = useState<
		ReadonlyArray<MultiselectProps.Option>
	>([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "info" | "error";
		text: string;
	} | null>(null);

	const role = roleOption.value as ExportRole;
	const statusOptions = EXPORTABLE_STATUSES[role].map((status) => ({
		label: STATUS_LABELS[status],
		value: status,
	}));

	const handleExport = async () => {
		setMessage(null);
		setLoading(true);

		const params = new URLSearchParams({ role });
		selectedStatuses.forEach((option) =>
			params.append("statuses", option.value!),
		);

		try {
			const res = await axios.get<ApplicantExportRecord[]>(
				"/api/admin/applicants/export",
				{ params },
			);

			if (res.data.length === 0) {
				setMessage({
					type: "info",
					text: "No applicants match the selected statuses.",
				});
				return;
			}

			const statusNames = selectedStatuses
				.map((option) => option.value!.toLowerCase())
				.join("-");
			downloadCSV(res.data, `${role.toLowerCase()}s-${statusNames}.csv`);
		} catch (err) {
			console.error(err);
			setMessage({ type: "error", text: "Failed to export applicants." });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container
			header={
				<Header
					variant="h2"
					description="Download a CSV of names, emails, and statuses for applicants with the selected statuses"
				>
					Export Applicants
				</Header>
			}
		>
			<SpaceBetween size="m">
				<ColumnLayout columns={2}>
					<FormField label="Applicant type">
						<Select
							selectedOption={roleOption}
							onChange={({ detail }) => {
								setRoleOption(detail.selectedOption);
								setSelectedStatuses([]);
								setMessage(null);
							}}
							options={ROLE_OPTIONS}
						/>
					</FormField>
					<FormField label="Statuses">
						<Multiselect
							selectedOptions={selectedStatuses}
							onChange={({ detail }) => {
								setSelectedStatuses(detail.selectedOptions);
								setMessage(null);
							}}
							options={statusOptions}
							placeholder="Choose statuses"
						/>
					</FormField>
				</ColumnLayout>
				<Button
					variant="primary"
					iconName="download"
					loading={loading}
					disabled={selectedStatuses.length === 0}
					onClick={handleExport}
				>
					Export CSV
				</Button>
				{message && <Alert type={message.type}>{message.text}</Alert>}
			</SpaceBetween>
		</Container>
	);
}

export default ExportApplicants;
