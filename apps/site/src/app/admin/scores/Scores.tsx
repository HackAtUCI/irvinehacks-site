"use client";

import { useState, useMemo, useContext } from "react";
import axios from "axios";
import {
	Badge,
	Button,
	FlashbarProps,
	Header,
	SpaceBetween,
	Table,
} from "@cloudscape-design/components";
import { FileText } from "lucide-react";

import ApplicantStatus from "@/app/admin/applicants/components/ApplicantStatus";
import NotificationContext from "@/lib/admin/NotificationContext";
import useHackerApplicants from "@/lib/admin/useHackerApplicants";
import { Decision } from "@/lib/userRecord";
import ExcludeUIDsModal from "./ExcludeUIDsModal";
import ApplicantNameLink from "./components/ApplicantNameLink";
import IconLink from "./components/IconLink";
import LinkedInIcon from "./components/LinkedInIcon";
import downloadScoresCSV from "./downloadScoresCSV";
import { ScoreRow, buildScoreRows, formatScore } from "./scoreRows";

interface NormalizeScoresResponse {
	matched_applicants: number;
	normalized_applicants: number;
	updated_applicants: number;
}

const NameCell = (item: ScoreRow) => (
	<ApplicantNameLink id={item.id} name={item.name} />
);

const LinkedInCell = (item: ScoreRow) => (
	<IconLink url={item.linkedin} label="LinkedIn" icon={<LinkedInIcon />} />
);

const ResumeCell = (item: ScoreRow) => (
	<IconLink
		url={item.resumeUrl}
		label="Resume"
		icon={<FileText size={20} aria-hidden="true" />}
	/>
);

const NormalizedScoreCell = (item: ScoreRow) => {
	if (!item.specialScoreLabel) return formatScore(item.normalizedScore);

	return (
		<Badge color={item.decision === Decision.Accepted ? "green" : "red"}>
			{item.specialScoreLabel}
		</Badge>
	);
};

const DecisionCell = (item: ScoreRow) =>
	item.decision ? <ApplicantStatus status={item.decision} /> : "-";

const COLUMNS = [
	{
		id: "name",
		header: "Name",
		cell: NameCell,
	},
	{
		id: "email",
		header: "Email",
		cell: (item: ScoreRow) => item.email || "-",
	},
	{
		id: "rawScore",
		header: "Raw Score",
		cell: (item: ScoreRow) => formatScore(item.rawScore),
	},
	{
		id: "normalizedScore",
		header: "Normalized Score",
		cell: NormalizedScoreCell,
	},
	{
		id: "decision",
		header: "Decision",
		cell: DecisionCell,
	},
	{
		id: "linkedin",
		header: "LinkedIn",
		cell: LinkedInCell,
	},
	{
		id: "resume",
		header: "Resume",
		cell: ResumeCell,
	},
];

function Scores() {
	const { setNotifications } = useContext(NotificationContext);
	const { applicantList, loading, refetch } = useHackerApplicants();

	const [isExcludeModalVisible, setIsExcludeModalVisible] = useState(false);

	const rows = useMemo(() => buildScoreRows(applicantList), [applicantList]);

	const showNotification = (
		type: FlashbarProps.Type,
		content: string,
		id: string = `${Date.now()}`,
	) => {
		const message: FlashbarProps.MessageDefinition = {
			type,
			content,
			id,
			dismissible: true,
			onDismiss: () => {
				if (setNotifications)
					setNotifications((prev) =>
						prev.filter((msg) => msg.id !== message.id),
					);
			},
		};
		if (setNotifications) setNotifications((prev) => [message, ...prev]);
	};

	const handleClick = () => {
		axios
			.get<NormalizeScoresResponse>("/api/admin/normalize-detailed-scores")
			.then(({ data }) => {
				showNotification(
					"success",
					`Normalized ${data.normalized_applicants} applicants ` +
						`(${data.updated_applicants} updated, ` +
						`${data.matched_applicants} matched).`,
				);
				refetch();
			})
			.catch((error) => {
				showNotification("error", `Request failed: ${error.message}`);
			});
	};

	return (
		<SpaceBetween size="l">
			<Header variant="h1">Scores</Header>
			<Table
				loading={loading}
				columnDefinitions={COLUMNS}
				items={rows}
				trackBy="id"
				header={
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<h2>Applicants</h2>
						<div style={{ display: "flex", gap: "0.5rem" }}>
							<Button onClick={() => setIsExcludeModalVisible(true)}>
								Exclude UIDs (auto-reject/auto-accept)
							</Button>
							<Button onClick={() => downloadScoresCSV(rows)}>
								Download CSV
							</Button>
							<Button variant="primary" onClick={handleClick}>
								Normalize scores
							</Button>
						</div>
					</div>
				}
			/>
			<ExcludeUIDsModal
				visible={isExcludeModalVisible}
				onDismiss={() => setIsExcludeModalVisible(false)}
				onSuccess={() => {
					showNotification("success", "Successfully updated excluded UIDs!");
					refetch();
				}}
				onError={(err) => showNotification("error", err)}
			/>
		</SpaceBetween>
	);
}

export default Scores;
