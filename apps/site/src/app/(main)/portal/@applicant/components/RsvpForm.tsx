"use client";

import { useState } from "react";
import { Status } from "@/lib/userRecord";
import useUserIdentity from "@/lib/utils/useUserIdentity";
import Button from "@/lib/components/Button/Button";
import ControlledDropdownSelect from "@/lib/components/forms/ControlledDropdownSelect";

interface RsvpFormProps {
	buttonText: string;
	showWarning: boolean;
	status?: Status;
}

// Late arrival options for accepted applicants (starting at 6:00 PM)
const ACCEPTED_LATE_ARRIVAL_TIME_OPTIONS = [
	{ value: "18:00", label: "6:00 PM" },
	{ value: "18:30", label: "6:30 PM" },
	{ value: "19:00", label: "7:00 PM" },
	{ value: "19:30", label: "7:30 PM" },
] as const;

// Late arrival options for waitlist applicants (starting at 7:00 PM)
const WAITLIST_LATE_ARRIVAL_TIME_OPTIONS = [
	{ value: "19:00", label: "7:00 PM" },
	{ value: "19:30", label: "7:30 PM" },
	{ value: "20:00", label: "8:00 PM" },
	{ value: "20:30", label: "8:30 PM" },
] as const;

export default function RsvpForm({
	buttonText,
	showWarning,
	status,
}: RsvpFormProps) {
	const identity = useUserIdentity();
	const isWaitlisted =
		status === Status.Waitlisted || identity?.decision === Status.Waitlisted;

	const [comingLateChoice, setComingLateChoice] = useState<"" | "no" | "yes">(
		"",
	);
	const [arrivalTime, setArrivalTime] = useState<string>(
		isWaitlisted ? "19:00" : "18:00",
	);

	const comingLate = comingLateChoice === "yes";
	const confirmationMessage =
		"WARNING: You will not be able to RSVP again. Are you sure you want to continue?";

	const lateArrivalOptions = isWaitlisted
		? WAITLIST_LATE_ARRIVAL_TIME_OPTIONS
		: ACCEPTED_LATE_ARRIVAL_TIME_OPTIONS;

	const checkInTime = isWaitlisted ? "6:00 PM" : "5:00 PM";
	const lateCheckInTime = isWaitlisted ? "7:00 PM" : "6:00 PM";

	return (
		<form
			method="post"
			action="/api/user/rsvp"
			onSubmit={(event) => {
				if (showWarning && !confirm(confirmationMessage)) {
					event.preventDefault();
				}
			}}
			className="space-y-4"
		>
			<ControlledDropdownSelect
				name="coming-late"
				labelText={`Check-in starts at ${checkInTime} on Friday. Will you be arriving later than ${checkInTime}?`}
				values={[
					{ value: "", text: "Select an option" },
					{
						value: "no",
						text: `No, I'll be there by ${checkInTime}`,
					},
					{ value: "yes", text: "Yes" },
				]}
				containerClass="flex flex-col w-full max-w-md text-[var(--color-white)]"
				value={comingLateChoice}
				onChange={(v) => setComingLateChoice(v as "" | "no" | "yes")}
			/>

			{comingLate && (
				<div className="flex flex-col w-full max-w-md text-[var(--color-white)]">
					<label className="text-lg mb-2" htmlFor="arrival_time">
						Late Check-in starts at {lateCheckInTime} on Friday. Choose your
						expected arrival time. You will not be able to edit this time.
					</label>
					<select
						id="arrival_time"
						name="arrival_time"
						value={arrivalTime}
						onChange={(e) => setArrivalTime(e.target.value)}
						className="bg-[#e1e1e1] text-[var(--color-black)] text-lg h-10 p-1.5 rounded-md"
					>
						{lateArrivalOptions.map(({ value, label }) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</select>
				</div>
			)}

			<div className="mt-2 md:mt-8">
				<Button
					text={buttonText}
					isLightVersion={true}
					className="text-xs sm:text-base md:text-4xl !bg-pink"
				/>
			</div>
		</form>
	);
}
