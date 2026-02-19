import { PostAcceptedStatus, Status, Decision } from "@/lib/userRecord";
import useWaitlistOpen from "@/lib/utils/useWaitlistOpen";

interface MessageProps {
	status: Status;
	decision: Decision;
}

function Message({ status, decision }: MessageProps) {
	const { waitlistStatus } = useWaitlistOpen();

	let message: JSX.Element = <></>;

	if (decision === Decision.Rejected) {
		message = (
			<p className="mb-0">
				Thank you for applying to IrvineHacks this year. We have read through
				many applications so far, and unfortunately are unable to offer you a
				spot at our event. We highly encourage you to continue developing your
				skills and passion for technology. We would love to see you apply again
				next year!
			</p>
		);
	} else if (status === Status.Confirmed) {
		message = (
			<p className="mb-0">
				Thanks for confirming your spot at IrvineHacks! Check-in will start on{" "}
				<strong className="underline">Friday, 2/27 at 5:00 p.m. PST</strong>.
				<br />
				<br />
				Make sure you queue in the{" "}
				<strong className="underline">
					General Check-in line and NOT the Waitlist Check-in line
				</strong>
				.
			</p>
		);
	} else if (decision === Decision.Accepted) {
		message = <></>;
	} else if (decision === Decision.Waitlisted || status === Status.Waitlisted) {
		message =
			waitlistStatus?.is_started && !waitlistStatus?.is_open ? (
				<p className="mb-0">
					At this moment, the waitlist has closed. However, you can show up
					in-person to the Waitlist Queue on{" "}
					<strong className="underline">
						Friday, 2/27 before 4:00 p.m. PST
					</strong>
					.<br />
					<br />
					Note that check-in will start on{" "}
					<strong className="underline">
						Friday, 2/27 at 5:00 p.m. PST
					</strong>{" "}
					and will be on first-come first-served basis depending on venue
					capacity.
				</p>
			) : waitlistStatus?.is_started && waitlistStatus?.is_open ? (
				<p className="mb-0">
					The waitlist is open! Please sign the waiver and RSVP below to claim
					your spot!
				</p>
			) : (
				<p className="mb-0">
					Thank you for applying to IrvineHacks this year. We have read through
					many applications so far, and are able to offer you access to the
					event waitlist.
					<br />
					<br />
					Check back to this page on{" "}
					<strong className="underline">
						Friday, 2/20 at 12:00 p.m. PST
					</strong>{" "}
					for when our waitlist opens. At that time, you will see an option here
					for RSVP. Clicking on that will grant you attendance to IrvineHacks as
					a Hacker. Please check your email for more info about the waitlist and
					waitlist walk-ins!
				</p>
			);
	} else {
		switch (status) {
			case Status.Rejected:
			case Status.Accepted:
			case Status.Signed:
			case Status.Attending:
			case PostAcceptedStatus.Queued: {
				message = <></>;
				break;
			}
			case Status.Pending:
			case Status.Reviewed: {
				message = (
					<p className="mb-0">
						Thank you for submitting your application! We are currently
						reviewing applications on a rolling basis, and you will hear back
						from us soon!
					</p>
				);
				break;
			}

			default: {
				const exhaustiveCheck: never = status;
				throw new Error(`Unhandled status: ${exhaustiveCheck}`);
			}
		}
	}

	const showMessage =
		(decision !== Decision.Accepted &&
			(
				[
					Status.Pending,
					Status.Reviewed,
					Status.Waitlisted,
					Status.Confirmed,
				] as Status[]
			).includes(status)) ||
		([Decision.Rejected] as Decision[]).includes(decision);

	return (
		showMessage && (
			<div className="bg-black border-4 border-white rounded-xl mt-10 font-body text-[var(--color-white)] text-xs sm:text-base md:text-2xl p-6 md:p-10">
				{message}
			</div>
		)
	);
}

export default Message;
