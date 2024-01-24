import Popover from "@cloudscape-design/components/popover";
import { PropsWithChildren, ReactNode } from "react";

interface ParticipantActionPopoverProps {
	content: string;
	children?: ReactNode;
}

function ParticipantActionPopover({
	content,
	children,
}: PropsWithChildren<ParticipantActionPopoverProps>) {
	return (
		<Popover
			dismissButton={false}
			position="top"
			size="medium"
			triggerType="custom"
			content={content}
		>
			{children}
		</Popover>
	);
}

export default ParticipantActionPopover;
