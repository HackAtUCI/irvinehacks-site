"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

import SpaceBetween from "@cloudscape-design/components/space-between";
import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";
import Input from "@cloudscape-design/components/input";
import DatePicker from "@cloudscape-design/components/date-picker";
import FormField from "@cloudscape-design/components/form-field";
import TimeInput from "@cloudscape-design/components/time-input";

import Form from "@cloudscape-design/components/form";

import ShiftCard from "./ShiftCard";

interface Shift {
	id: string;
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

function shiftToPayload(shift: Shift) {
	return {
		shiftName: shift.shiftName,
		num_orgs: shift.num_orgs,
		location: shift.location,
		pointValue: shift.pointValue,
		requiredCommittee: shift.requiredCommittee,
		requiredSubcommittee: shift.requiredSubcommittee,
		preAssignedOrganizers: shift.preAssignedOrganizers,
		start_time: `${shift.startDate}T${shift.startTime}:00`,
		end_time: `${shift.endDate}T${shift.endTime}:00`,
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

	useEffect(() => {
		if (isNew) return;
		axios
			.get(`/api/director/templates/${decodeURIComponent(templateName)}`)
			.then(({ data }) => {
				setName(data.template_name);
				setDateTime(data.event_start, setEventStartDate, setEventStartTime);
				setDateTime(data.event_end, setEventEndDate, setEventEndTime);
				setShifts(data.shifts ?? [emptyShift()]);
			});
	}, [isNew, templateName]);

	async function handleSave() {
		const payload = {
			template_name: name,
			event_start: `${eventStartDate}T${eventStartTime}:00`,
			event_end: `${eventEndDate}T${eventEndTime}:00`,
			shifts: shifts.map(shiftToPayload),
		};

		if (isNew) {
			await axios.post("/api/director/create-template", payload);
		} else {
			await axios.post("/api/director/update-template", payload);
		}
		router.push("/admin/directors/template-gallery");
	}

	function handleDiscard() {
		router.push("/admin/directors/template-gallery");
	}

	function updateShift(id: string, updated: Partial<Shift>) {
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
						onChange={(updated) => updateShift(shift.id, updated)}
						onDuplicate={() => duplicateShift(shift.id)}
						onDelete={() => deleteShift(shift.id)}
					/>
				))}

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
