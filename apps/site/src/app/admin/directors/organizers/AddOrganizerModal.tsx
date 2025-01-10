import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";
import { RawOrganizer } from "./AddOrganizer";

interface AddOrganizerModalProps {
	onDismiss: () => void;
	onConfirm: (organizer: RawOrganizer | null) => void;
	organizer: RawOrganizer | null;
}

function AddOrganizerModal({
	onDismiss,
	onConfirm,
	organizer,
}: AddOrganizerModalProps) {
	if (organizer === null) {
		return <Modal visible={false} />;
	}

	return (
		<Modal
			onDismiss={onDismiss}
			visible={true}
			footer={
				<Box float="right">
					<SpaceBetween direction="horizontal" size="xs">
						<Button variant="link" onClick={onDismiss}>
							Cancel
						</Button>
						<Button variant="primary" onClick={() => onConfirm(organizer)}>
							Add Organizer
						</Button>
					</SpaceBetween>
				</Box>
			}
			header={`Add Organizer ${organizer.first_name} ${organizer.last_name} (${organizer.email})`}
		>
			<TextContent>
				<p>
					Double check that you have entered this organizer&apos;s info
					correctly
				</p>
				<ul>
					<li>Email: {organizer.email}</li>
					<li>First Name: {organizer.first_name}</li>
					<li>Last Name: {organizer.last_name}</li>
					<li>Newly Assigned Roles: {organizer.roles.join(", ")}</li>
				</ul>
			</TextContent>
		</Modal>
	);
}

export default AddOrganizerModal;
