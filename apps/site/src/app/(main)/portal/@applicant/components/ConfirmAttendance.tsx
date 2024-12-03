import { PortalStatus } from "../ApplicantPortal";
import RsvpForm from "./RsvpForm";

interface ConfirmAttendanceProps {
	status: PortalStatus;
}

function ConfirmAttendance({ status }: ConfirmAttendanceProps) {
	const buttonText =
		status === PortalStatus.confirmed || status === PortalStatus.attending
			? "I am no longer able to attend IrvineHacks 2025"
			: "I will be attending IrvineHacks 2025";

	return (
		<div className="mt-2 md:mt-8 text-[var(--color-white)]">
			<h3 className="font-bold font-display mb-[9px] md:mb-[20px] text-[15px] sm:text-2xl md:text-[40px] md:leading-10">
				RSVP
			</h3>
			{status === PortalStatus.confirmed ||
			status === PortalStatus.attending ? (
				<>
					<p className="text-xs sm:text-base md:text-2xl">
						Thank you for confirming your attendance! We look forward to seeing
						you at IrvineHacks! If you are no longer able to attend, please let
						us know using the button below.
					</p>
					{status === PortalStatus.attending && (
						<strong className="text-red-600 text-xs sm:text-base md:text-xl mb-3 w-full text-center inline-block">
							WARNING: After clicking the button below, you will{" "}
							<span className="underline">NOT</span> be able to RSVP again.
						</strong>
					)}
				</>
			) : (
				<p className="text-xs sm:text-base md:text-2xl">
					If you plan on attending IrvineHacks 2025, please confirm your
					attendance using the button below!
				</p>
			)}
			<div className="mt-2 md:mt-8">
				<RsvpForm
					buttonText={buttonText}
					showWarning={status === PortalStatus.attending}
				/>
			</div>
		</div>
	);
}

export default ConfirmAttendance;
