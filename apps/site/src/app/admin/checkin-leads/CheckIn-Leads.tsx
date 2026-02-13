"use client";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

import ContentLayout from "@cloudscape-design/components/content-layout";
import Grid from "@cloudscape-design/components/grid";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { SelectProps } from "@cloudscape-design/components/select";

import { isCheckInLead } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";

import ApplicantSummary from "../dashboard/components/ApplicantSummary";
import HackerCount from "../dashboard/components/HackerCount";
import StatusUpdateContainer from "./components/StatusUpdateContainer";
import { useCheckInAction } from "./components/useCheckInAction";

function CheckInLeads() {
	const router = useRouter();
	const { roles } = useContext(UserContext);

	const [selectedAction, setSelectedAction] =
		useState<SelectProps.Option | null>(null);
	const { handleUpdate, loading, message, setMessage } = useCheckInAction();

	if (!isCheckInLead(roles)) {
		router.push("/admin/dashboard");
	}

	const onUpdate = async () => {
		if (!selectedAction) return;
		await handleUpdate(selectedAction);
		setSelectedAction(null);
	};

	return (
		<ContentLayout>
			<SpaceBetween size="l">
				<HackerCount />
				{isCheckInLead(roles) && (
					<Grid gridDefinition={[{ colspan: 7 }, { colspan: 5 }]}>
						<ApplicantSummary />
						<StatusUpdateContainer
							selectedAction={selectedAction}
							onActionChange={setSelectedAction}
							onUpdate={onUpdate}
							loading={loading}
							message={message}
							onDismissMessage={() => setMessage(null)}
						/>
					</Grid>
				)}
			</SpaceBetween>
		</ContentLayout>
	);
}

export default CheckInLeads;
