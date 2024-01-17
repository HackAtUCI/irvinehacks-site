import { PortalStatus } from "./ApplicantPortal";
import Button from "@/lib/components/Button/Button";

interface ConfirmAttendanceProps {
	status: PortalStatus;
}

function ConfirmAttendance({ status }: ConfirmAttendanceProps) {
	const buttonText =
		status === PortalStatus.confirmed
			? "I am no longer able to attend IrvineHacks 2024"
			: "I will be attending IrvineHacks 2024";

	return (
		<div className="mt-4">
			<hr />
			<h3 className="text-3xl my-4">RSVP</h3>
			{status === PortalStatus.confirmed ? (
				<p>
					Thank you for confirming your attendance. We look forward to seeing
					you at the event!
				</p>
			) : (
				<p>
					If you plan on attending IrvineHacks 2024, please confirm your
					attendance below!
				</p>
			)}
			<form method="post" action="/api/user/rsvp">
				<Button className="text-color-red" text={buttonText} />
			</form>
		</div>
	);
}

export default ConfirmAttendance;
