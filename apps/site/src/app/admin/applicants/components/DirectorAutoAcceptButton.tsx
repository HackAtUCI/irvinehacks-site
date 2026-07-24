"use client";

import { useContext, useState } from "react";
import Button from "@cloudscape-design/components/button";

import { isDirector } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";
import { Uid } from "@/lib/userRecord";

interface DirectorAutoAcceptButtonProps {
	applicant: Uid;
	autoDecisionReason: string | null | undefined;
	onAutoAccept: (uid: Uid) => Promise<void>;
	onUndoAutoAccept: (uid: Uid) => Promise<void>;
}

function DirectorAutoAcceptButton({
	applicant,
	autoDecisionReason,
	onAutoAccept,
	onUndoAutoAccept,
}: DirectorAutoAcceptButtonProps) {
	const { roles } = useContext(UserContext);
	const [loading, setLoading] = useState(false);

	if (!isDirector(roles)) {
		return null;
	}

	const isDirectorAutoAccepted = autoDecisionReason === "DIRECTOR_AUTO_ACCEPT";

	const handleClick = async () => {
		setLoading(true);
		try {
			if (isDirectorAutoAccepted) {
				await onUndoAutoAccept(applicant);
			} else {
				await onAutoAccept(applicant);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button onClick={handleClick} loading={loading}>
			{isDirectorAutoAccepted ? "Remove Auto Accept" : "Auto Accept"}
		</Button>
	);
}

export default DirectorAutoAcceptButton;
