import { PostAcceptedStatus, Status } from "@/lib/userRecord";

interface MessageProps {
	status: Status;
}

function Message({ status }: MessageProps) {
	let message: JSX.Element;

	switch (status) {
		case Status.Pending:
		case Status.Reviewed: {
			message = (
				<p>
					Thank you for submitting your application! We are currently reviewing
					applications on a rolling basis, and you will hear back from us soon!
				</p>
			);
			break;
		}

		case Status.Rejected: {
			message = (
				<p className="mt-4">
					Thank you for applying to IrvineHacks this year. We have read through
					many applications so far, and unfortunately are unable to offer you a
					spot at our event. We highly encourage you to continue developing your
					skills and passion for technology. We would love to see you apply
					again next year!
				</p>
			);
			break;
		}

		case Status.Waitlisted: {
			message = (
				<p className="mt-4">
					Thank you for applying to IrvineHacks this year. We have read through
					many applications so far, and are able to offer you a spot on the
					event waitlist. Please check your email for more info about the
					waitlist and waitlist walk-ins!
				</p>
			);
			break;
		}

		case Status.Accepted:
		case Status.Signed:
		case Status.Confirmed:
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

	return (
		<div className="font-body text-[var(--color-white)] text-xs sm:text-base md:text-2xl pt-6 md:pt-10">
			{message}
		</div>
	);
}

export default Message;
