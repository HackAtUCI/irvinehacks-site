import { Sender } from "@/lib/admin/useEmailSenders";
import { Uid } from "@/lib/userRecord";

interface SendersProps {
	senders: ReadonlyArray<Sender>;
}

function Senders({ senders }: SendersProps) {
	if (senders.length === 0) {
		return <p>-</p>;
	}

	const formatUid = (uid: Uid) => uid.split(".").at(-1);
	const formatDate = (timestamp: string) =>
		new Date(timestamp).toLocaleDateString();
	return (
		<ul>
			{senders.map(([date, sender, numEmailsSent]) => (
				<li key={date}>
					{formatUid(sender)} sent {numEmailsSent} on {formatDate(date)}
				</li>
			))}
		</ul>
	);
}

export default Senders;
