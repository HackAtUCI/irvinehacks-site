"use client";

import { useRouter } from "next/navigation";
import { useContext, useState, useEffect } from "react";

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

import { useQueuePullTimer } from "./components/useQueuePullTimer";
import QueuePullStopwatch from "./components/QueuePullStopwatch";
import { useCheckinEventLog } from "./components/useCheckinEventLog";
import CheckinActivityLog from "./components/CheckinActivityLog";
import RefreshSummaryButton from "./components/RefreshSummaryButton";

function CheckInLeads() {
	const router = useRouter();
	const { roles } = useContext(UserContext);

	const [selectedAction, setSelectedAction] =
		useState<SelectProps.Option | null>(null);

	const { handleUpdate, isLoading, message, setMessage } = useCheckInAction();
	const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);

	const { markPulled } = useQueuePullTimer();
	const { log } = useCheckinEventLog();

	const onUpdate = async () => {
		if (!selectedAction) return;
		const action = selectedAction;
		await handleUpdate(selectedAction);
		log(action.label ?? "Unknown action");
		if (action.value === "get-next-batch") {
			markPulled();
		}
		setSelectedAction(null);
	};

	useEffect(() => {
		if (!isCheckInLead(roles)) {
			router.push("/admin/dashboard");
		}
	}, [roles]);

	return (
		<ContentLayout>
			<SpaceBetween size="l">
				<HackerCount />
				{isCheckInLead(roles) && (
					<Grid gridDefinition={[{ colspan: 7 }, { colspan: 5 }]}>
						<SpaceBetween size="s">
							<RefreshSummaryButton
								onRefresh={() => setSummaryRefreshKey((k) => k + 1)}
							/>
							<ApplicantSummary key={summaryRefreshKey} />
						</SpaceBetween>
						<SpaceBetween size="l">
							<StatusUpdateContainer
								selectedAction={selectedAction}
								onActionChange={setSelectedAction}
								onUpdate={onUpdate}
								isLoading={isLoading}
								message={message}
								onDismissMessage={() => setMessage(null)}
							/>
							<QueuePullStopwatch />
							<CheckinActivityLog />
						</SpaceBetween>
					</Grid>
				)}
			</SpaceBetween>
		</ContentLayout>
	);
}

export default CheckInLeads;
