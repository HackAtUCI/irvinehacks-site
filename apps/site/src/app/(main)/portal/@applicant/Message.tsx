import { PortalStatus } from "./ApplicantPortal";

interface MessageProps {
	status: PortalStatus;
}

function Message({ status }: MessageProps) {
	const submittedMessage = (
		<p>
			Thank you for submitting your application! We are currently
			reviewing applications on a rolling basis, and you will hear back
			from us soon!
		</p>
	);

	const messages: Record<PortalStatus, JSX.Element> = {
		[PortalStatus.pending]: submittedMessage,
		[PortalStatus.reviewed]: submittedMessage,
		[PortalStatus.rejected]: (
			<p>
				Thank you for applying to IrvineHacks this year. We have read
				through many applications so far, and unfortunately are unable
				to offer you a spot at our event. We highly encourage you to
				continue developing your skills and passion for technology. We
				would love to see you apply again next year!
			</p>
		),
		[PortalStatus.waitlisted]: <></>,
		[PortalStatus.accepted]: <></>,
		[PortalStatus.confirmed]: <></>,
	};

	return <div>{messages[status]}</div>;
}

export default Message;
