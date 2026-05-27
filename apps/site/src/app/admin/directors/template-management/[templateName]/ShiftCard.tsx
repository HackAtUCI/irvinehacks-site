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
import Multiselect from "@cloudscape-design/components/multiselect";

import useOrganizers from "@/lib/admin/useOrganizers";
import type { Shift, ShiftErrors } from "./ShiftTypes";
import { subcommitteeOptions, committeeOptions } from "./CommitteeOptions";

interface ShiftCardProps {
	shift: Shift;
	eventStart?: string;
	eventEnd?: string;
	errors?: ShiftErrors;
	onChange: (updated: Partial<Shift>) => void;
	onValidate?: (updatedShift: Shift, errors: ShiftErrors) => void;
	onDuplicate: () => void;
	onDelete: () => void;
}

export default function ShiftCard({
	shift,
	eventStart,
	eventEnd,
	errors,
	onChange,
	onDuplicate,
	onDelete,
	onValidate,
}: ShiftCardProps) {
	const { organizerList } = useOrganizers();

	const organizerOptions = organizerList.map((org) => ({
		label: `${org.first_name} ${org.last_name}`,
		value: org._id,
	}));

	function handleUpdate(updated: Partial<Shift>) {
		const newShift = { ...shift, ...updated };

		onChange(updated);

		validateShift(newShift);
	}

	function validateShift(s: Shift) {
		const newErrors: ShiftErrors = {};

		if (!s.shiftName) newErrors.shiftName = "Required";
		if (!s.location) newErrors.location = "Required";
		if (!s.num_orgs) newErrors.num_orgs = "Required";
		if (!s.pointValue) newErrors.pointValue = "Required";
		if (!s.startDate) newErrors.startDate = "Required";
		if (!s.startTime) newErrors.startTime = "Required";
		if (!s.endDate) newErrors.endDate = "Required";
		if (!s.endTime) newErrors.endTime = "Required";

		if (s.num_orgs && isNaN(Number(s.num_orgs))) {
			newErrors.num_orgs = "Must be a number";
		}

		if (s.pointValue && isNaN(Number(s.pointValue))) {
			newErrors.pointValue = "Must be a number";
		}

		if (s.startDate && s.startTime && s.endDate && s.endTime) {
			const shiftStart = new Date(`${s.startDate}T${s.startTime}`);
			const shiftEnd = new Date(`${s.endDate}T${s.endTime}`);

			const eventStartDt = eventStart ? new Date(eventStart) : null;
			const eventEndDt = eventEnd ? new Date(eventEnd) : null;

			if (shiftStart >= shiftEnd) {
				newErrors.endTime = "Shift must end after it starts";
			}

			if (eventStartDt && !isNaN(eventStartDt.getTime())) {
				if (shiftStart < eventStartDt) {
					newErrors.startDate = "Shift starts before event begins";
				}
			}

			if (eventEndDt && !isNaN(eventEndDt.getTime())) {
				if (shiftEnd > eventEndDt) {
					newErrors.endDate = "Shift ends after event ends";
				}
			}
		}

		onValidate?.(s, newErrors);
	}

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
						errorText={errors?.shiftName}
					>
						<Input
							value={shift.shiftName}
							onChange={({ detail }) =>
								handleUpdate({ shiftName: detail.value })
							}
						/>
					</FormField>

					<FormField
						label={
							<>
								Location <span style={{ color: "red" }}>*</span>
							</>
						}
						errorText={errors?.location}
					>
						<Input
							value={shift.location}
							onChange={({ detail }) =>
								handleUpdate({ location: detail.value })
							}
						/>
					</FormField>
					<FormField
						label={
							<>
								Max # of orgs <span style={{ color: "red" }}>*</span>
							</>
						}
						errorText={errors?.num_orgs}
					>
						<Input
							value={shift.num_orgs}
							onChange={({ detail }) =>
								handleUpdate({ num_orgs: detail.value })
							}
						/>
					</FormField>

					<FormField
						label={
							<>
								Point value <span style={{ color: "red" }}>*</span>
							</>
						}
						errorText={errors?.pointValue}
					>
						<Input
							value={shift.pointValue}
							onChange={({ detail }) =>
								handleUpdate({ pointValue: detail.value })
							}
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
						errorText={errors?.startDate}
					>
						<DatePicker
							value={shift.startDate}
							onChange={({ detail }) =>
								handleUpdate({ startDate: detail.value })
							}
							placeholder="YYYY/MM/DD"
						/>
					</FormField>

					<FormField
						label={
							<>
								Start time <span style={{ color: "red" }}>*</span>
							</>
						}
						errorText={errors?.startTime}
					>
						<TimeInput
							value={shift.startTime}
							onChange={({ detail }) =>
								handleUpdate({ startTime: detail.value })
							}
							placeholder="hh:mm"
						/>
					</FormField>

					<FormField
						label={
							<>
								End date <span style={{ color: "red" }}>*</span>
							</>
						}
						errorText={errors?.endDate}
					>
						<DatePicker
							value={shift.endDate}
							onChange={({ detail }) => handleUpdate({ endDate: detail.value })}
							placeholder="YYYY/MM/DD"
						/>
					</FormField>

					<FormField
						label={
							<>
								End time <span style={{ color: "red" }}>*</span>
							</>
						}
						errorText={errors?.endTime}
					>
						<TimeInput
							value={shift.endTime}
							onChange={({ detail }) => handleUpdate({ endTime: detail.value })}
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
								handleUpdate({
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
								handleUpdate({
									requiredSubcommittee: detail.selectedOption?.value ?? "",
								})
							}
							options={subcommitteeOptions}
						/>
					</FormField>

					<FormField label="Pre assigned organizers">
						<Multiselect
							selectedOptions={(shift.preAssignedOrganizers ?? []).map((id) => {
								const org = organizerList.find((o) => o._id === id);
								return {
									label: org ? `${org.first_name} ${org.last_name}` : id,
									value: id,
								};
							})}
							onChange={({ detail }) =>
								onChange({
									preAssignedOrganizers: detail.selectedOptions.map(
										(o) => o.value ?? "",
									),
								})
							}
							options={organizerOptions}
							placeholder="Search organizers..."
							filteringType="auto"
						/>
					</FormField>
				</div>
			</SpaceBetween>
		</Container>
	);
}
