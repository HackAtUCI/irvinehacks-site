import { Status } from "@/lib/userRecord";
import LateArrivalForm from "./LateArrivalForm";
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
					{status === Status.Confirmed && <LateArrivalForm />}
				</>
			) : (
				<>
					<p className="text-xs sm:text-base md:text-2xl">
						If you plan on attending IrvineHacks 2026, please confirm your
						attendance using the button below!
					</p>
					<p className="text-xs sm:text-base md:text-2xl mt-4">
						Check-in defaults to 6:00 PM on Friday for everyone. If you will be
						arriving later than 6:00 PM, please change your expected arrival
						time below. All members of your team must check in in person on
						Friday, and at least one person from your team must check in in
						person for all 3 days.
					</p>
					<p className="text-xs sm:text-base md:text-2xl mt-4 text-[#FF4DEF]">
						If you do not check in by 6:00 PM or by the arrival time you
						specify, your spot may be given to another attendee.
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
