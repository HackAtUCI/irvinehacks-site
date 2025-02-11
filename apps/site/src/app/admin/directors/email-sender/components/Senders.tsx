import TextContent from "@cloudscape-design/components/text-content";

import { Sender } from "@/lib/admin/useEmailSenders";
import { Uid } from "@/lib/userRecord";

interface SendersProps {
	senders: Sender[];
}

function Senders({ senders }: SendersProps) {
	if (senders.length === 0) {
		return <p>-</p>;
	}

	const formatUid = (uid: Uid) => uid.split(".").at(-1);
	const formatDate = (timestamp: string) => {
		const formatter = new Intl.DateTimeFormat("en-US", {
			dateStyle: "short",
			timeStyle: "short",
		});
		return formatter.format(new Date(timestamp));
	};

	return (
		<TextContent>
			<ul>
				{senders.map(([date, sender, numEmailsSent]) => (
					<li key={date}>
						{formatUid(sender)} sent {numEmailsSent} email(s) on{" "}
						{formatDate(date)}
					</li>
				))}
			</ul>
		</TextContent>
	);
}

export default Senders;
