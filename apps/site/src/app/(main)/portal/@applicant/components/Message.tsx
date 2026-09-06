import { PostAcceptedStatus, Status } from "@/lib/userRecord";

interface MessageProps {
	status: Status;
	waitlistStarted: boolean;
}

function Message({ status, waitlistStarted }: MessageProps) {
	let message: JSX.Element = <></>;

	switch (status) {
		case Status.Rejected: {
			message = (
				<p className="mb-0">
					Thank you for applying to IrvineHacks this year. We have read through
					many applications so far, and unfortunately are unable to offer you a
					spot at our event. We highly encourage you to continue developing your
					skills and passion for technology. We would love to see you apply
					again next year!
				</p>
			);
			break;
		}
		case Status.Voided: {
			message = (
				<p className="mb-0">
					Thank you for applying to IrvineHacks this year. Your application has
					been voided and is no longer being considered for this year&apos;s
					event. We would love to see you apply again next year!
				</p>
			);
			break;
		}
		case Status.Confirmed: {
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
			break;
		}
		case Status.Waitlisted: {
			message = waitlistStarted ? (
				<p className="mb-0">
					At this moment, the waitlist has closed. However, you can show up
					in-person to the Waitlist Queue on{" "}
					<strong className="underline">Friday, 2/27 at 5:30 p.m. PST</strong>.
					<br />
					<br />
					Note that check-in will start on{" "}
					<strong className="underline">
						Friday, 2/27 at 6:00 p.m. PST
					</strong>{" "}
					and will be on first-come first-served basis depending on venue
					capacity.
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
					for when our waitlist opens. Please check your email for more info
					about the waitlist and waitlist walk-ins!
				</p>
			);
			break;
		}
		case Status.Pending:
		case Status.Reviewed: {
			message = (
				<p className="mb-0">
					Thank you for submitting your application! We are currently reviewing
					applications on a rolling basis, and you will hear back from us soon!
				</p>
			);
			break;
		}
		case Status.Accepted:
		case Status.Signed:
		case Status.Attending:
		case PostAcceptedStatus.Queued: {
			message = <></>;
			break;
		}

		default: {
			const exhaustiveCheck: never = status;
			throw new Error(`Unhandled status: ${exhaustiveCheck}`);
		}
	}

	const showMessage = (
		[
			Status.Pending,
			Status.Reviewed,
			Status.Waitlisted,
			Status.Confirmed,
			Status.Rejected,
			Status.Voided,
		] as Status[]
	).includes(status);

	return (
		showMessage && (
			<div className="bg-black border-4 border-white rounded-xl mt-10 font-body text-[var(--color-white)] text-xs sm:text-base md:text-2xl p-6 md:p-10">
				{message}
			</div>
		)
	);
}

export default Message;
