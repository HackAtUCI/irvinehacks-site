"use client";

import { useState } from "react";
import Button from "@/lib/components/Button/Button";
import ControlledDropdownSelect from "@/lib/components/forms/ControlledDropdownSelect";

interface RsvpFormProps {
	buttonText: string;
	showWarning: boolean;
}

// Only late options, 6:00 PM is default from first dropdown
const LATE_ARRIVAL_TIME_OPTIONS = [
	{ value: "18:30", label: "6:30 PM" },
	{ value: "19:00", label: "7:00 PM" },
	{ value: "19:30", label: "7:30 PM" },
] as const;

export default function RsvpForm({ buttonText, showWarning }: RsvpFormProps) {
	const [comingLateChoice, setComingLateChoice] = useState<"" | "no" | "yes">(
		"",
	);
	const [arrivalTime, setArrivalTime] = useState<string>("18:30");
	const comingLate = comingLateChoice === "yes";
	const confirmationMessage =
		"WARNING: You will not be able to RSVP again. Are you sure you want to continue?";

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
				labelText="Check-in defaults to 6:00 PM on Friday. Will you be arriving later than 6:00 PM?"
				values={[
					{ value: "", text: "Select an option" },
					{ value: "no", text: "No, I'll be there by 6:00 PM" },
					{ value: "yes", text: "Yes" },
				]}
				containerClass="flex flex-col w-full max-w-md text-[var(--color-white)]"
				value={comingLateChoice}
				onChange={(v) => setComingLateChoice(v as "" | "no" | "yes")}
			/>

			{comingLate && (
				<div className="flex flex-col w-full max-w-md text-[var(--color-white)]">
					<label className="text-lg mb-2" htmlFor="arrival_time">
						Expected time of arrival (Friday)
					</label>
					<select
						id="arrival_time"
						name="arrival_time"
						value={arrivalTime}
						onChange={(e) => setArrivalTime(e.target.value)}
						className="bg-[#e1e1e1] text-[var(--color-black)] text-lg h-10 p-1.5 rounded-md"
					>
						{LATE_ARRIVAL_TIME_OPTIONS.map(({ value, label }) => (
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
