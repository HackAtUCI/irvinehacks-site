"use client";

import Container from "@cloudscape-design/components/container";
import SpaceBetween from "@cloudscape-design/components/space-between";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import Button from "@cloudscape-design/components/button";
import DatePicker from "@cloudscape-design/components/date-picker";
import TimeInput from "@cloudscape-design/components/time-input";
import Header from "@cloudscape-design/components/header";

const committeeOptions = [
	{ label: "Corporate", value: "Corporate" },
	{ label: "Design", value: "Design" },
	{ label: "Logistics", value: "Logistics" },
	{ label: "Marketing", value: "Marketing" },
	{ label: "Tech", value: "Tech" },
];

const subcommitteeOptions = [
	{ label: "Check-in Lead", value: "Check-in Lead" },
	{ label: "Communications Lead", value: "Communications Lead" },
	{ label: "Decorations", value: "Decorations Member" },
	{ label: "Emcee", value: "Emcee" },
	{ label: "Food", value: "Food Member" },
	{ label: "Judging Lead", value: "Judging Lead" },
	{ label: "Mentor", value: "Mentor Reviewer" },
	{ label: "Social Events", value: "Social Events Member" },
	{ label: "Swag", value: "Swag Member" },
	{ label: "Volunteer Lead", value: "Volunteer Reviewer" },
	{ label: "Workshop", value: "Workshop Member" },
];

interface Shift {
	shiftName: string;
	location: string;
	num_orgs: string;
	startDate: string;
	startTime: string;
	endDate: string;
	endTime: string;
	pointValue: string;
	requiredCommittee: string;
	requiredSubcommittee: string;
	preAssignedOrganizers: string[];
}

interface ShiftCardProps {
	shift: Shift;
	onChange: (updated: Partial<Shift>) => void;
	onDuplicate: () => void;
	onDelete: () => void;
}

export default function ShiftCard({
	shift,
	onChange,
	onDuplicate,
	onDelete,
}: ShiftCardProps) {
	return (
		<Container
			header={
				<Header
					variant="h2"
					actions={
						<SpaceBetween direction="horizontal" size="xs">
							<Button
								iconName="copy"
								variant="icon"
								ariaLabel="Duplicate shift"
								onClick={onDuplicate}
							/>
							<Button
								iconName="remove"
								variant="icon"
								ariaLabel="Delete shift"
								onClick={onDelete}
							/>
						</SpaceBetween>
					}
				>
					Shift Details
				</Header>
			}
		>
			<SpaceBetween size="l">
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "3fr 2fr 1fr 1fr",
						gap: "20px",
						alignItems: "end",
					}}
				>
					<FormField
						label={
							<>
								Shift name <span style={{ color: "red" }}>*</span>
							</>
						}
					>
						<Input
							value={shift.shiftName}
							onChange={({ detail }) => onChange({ shiftName: detail.value })}
						/>
					</FormField>

					<FormField
						label={
							<>
								Location <span style={{ color: "red" }}>*</span>
							</>
						}
					>
						<Input
							value={shift.location}
							onChange={({ detail }) => onChange({ location: detail.value })}
						/>
					</FormField>
					<FormField
						label={
							<>
								Max # of orgs <span style={{ color: "red" }}>*</span>
							</>
						}
					>
						<Input
							value={shift.num_orgs}
							onChange={({ detail }) => onChange({ num_orgs: detail.value })}
						/>
					</FormField>

					<FormField
						label={
							<>
								Point value <span style={{ color: "red" }}>*</span>
							</>
						}
					>
						<Input
							value={shift.pointValue}
							onChange={({ detail }) => onChange({ pointValue: detail.value })}
						/>
					</FormField>
				</div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr 1fr 1fr",
						gap: "20px",
					}}
				>
					<FormField
						label={
							<>
								Start date <span style={{ color: "red" }}>*</span>
							</>
						}
					>
						<DatePicker
							value={shift.startDate}
							onChange={({ detail }) => onChange({ startDate: detail.value })}
							placeholder="YYYY/MM/DD"
						/>
					</FormField>

					<FormField
						label={
							<>
								Start time <span style={{ color: "red" }}>*</span>
							</>
						}
					>
						<TimeInput
							value={shift.startTime}
							onChange={({ detail }) => onChange({ startTime: detail.value })}
							placeholder="hh:mm"
						/>
					</FormField>

					<FormField
						label={
							<>
								End date <span style={{ color: "red" }}>*</span>
							</>
						}
					>
						<DatePicker
							value={shift.endDate}
							onChange={({ detail }) => onChange({ endDate: detail.value })}
							placeholder="YYYY/MM/DD"
						/>
					</FormField>

					<FormField
						label={
							<>
								End time <span style={{ color: "red" }}>*</span>
							</>
						}
					>
						<TimeInput
							value={shift.endTime}
							onChange={({ detail }) => onChange({ endTime: detail.value })}
							placeholder="hh:mm"
						/>
					</FormField>
				</div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr 1.5fr",
						gap: "20px",
					}}
				>
					<FormField label="Required committee">
						<Select
							selectedOption={
								committeeOptions.find(
									(opt) => opt.value === shift.requiredCommittee,
								) ?? null
							}
							onChange={({ detail }) =>
								onChange({
									requiredCommittee: detail.selectedOption?.value ?? "",
								})
							}
							options={committeeOptions}
						/>
					</FormField>

					<FormField label="Required subcommittee">
						<Select
							selectedOption={
								subcommitteeOptions.find(
									(opt) => opt.value === shift.requiredSubcommittee,
								) ?? null
							}
							onChange={({ detail }) =>
								onChange({
									requiredSubcommittee: detail.selectedOption?.value ?? "",
								})
							}
							options={subcommitteeOptions}
						/>
					</FormField>

					<FormField label="Pre assigned organizers">
						<Input
							value=""
							placeholder="Search organizers..."
							onChange={() => {}}
						/>
					</FormField>
				</div>
			</SpaceBetween>
		</Container>
	);
}
