import { PortalStatus } from "./ApplicantPortal";
import RsvpForm from "./RsvpForm";

interface ConfirmAttendanceProps {
	status: PortalStatus;
}

function ConfirmAttendance({ status }: ConfirmAttendanceProps) {
	const buttonText =
		status === PortalStatus.confirmed || status === PortalStatus.attending
			? "I am no longer able to attend IrvineHacks 2024"
			: "I will be attending IrvineHacks 2024";

	return (
		<div className="mt-4">
			<h3 className="text-3xl my-4">RSVP</h3>
			{status === PortalStatus.confirmed ||
			status === PortalStatus.attending ? (
				<>
					<p>
						Thank you for confirming your attendance! We look forward to seeing
						you at IrvineHacks! If you are no longer able to attend, please let
						us know using the button below.
					</p>
					{status === PortalStatus.attending && (
						<strong className="text-red-600 text-xl mb-3 w-full text-center inline-block">
							WARNING: After clicking the button below, you will{" "}
							<span className="underline">NOT</span> be able to RSVP again.
						</strong>
					)}
				</>
			) : (
				<p>
					If you plan on attending IrvineHacks 2024, please confirm your
					attendance using the button below!
				</p>
			)}
			<RsvpForm
				buttonText={buttonText}
				showWarning={status === PortalStatus.attending}
			/>
		</div>
	);
}

export default ConfirmAttendance;
