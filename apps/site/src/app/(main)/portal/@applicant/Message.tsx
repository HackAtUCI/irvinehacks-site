import { PortalStatus } from "./ApplicantPortal";

interface MessageProps {
	status: PortalStatus;
}

function Message({ status }: MessageProps) {
	const submittedMessage = (
		<p>
			Thank you for submitting your application! We are currently reviewing
			applications on a rolling basis, and you will hear back from us soon!
		</p>
	);

	const messages: Record<PortalStatus, JSX.Element> = {
		[PortalStatus.pending]: submittedMessage,
		[PortalStatus.reviewed]: submittedMessage,
		[PortalStatus.rejected]: (
			<p>
				Thank you for applying to IrvineHacks this year. We have read through
				many applications so far, and unfortunately are unable to offer you a
				spot at our event. We highly encourage you to continue developing your
				skills and passion for technology. We would love to see you apply again
				next year!
			</p>
		),
		[PortalStatus.waitlisted]: (
			<p>
				Thank you for applying to IrvineHacks this year. We have read through
				many applications so far, and are able to offer you a spot on the event
				waitlist. Please check your email for more info about the waitlist and
				waitlist walk-ins!
			</p>
		),
		[PortalStatus.accepted]: (
			<p>
				Congratulations on your acceptance to IrvineHacks 2025! Please look for
				an email confirming your acceptance. It is crucial that you read through
				all additional info in your confirmation email.
			</p>
		),
		[PortalStatus.waived]: <p>Thank you for signing the waiver!</p>,
		[PortalStatus.confirmed]: <></>,
		[PortalStatus.attending]: <></>,
		[PortalStatus.void]: (
			<p>
				Unfortunately, you are not able to RSVP for IrvineHacks at this time and
				will not be able to come to the event. However, we would love to see you
				apply again next year!
			</p>
		),
	};

	return (
		<div className="mt-4 font-body text-[var(--color-white)] text-xs sm:text-base md:text-2xl">
			{messages[status]}
		</div>
	);
}

export default Message;
