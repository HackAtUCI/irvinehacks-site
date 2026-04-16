"use client";

import { useState } from "react";
import { Status } from "@/lib/userRecord";
import useUserIdentity from "@/lib/utils/useUserIdentity";
import Button from "@/lib/components/Button/Button";
import ControlledDropdownSelect from "@/lib/components/forms/ControlledDropdownSelect";
import useArrivalTime from "@/lib/utils/useArrivalTime";

// Arrival times for accepted applicants (late check-in starts at 6:00 PM)
const ACCEPTED_ARRIVAL_TIMES = [
	{ value: "18:00", text: "6:00 PM" },
	{ value: "18:30", text: "6:30 PM" },
	{ value: "19:00", text: "7:00 PM" },
	{ value: "19:30", text: "7:30 PM" },
];

// Arrival times for waitlist applicants (late check-in starts at 7:00 PM)
const WAITLIST_ARRIVAL_TIMES = [
	{ value: "19:00", text: "7:00 PM" },
	{ value: "19:30", text: "7:30 PM" },
	{ value: "20:00", text: "8:00 PM" },
	{ value: "20:30", text: "8:30 PM" },
];

interface LateArrivalFormProps {
	status?: Status;
}

export default function LateArrivalForm({ status }: LateArrivalFormProps) {
	const identity = useUserIdentity();
	const isWaitlisted =
		status === Status.Waitlisted || identity?.decision === Status.Waitlisted;

	const arrivalTimes = isWaitlisted
		? WAITLIST_ARRIVAL_TIMES
		: ACCEPTED_ARRIVAL_TIMES;

	const [arrivalTime, setArrivalTime] = useState<string>(
		isWaitlisted ? "19:00" : "18:00",
	);
	const arrivalData = useArrivalTime();
	const currentArrivalTimeLabel = arrivalTimes.find(
		(t) => t.value === arrivalData?.arrival_time,
	)?.text;

	const defaultArrivalTime = isWaitlisted ? "18:00" : "17:00";
	const selectedLateTime = arrivalData?.arrival_time !== defaultArrivalTime;

	return (
		<div className="mt-2 md:mt-8">
			{!selectedLateTime && (
				<h3 className="font-bold font-display mb-[9px] md:mb-[20px] text-[0.9375rem] sm:text-2xl md:text-[2.5rem] md:leading-10 text-[var(--color-white)]">
					Update Your Arrival Time
				</h3>
			)}

			<p className="text-white text-lg mb-4">
				Current selected arrival time:{" "}
				<strong>
					{selectedLateTime ? currentArrivalTimeLabel : isWaitlisted ? "6:00 PM" : "5:00 PM"}
				</strong>
				<br />
				<br />
				Check-in starts Friday at {isWaitlisted ? "6 PM" : "5 PM"}. Late check-in begins at {isWaitlisted ? "7 PM" : "6 PM"}.
				{!selectedLateTime && (
					<>
						<br />
						<br />
						If you are arriving later than {isWaitlisted ? "6 PM" : "5 PM"}, use the dropdown to change your
						arrival time. You won&apos;t be able to edit it after submitting.
						Arriving later than your selected time may result in your spot being
						given to another attendee.
					</>
				)}
			</p>

			{!selectedLateTime && (
				<form
					method="post"
					action="/api/user/rsvp/late-arrival"
					className="space-y-4"
				>
					<ControlledDropdownSelect
						name="arrival_time"
						labelText=""
						values={arrivalTimes}
						containerClass="flex flex-col w-full max-w-md text-[var(--color-white)]"
						value={arrivalTime}
						onChange={setArrivalTime}
						required={true}
					/>

					<div className="mt-2 md:mt-8">
						<Button
							text="Save arrival time"
							isLightVersion={true}
							className="text-xs sm:text-base md:text-4xl !bg-pink"
						/>
					</div>
				</form>
			)}
		</div>
	);
}
