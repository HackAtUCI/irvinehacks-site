"use client";

import { useState, useMemo, useContext } from "react";
import axios from "axios";
import {
	Box,
	Button,
	FlashbarProps,
	Header,
	Modal,
	SpaceBetween,
	Table,
} from "@cloudscape-design/components";

import NotificationContext from "@/lib/admin/NotificationContext";
import useHackerApplicants, {
	HackerApplicantSummary,
} from "@/lib/admin/useHackerApplicants";
import { OVERQUALIFIED_SCORE } from "@/lib/decisionScores";
import ExcludeUIDsModal from "./ExcludeUIDsModal";

function sortApplicantsByNormalizedScore(applicants: HackerApplicantSummary[]) {
	return applicants
		.map((applicant) => {
			const scores = applicant.application_data.normalized_scores;
			if (!scores || Object.keys(scores).length === 0)
				return { ...applicant, avgNormalizedScore: 0 };

			const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
			let avg = total / Object.keys(scores).length;
			if (applicant.application_data.extra_points)
				avg += applicant.application_data.extra_points;

			return { ...applicant, avgNormalizedScore: avg };
		})
		.sort((a, b) => b.avgNormalizedScore - a.avgNormalizedScore);
}

const downloadCSV = (
	data: (HackerApplicantSummary & {
		avgNormalizedScore: number;
		extraPoints?: number;
	})[],
) => {
	const headers = [
		"Name",
		"Email",
		"Major",
		"LinkedIn",
		"Resume URL",
		"Average Normalized Score",
		"Comments",
	];
	const rows = data.map((a) => {
		const comments = (a.application_data.reviews || [])
			.map((r) => (r[3] ? `${r[1]}: ${r[3]}` : ""))
			.filter(Boolean)
			.map((c) => c!.replace(/,/g, ".").replace(/[\r\n]+/g, " | "))
			.join("; ");

		return [
			`${a.first_name} ${a.last_name}`,
			a.application_data.email,
			a.application_data.major || "",
			a.application_data.linkedin || "",
			a.application_data.resume_url,
			a.avgNormalizedScore.toFixed(2),
			comments,
		];
	});

	const csvContent =
		"data:text/csv;charset=utf-8," +
		[headers, ...rows].map((e) => e.join(",")).join("\n");

	const encodedUri = encodeURI(csvContent);
	const link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "applicants.csv");
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

const ResumeModalButton = (
	item: HackerApplicantSummary & {
		avgNormalizedScore: number;
		extraPoints?: number;
	},
) => {
	const [showResume, setShowResume] = useState(false);

	return (
		<>
			<div style={{ display: "flex", gap: "0.5rem" }}>
				<Button onClick={() => setShowResume(true)}>View Resume</Button>
				<Button
					variant="link"
					onClick={() =>
						window.open(
							item.application_data.resume_url,
							"_blank",
							"noopener,noreferrer",
						)
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
						src={`${item.application_data.resume_url}/preview`}
						title="Resume"
						style={{ width: "100%", height: "80vh", border: 0 }}
					/>
				</Box>
			</Modal>
		</>
	);
};

interface ScoredHackerApplicant extends HackerApplicantSummary {
	avgNormalizedScore: number;
	rowIndex: number;
}

const NameCell = (item: ScoredHackerApplicant) =>
	`${item.first_name} ${item.last_name}`;

const LinkedInCell = (item: ScoredHackerApplicant) =>
	item.application_data.linkedin ? (
		<Button
			variant="link"
			href={item.application_data.linkedin}
			target="_blank"
		>
			LinkedIn
		</Button>
	) : (
		"-"
	);

const COLUMNS = [
	{
		id: "index",
		header: "#",
		cell: (item: ScoredHackerApplicant) => item.rowIndex,
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
		cell: (item: ScoredHackerApplicant) => item.application_data.email,
	},
	{
		id: "major",
		header: "Major",
		cell: (item: ScoredHackerApplicant) => item.application_data.major || "-",
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
		cell: (item: ScoredHackerApplicant) => item.avgNormalizedScore.toFixed(2),
	},
];

function Scores() {
	const { setNotifications } = useContext(NotificationContext);
	const { applicantList, loading, refetch } = useHackerApplicants();

	const [isExcludeModalVisible, setIsExcludeModalVisible] = useState(false);

	const filteredApplicants = useMemo(
		() => applicantList.filter((a) => a.avg_score !== OVERQUALIFIED_SCORE),
		[applicantList],
	);

	const sorted = sortApplicantsByNormalizedScore(filteredApplicants).map(
		(item, index) => ({
			...item,
			rowIndex: index + 1,
		}),
	);

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
			.get("/api/admin/normalize-detailed-scores")
			.then(() => {
				showNotification("success", "Successfully normalized scores!");
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
				items={sorted}
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
							<Button onClick={() => downloadCSV(sorted)}>Download CSV</Button>
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
