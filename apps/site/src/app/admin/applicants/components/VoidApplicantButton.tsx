import { useContext, useState } from "react";

import Button from "@cloudscape-design/components/button";
import { FlashbarProps } from "@cloudscape-design/components/flashbar";

import ConfirmationModal from "@/app/admin/directors/email-sender/components/ConfirmationModal";
import { isDirector } from "@/lib/admin/authorization";
import NotificationContext from "@/lib/admin/NotificationContext";
import { voidApplicant } from "@/lib/admin/useApplicant";
import UserContext from "@/lib/admin/UserContext";
import { Decision, Status, Uid } from "@/lib/userRecord";

interface VoidApplicantButtonProps {
	uid: Uid;
	status: Status;
	onVoid: voidApplicant;
}

function VoidApplicantButton({
	uid,
	status,
	onVoid,
}: VoidApplicantButtonProps) {
	const { roles } = useContext(UserContext);
	const { setNotifications } = useContext(NotificationContext);
	const [visible, setVisible] = useState(false);

	if (!isDirector(roles)) {
		return null;
	}

	if (status === Decision.Voided) {
		return null;
	}

	const handleVoid = async () => {
		const id = `${Date.now()}`;
		try {
			await onVoid(uid);
			const successMessage: FlashbarProps.MessageDefinition = {
				type: "success",
				content: "Applicant voided.",
				id,
				dismissible: true,
				onDismiss: () => {
					if (setNotifications)
						setNotifications((prev) => prev.filter((msg) => msg.id !== id));
				},
			};
			if (setNotifications)
				setNotifications((prev) => [successMessage, ...prev]);
		} catch {
			const errorMessage: FlashbarProps.MessageDefinition = {
				type: "error",
				content: "Failed to void applicant.",
				id,
				dismissible: true,
				onDismiss: () => {
					if (setNotifications)
						setNotifications((prev) => prev.filter((msg) => msg.id !== id));
				},
			};
			if (setNotifications)
				setNotifications((prev) => [errorMessage, ...prev]);
		}
	};

	return (
		<>
			<Button iconName="status-negative" onClick={() => setVisible(true)}>
				Void Applicant
			</Button>
			<ConfirmationModal
				buttonText="Void Applicant"
				modalText="This action cannot be undone."
				visible={visible}
				setVisible={setVisible}
				onConfirm={handleVoid}
			/>
		</>
	);
}

export default VoidApplicantButton;
