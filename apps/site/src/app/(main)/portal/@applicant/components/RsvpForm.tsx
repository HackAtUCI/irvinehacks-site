"use client";

import { useState } from "react";
import Button from "@/lib/components/Button/Button";
import ControlledDropdownSelect from "@/lib/components/forms/ControlledDropdownSelect";

interface RsvpFormProps {
	buttonText: string;
	showWarning: boolean;
}

const LATE_ARRIVAL_MIN = "18:00";
const LATE_ARRIVAL_MAX = "19:30";

export default function RsvpForm({ buttonText, showWarning }: RsvpFormProps) {
	const [comingLateChoice, setComingLateChoice] = useState<"" | "no" | "yes">(
		"",
	);
	const [arrivalTime, setArrivalTime] = useState<string>(LATE_ARRIVAL_MIN);

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
				labelText="Check-in starts at 5:00 PM on Friday. Will you be arriving later than 5:00 PM?"
				values={[
					{ value: "", text: "Select an option" },
					{ value: "no", text: "No, I'll be there by 5:00 PM" },
					{ value: "yes", text: "Yes" },
				]}
				containerClass="flex flex-col w-full text-[var(--color-white)]"
				value={comingLateChoice}
				onChange={(v) => setComingLateChoice(v as "" | "no" | "yes")}
			/>

			{comingLate && (
				<div className="flex flex-col w-full text-[var(--color-white)]">
					<label className="text-lg mb-2" htmlFor="arrival_time">
						Late Check-in starts at 6:00 PM on Friday. Choose your expected
						arrival time (between 6:00 PM and 7:30 PM).
					</label>
					<input
						id="arrival_time"
						name="arrival_time"
						type="time"
						min={LATE_ARRIVAL_MIN}
						max={LATE_ARRIVAL_MAX}
						value={arrivalTime}
						onChange={(e) => setArrivalTime(e.target.value)}
						required
						className="bg-[#e1e1e1] text-[var(--color-black)] text-lg h-10 p-1.5 rounded-md"
					/>
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
