import { Status } from "@/lib/userRecord";
import RsvpForm from "./RsvpForm";

interface ConfirmAttendanceProps {
	status: Status;
}

function ConfirmAttendance({ status }: ConfirmAttendanceProps) {
	const buttonText =
		status === Status.Confirmed || status === Status.Attending
			? "I am no longer able to attend IrvineHacks 2026"
			: "I will be attending IrvineHacks 2026";

	return (
		<div className="mt-2 md:mt-8 text-[var(--color-white)]">
			<h3 className="font-bold font-display mb-[9px] md:mb-[20px] text-[0.9375rem] sm:text-2xl md:text-[2.5rem] md:leading-10">
				RSVP
			</h3>
			{status === Status.Confirmed || status === Status.Attending ? (
				<>
					<p className="text-xs sm:text-base md:text-2xl">
						Thank you for confirming your attendance!
					</p>
					{/* <p className="text-xs sm:text-base md:text-2xl">
						Thank you for confirming your attendance! We look forward to seeing
						you at IrvineHacks! If you are no longer able to attend, please let
						us know using the button below.
					</p> */}
					{status === Status.Attending && (
						<strong className="text-red-600 text-xs sm:text-base md:text-xl mb-3 w-full text-center inline-block">
							WARNING: After clicking the button below, you will{" "}
							<span className="underline">NOT</span> be able to RSVP again.
						</strong>
					)}
				</>
			) : (
				<>
					<p className="text-xs sm:text-base md:text-2xl">
						If you plan on attending IrvineHacks 2026, please confirm your
						attendance using the button below!
					</p>
					<p className="text-xs sm:text-base md:text-2xl mt-4">
						If you plan on coming after your allotted check-in time on Friday,
						please fill in your expected time of arrival below. All members of
						your team must check in in person on Friday, and at least one person
						from your team must check in in person for all 3 days.
					</p>
				</>
			)}
			{status !== Status.Confirmed && status !== Status.Attending && (
				<div className="mt-2 md:mt-8">
					<RsvpForm buttonText={buttonText} showWarning={false} />
				</div>
			)}
		</div>
	);
}

export default ConfirmAttendance;
