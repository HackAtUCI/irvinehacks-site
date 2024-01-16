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
				waitlist. Once a spot for IrvineHacks opens up, we will contact you via
				email to confirm.
			</p>
		),
		[PortalStatus.accepted]: (
			<p>
				Congratulations on your acceptance to IrvineHacks 2024! Please look for
				an email confirming your acceptance. It is crucial that you read through
				all additional info in your confirmation email. We look forward to
				seeing you at IrvineHacks!
			</p>
		),
		[PortalStatus.waived]: (
			<>
				Thank you for signing the waiver! We look forward to seeing you at the
				event!
			</>
		),
		[PortalStatus.confirmed]: <></>,
	};

	return <div>{messages[status]}</div>;
}

export default Message;
