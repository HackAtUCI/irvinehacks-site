"use client";

import { useState, useMemo, useContext } from "react";
import axios from "axios";
import {
	Badge,
	Box,
	Button,
	FlashbarProps,
	Header,
	Modal,
	SpaceBetween,
	Table,
} from "@cloudscape-design/components";

import NotificationContext from "@/lib/admin/NotificationContext";
import useHackerApplicants from "@/lib/admin/useHackerApplicants";
import { Decision } from "@/lib/userRecord";
import ExcludeUIDsModal from "./ExcludeUIDsModal";
import downloadScoresCSV from "./downloadScoresCSV";
import { ScoreRow, buildScoreRows, formatScore } from "./scoreRows";

const ResumeModalButton = (item: ScoreRow) => {
	const [showResume, setShowResume] = useState(false);

	return (
		<>
			<div style={{ display: "flex", gap: "0.5rem" }}>
				<Button onClick={() => setShowResume(true)}>View Resume</Button>
				<Button
					variant="link"
					onClick={() =>
						window.open(item.resumeUrl || "", "_blank", "noopener,noreferrer")
					}
				>
					Open in New Tab
				</Button>
			</div>
			<Modal
				onDismiss={() => setShowResume(false)}
				visible={showResume}
				closeAriaLabel="Close modal"
				header="Resume"
				size="max"
			>
				<Box>
					<iframe
						src={`${item.resumeUrl || ""}/preview`}
						title="Resume"
						style={{ width: "100%", height: "80vh", border: 0 }}
					/>
				</Box>
			</Modal>
		</>
	);
};

interface NormalizeScoresResponse {
	matched_applicants: number;
	normalized_applicants: number;
	updated_applicants: number;
}

const NameCell = (item: ScoreRow) => item.name;

const LinkedInCell = (item: ScoreRow) =>
	item.linkedin ? (
		<Button variant="link" href={item.linkedin} target="_blank">
			LinkedIn
		</Button>
	) : (
		"-"
	);

const AverageNormalizedScoreCell = (item: ScoreRow) => {
	if (!item.specialScoreLabel) return formatScore(item.normalizedScore);

	return (
		<Badge color={item.decision === Decision.Accepted ? "green" : "red"}>
			{item.specialScoreLabel}
		</Badge>
	);
};

const COLUMNS = [
	{
		id: "index",
		header: "#",
		cell: (item: ScoreRow) => item.rowIndex,
		width: 40,
	},
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
		id: "major",
		header: "Major",
		cell: (item: ScoreRow) => item.major || "-",
	},
	{
		id: "linkedin",
		header: "LinkedIn",
		cell: LinkedInCell,
		minWidth: 150,
	},
	{
		id: "resume",
		header: "Resume",
		cell: ResumeModalButton,
		minWidth: 350,
	},
	{
		id: "avgScore",
		header: "Average Normalized Score",
		cell: AverageNormalizedScoreCell,
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
