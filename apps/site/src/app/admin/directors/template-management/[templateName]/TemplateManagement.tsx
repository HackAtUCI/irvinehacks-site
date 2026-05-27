"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";
import Input from "@cloudscape-design/components/input";
import DatePicker from "@cloudscape-design/components/date-picker";
import FormField from "@cloudscape-design/components/form-field";
import TimeInput from "@cloudscape-design/components/time-input";

import Form from "@cloudscape-design/components/form";

import ShiftCard from "./ShiftCard";
import type { Shift, ShiftErrors } from "./ShiftTypes";

function emptyShift(): Shift {
	return {
		id: crypto.randomUUID(),
		shiftName: "",
		location: "",
		num_orgs: "",
		startDate: "",
		startTime: "",
		endDate: "",
		endTime: "",
		pointValue: "",
		requiredCommittee: "",
		requiredSubcommittee: "",
		preAssignedOrganizers: [],
	};
}

function setDateTime(
	dateTime: string,
	setDate: (date: string) => void,
	setTime: (time: string) => void,
) {
	const [date, time] = dateTime.split("T");
	setDate(date ?? "");
	setTime(time?.slice(0, 5) ?? "");
}

function shiftFromAPI(apiShift: any): Shift {
	const startDT = apiShift.hour?.start_time ?? "";
	const endDT = apiShift.hour?.end_time ?? "";

	const [startDate, startTimeFull] = startDT.split("T");
	const [endDate, endTimeFull] = endDT.split("T");

	return {
		id: crypto.randomUUID(),
		shiftName: apiShift.shift_name ?? "",
		location: apiShift.location ?? "",
		num_orgs: String(apiShift.min_num_organizers ?? ""),
		pointValue: String(apiShift.shift_pts ?? ""),
		startDate: startDate ?? "",
		startTime: startTimeFull?.slice(0, 5) ?? "",
		endDate: endDate ?? "",
		endTime: endTimeFull?.slice(0, 5) ?? "",
		requiredCommittee: apiShift.committee_prereq ?? "",
		requiredSubcommittee: apiShift.subcommittee_prereq ?? "",
		preAssignedOrganizers: apiShift.preassigned_orgs ?? [],
	};
}

function shiftToPayload(shift: Shift) {
	return {
		shift_name: shift.shiftName,
		location: shift.location,
		min_num_organizers: Number(shift.num_orgs),
		shift_pts: Number(shift.pointValue),
		organizers: [],
		hour: {
			start_time: new Date(
				`${shift.startDate}T${shift.startTime}`,
			).toISOString(),
			end_time: new Date(`${shift.endDate}T${shift.endTime}`).toISOString(),
			director_on_shift: [],
		},
		committee_prereq: shift.requiredCommittee,
		subcommittee_prereq: shift.requiredSubcommittee,
		preassigned_orgs: shift.preAssignedOrganizers,
	};
}

function TemplateManagement() {
	const { templateName } = useParams<{ templateName: string }>();
	const router = useRouter();
	const isNew = templateName === "new";

	const [name, setName] = useState("");
	const [eventStartDate, setEventStartDate] = useState("");
	const [eventEndDate, setEventEndDate] = useState("");
	const [eventStartTime, setEventStartTime] = useState("");
	const [eventEndTime, setEventEndTime] = useState("");
	const [shifts, setShifts] = useState<Shift[]>([emptyShift()]);
	const [shiftErrors, setShiftErrors] = useState<Record<string, ShiftErrors>>(
		{},
	);

	const [errors, setErrors] = useState({
		name: "",
		eventStartDate: "",
		eventStartTime: "",
		eventEndDate: "",
		eventEndTime: "",
	});

	const [shiftError, setShiftError] = useState("");
	function toISODate(cloudscapeDate: string) {
		return cloudscapeDate.replace(/\//g, "-");
	}
	function validateEventFields() {
		const newErrors = {
			name: name ? "" : "Template name is required",
			eventStartDate: eventStartDate ? "" : "Event start date is required",
			eventStartTime: eventStartTime ? "" : "Event start time is required",
			eventEndDate: eventEndDate ? "" : "Event end date is required",
			eventEndTime: eventEndTime ? "" : "Event end time is required",
		};
		setErrors(newErrors);
		return Object.values(newErrors).every((e) => e === "");
	}

	function validateShiftRequiredFields() {
		const valid = shifts.every(
			(s) =>
				s.shiftName &&
				s.location &&
				s.num_orgs &&
				s.startDate &&
				s.startTime &&
				s.endDate &&
				s.endTime &&
				s.pointValue &&
				!isNaN(Number(s.pointValue)),
		);

		if (!valid) {
			setShiftError("Please fill in all required shift fields");
		}
		return valid;
	}

	useEffect(() => {
		if (isNew) return;
		axios
			.get(`/api/director/templates/${decodeURIComponent(templateName)}`)
			.then(({ data }) => {
				setName(data.template_name);
				setDateTime(data.event_start, setEventStartDate, setEventStartTime);
				setDateTime(data.event_end, setEventEndDate, setEventEndTime);
				setShifts(data.shifts?.map(shiftFromAPI) ?? [emptyShift()]);
			});
	}, [isNew, templateName]);

	async function handleSave() {
		if (!validateEventFields()) {
			return;
		}
		if (!validateShiftRequiredFields()) {
			return;
		}

		const payload = {
			template_name: name,
			event_start: new Date(
				`${eventStartDate}T${eventStartTime}`,
			).toISOString(),
			event_end: new Date(`${eventEndDate}T${eventEndTime}`).toISOString(),
			shifts: shifts.map(shiftToPayload),
		};

		if (isNew) {
			const body = { template_name: name };
			console.log(JSON.stringify(body));
			await axios.post("/api/director/create-template", body);
		}
		await axios.post("/api/director/update-template", {
			template_name: payload.template_name,
			event_dates: [
				new Date(
					`${toISODate(eventStartDate)}T${eventStartTime}`,
				).toISOString(),
				new Date(`${toISODate(eventEndDate)}T${eventEndTime}`).toISOString(),
			],
			shifts: shifts.map(shiftToPayload),
		});

		router.push("/admin/directors/template-gallery");
	}

	function handleDiscard() {
		router.push("/admin/directors/template-gallery");
	}

	function updateShift(id: string, updated: Partial<Shift>) {
		setShiftError("");
		setShifts((prev) =>
			prev.map((s) => (s.id === id ? { ...s, ...updated } : s)),
		);
	}

	function duplicateShift(id: string) {
		const idx = shifts.findIndex((s) => s.id === id);
		const copy = { ...shifts[idx], id: crypto.randomUUID() };
		setShifts((prev) => [
			...prev.slice(0, idx + 1),
			copy,
			...prev.slice(idx + 1),
		]);
	}

	function deleteShift(id: string) {
		setShifts((prev) => prev.filter((s) => s.id !== id));
	}

	return (
		<Form
			header={
				<Header
					variant="h1"
					actions={
						<SpaceBetween direction="horizontal" size="xs">
							<Button variant="normal" onClick={handleDiscard}>
								Discard
							</Button>
							<Button variant="primary" onClick={handleSave}>
								Save
							</Button>
						</SpaceBetween>
					}
				>
					Template Management
				</Header>
			}
		>
			<SpaceBetween size="l">
				<SpaceBetween size="xl">
					<SpaceBetween direction="horizontal" size="xxl">
						<div style={{ width: "400px" }}>
							<FormField
								label={
									<>
										Template name <span style={{ color: "red" }}>*</span>
									</>
								}
								errorText={errors.name}
							>
								<Input
									value={name}
									onChange={({ detail }) => setName(detail.value)}
								/>
							</FormField>
						</div>
					</SpaceBetween>

					<div>
						<strong>
							Please use military time (24 hour time format) for all time
							fields.
						</strong>
					</div>

					<SpaceBetween direction="horizontal" size="xxl">
						<div style={{ width: "220px" }}>
							<FormField
								label={
									<>
										Event start date <span style={{ color: "red" }}>*</span>
									</>
								}
								errorText={errors.eventStartDate}
							>
								<DatePicker
									value={eventStartDate}
									onChange={({ detail }) => setEventStartDate(detail.value)}
									placeholder="YYYY/MM/DD"
								/>
							</FormField>
						</div>

						<div style={{ width: "180px" }}>
							<FormField
								label={
									<>
										Event start time <span style={{ color: "red" }}>*</span>
									</>
								}
								errorText={errors.eventStartTime}
							>
								<TimeInput
									value={eventStartTime}
									onChange={({ detail }) => setEventStartTime(detail.value)}
									placeholder="hh:mm"
								/>
							</FormField>
						</div>

						<div style={{ width: "220px" }}>
							<FormField
								label={
									<>
										Event end date <span style={{ color: "red" }}>*</span>
									</>
								}
								errorText={errors.eventEndDate}
							>
								<DatePicker
									value={eventEndDate}
									onChange={({ detail }) => setEventEndDate(detail.value)}
									placeholder="YYYY/MM/DD"
								/>
							</FormField>
						</div>

						<div style={{ width: "180px" }}>
							<FormField
								label={
									<>
										Event end time <span style={{ color: "red" }}>*</span>
									</>
								}
								errorText={errors.eventEndTime}
							>
								<TimeInput
									value={eventEndTime}
									onChange={({ detail }) => setEventEndTime(detail.value)}
									placeholder="hh:mm"
								/>
							</FormField>
						</div>
					</SpaceBetween>
				</SpaceBetween>

				{shifts.map((shift) => (
					<ShiftCard
						key={shift.id}
						shift={shift}
						eventStart={`${eventStartDate}T${eventStartTime}`}
						eventEnd={`${eventEndDate}T${eventEndTime}`}
						errors={shiftErrors[shift.id]}
						onChange={(updated) => updateShift(shift.id, updated)}
						onValidate={(updatedShift, errors) =>
							setShiftErrors((prev) => ({
								...prev,
								[shift.id]: errors,
							}))
						}
						onDuplicate={() => duplicateShift(shift.id)}
						onDelete={() => deleteShift(shift.id)}
					/>
				))}

				{shiftError && <Box color="text-status-error">{shiftError}</Box>}

				<Button
					variant="normal"
					iconName="add-plus"
					onClick={() => setShifts((prev) => [...prev, emptyShift()])}
				>
					Add shift event
				</Button>
			</SpaceBetween>
		</Form>
	);
}

export default TemplateManagement;
