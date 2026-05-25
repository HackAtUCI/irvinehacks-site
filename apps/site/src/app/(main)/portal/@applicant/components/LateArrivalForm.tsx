"use client";

import { FormEvent, useState } from "react";
import Button from "@/lib/components/Button/Button";
import useArrivalTime from "@/lib/utils/useArrivalTime";

const LATE_ARRIVAL_MIN = "18:00";
const LATE_ARRIVAL_MAX = "19:30";
const DEFAULT_CHECKIN_TIME = "17:00";

function formatTimeLabel(value: string): string {
	const [hours, minutes] = value.split(":");
	const date = new Date();
	date.setHours(Number(hours), Number(minutes));
	return date.toLocaleString("en-US", {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	});
}

export default function LateArrivalForm() {
	const [arrivalTime, setArrivalTime] = useState<string>(LATE_ARRIVAL_MIN);
	const [arrivalReason, setArrivalReason] = useState("");
	const [showLateArrivalFields, setShowLateArrivalFields] = useState(false);
	const [confirmedOnTimeArrival, setConfirmedOnTimeArrival] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { arrivalData, mutate } = useArrivalTime();

	const selectedLateTime =
		arrivalData?.arrival_time !== undefined &&
		arrivalData?.arrival_time !== null &&
		arrivalData.arrival_time !== DEFAULT_CHECKIN_TIME;

	const pendingRequest = arrivalData?.late_arrival_edit_request ?? null;

	const currentArrivalTimeLabel = arrivalData?.arrival_time
		? formatTimeLabel(arrivalData.arrival_time)
		: "5:00 PM";

	async function submitArrivalTime(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrorMessage("");

		if (arrivalTime < LATE_ARRIVAL_MIN || arrivalTime > LATE_ARRIVAL_MAX) {
			setErrorMessage("Please choose a time between 6:00 PM and 7:30 PM.");
			return;
		}

		const cleanedReason = arrivalReason.trim();
		if (!cleanedReason) {
			setErrorMessage("Please tell us why you are arriving late.");
			return;
		}

		if (isEditing && arrivalTime === arrivalData?.arrival_time) {
			setErrorMessage("Please choose a new arrival time before submitting.");
			return;
		}

		setIsSubmitting(true);
		try {
			const formData = new URLSearchParams({
				arrival_time: arrivalTime,
				late_arrival_reason: cleanedReason,
			});
			const response = await fetch("/api/user/rsvp/late-arrival", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: formData,
			});

			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(body?.detail ?? "We could not save your arrival time.");
			}

			if (isEditing) {
				await mutate({
					arrival_time: arrivalData?.arrival_time ?? DEFAULT_CHECKIN_TIME,
					late_arrival_reason: arrivalData?.late_arrival_reason ?? null,
					late_arrival_edit_request: arrivalTime,
					late_arrival_edit_reason: cleanedReason,
				});
				setIsEditing(false);
				setArrivalReason("");
			} else {
				await mutate({
					arrival_time: arrivalTime,
					late_arrival_reason: cleanedReason,
					late_arrival_edit_request: null,
					late_arrival_edit_reason: null,
				});
				setArrivalReason("");
			}
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: "We could not save your arrival time.",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="mt-2 md:mt-8">
			{!selectedLateTime && (
				<h3 className="font-bold font-display mb-[9px] md:mb-[20px] text-[0.9375rem] sm:text-2xl md:text-[2.5rem] md:leading-10 text-[var(--color-white)]">
					Update Your Arrival Time
				</h3>
			)}

			<p className="text-white text-lg mb-4">
				Current selected arrival time:{" "}
				<strong>{currentArrivalTimeLabel}</strong>
				<br />
				<br />
				Check-in starts Friday at 5 PM. Late check-in begins at 6 PM.
				{!selectedLateTime && (
					<>
						<br />
						<br />
						Arriving later than your selected time may result in your spot being
						given to another attendee.
					</>
				)}
			</p>

			{pendingRequest && !isEditing && (
				<p className="text-yellow-300 text-lg mb-4">
					Pending approval: <strong>{formatTimeLabel(pendingRequest)}</strong>
					{arrivalData?.late_arrival_edit_reason && (
						<>
							<br />
							Reason: <strong>{arrivalData.late_arrival_edit_reason}</strong>
						</>
					)}
					<br />
					Your edit request is awaiting approval.
				</p>
			)}

			{errorMessage && (
				<p className="text-yellow-300 text-lg mb-4" role="alert">
					{errorMessage}
				</p>
			)}

			{!selectedLateTime && !showLateArrivalFields && (
				<div className="space-y-4">
					<p className="text-white text-lg">Are you arriving after 5 PM?</p>
					<div className="flex flex-wrap gap-4 items-center">
						<button
							type="button"
							onClick={() => {
								setConfirmedOnTimeArrival(false);
								setShowLateArrivalFields(true);
								setErrorMessage("");
							}}
							className="bg-pink text-white text-base rounded-md px-4 py-2"
						>
							Yes
						</button>
						<button
							type="button"
							onClick={() => {
								setArrivalReason("");
								setConfirmedOnTimeArrival(true);
								setShowLateArrivalFields(false);
								setErrorMessage("");
							}}
							className="text-white underline text-lg"
						>
							No
						</button>
					</div>
					{confirmedOnTimeArrival && (
						<p className="text-white text-lg">
							Your arrival time will stay at <strong>5:00 PM</strong>.
						</p>
					)}
				</div>
			)}

			{!selectedLateTime && showLateArrivalFields && (
				<form
					method="post"
					action="/api/user/rsvp/late-arrival"
					onSubmit={submitArrivalTime}
					className="space-y-4"
				>
					<div className="flex flex-col w-full text-[var(--color-white)]">
						<label className="text-lg mb-2" htmlFor="arrival_time">
							Arrival time
						</label>
						<p className="text-white text-base mb-2">
							Choose a time between 6:00 PM and 7:30 PM.
						</p>
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

					<div className="flex flex-col w-full text-[var(--color-white)]">
						<label className="text-lg mb-2" htmlFor="late_arrival_reason">
							Reason
						</label>
						<textarea
							id="late_arrival_reason"
							name="late_arrival_reason"
							value={arrivalReason}
							onChange={(e) => setArrivalReason(e.target.value)}
							required
							maxLength={2048}
							rows={3}
							className="bg-[#e1e1e1] text-[var(--color-black)] text-lg p-1.5 rounded-md"
						/>
					</div>

					<div className="mt-2 md:mt-8">
						<Button
							text="Save arrival time"
							isLightVersion={true}
							disabled={isSubmitting}
							className="text-xs sm:text-base md:text-4xl !bg-pink"
						/>
						<button
							type="button"
							onClick={() => {
								setArrivalReason("");
								setShowLateArrivalFields(false);
								setErrorMessage("");
							}}
							className="text-white underline text-base ml-4"
						>
							Cancel
						</button>
					</div>
				</form>
			)}

			{selectedLateTime && !isEditing && (
				<button
					type="button"
					onClick={() => {
						setArrivalTime(arrivalData?.arrival_time ?? LATE_ARRIVAL_MIN);
						setArrivalReason("");
						setErrorMessage("");
						setIsEditing(true);
					}}
					className="text-white underline text-lg"
				>
					Request edit
				</button>
			)}

			{selectedLateTime && isEditing && (
				<form
					method="post"
					action="/api/user/rsvp/late-arrival"
					onSubmit={submitArrivalTime}
					className="space-y-4"
				>
					<div className="flex flex-col w-full max-w-md text-[var(--color-white)]">
						<label className="text-lg mb-2" htmlFor="arrival_time_edit">
							New arrival time
						</label>
						<input
							id="arrival_time_edit"
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

					<div className="flex flex-col w-full max-w-md text-[var(--color-white)]">
						<label className="text-lg mb-2" htmlFor="late_arrival_edit_reason">
							Reason
						</label>
						<textarea
							id="late_arrival_edit_reason"
							name="late_arrival_reason"
							value={arrivalReason}
							onChange={(e) => setArrivalReason(e.target.value)}
							required
							maxLength={2048}
							rows={3}
							className="bg-[#e1e1e1] text-[var(--color-black)] text-lg p-1.5 rounded-md"
						/>
					</div>

					<div className="mt-4 flex gap-4 items-center">
						<Button
							text="Submit request"
							isLightVersion={true}
							disabled={isSubmitting}
							className="!text-base !bg-pink"
						/>
						<button
							type="button"
							onClick={() => {
								setErrorMessage("");
								setArrivalReason("");
								setIsEditing(false);
							}}
							className="text-white underline text-base"
						>
							Cancel
						</button>
					</div>
				</form>
			)}
		</div>
	);
}
