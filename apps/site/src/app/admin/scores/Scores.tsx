"use client";

import useHackerApplicants, {
	HackerApplicantSummary,
} from "@/lib/admin/useHackerApplicants";
import {
	Box,
	Button,
	ColumnLayout,
	Container,
	Header,
	Modal,
	SpaceBetween,
	Table,
} from "@cloudscape-design/components";
import { useState } from "react";

function sortApplicantsByNormalizedScore(applicants: HackerApplicantSummary[]) {
	return applicants
		.map((applicant) => {
			const scores = applicant.application_data.normalized_scores;
			if (!scores || Object.keys(scores).length === 0)
				return { ...applicant, avgNormalizedScore: 0 };

			const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
			const avg = total / Object.keys(scores).length;

			return { ...applicant, avgNormalizedScore: avg };
		})
		.sort((a, b) => b.avgNormalizedScore - a.avgNormalizedScore);
}

const downloadCSV = (
	data: (HackerApplicantSummary & { avgNormalizedScore: number })[],
) => {
	const headers = ["Name", "Email", "Resume URL", "Average Normalized Score"];
	const rows = data.map((a) => [
		`${a.first_name} ${a.last_name}`,
		a.application_data.email,
		a.application_data.resume_url,
		a.avgNormalizedScore.toFixed(2),
	]);

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
	item: HackerApplicantSummary & { avgNormalizedScore: number },
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

function Scores() {
	const { applicantList, loading } = useHackerApplicants();
	const sorted = sortApplicantsByNormalizedScore(applicantList);

	return (
		<SpaceBetween size="l">
			<Header variant="h1">Scores</Header>
			<Table
				columnDefinitions={[
					{
						id: "name",
						header: "Name",
						cell: (item) => `${item.first_name} ${item.last_name}`,
					},
					{
						id: "email",
						header: "Email",
						cell: (item) => item.application_data.email,
					},
					{
						id: "resume",
						header: "Resume URL",
						cell: ResumeModalButton,
					},
					{
						id: "avgScore",
						header: "Average Normalized Score",
						cell: (item) => item.avgNormalizedScore.toFixed(2),
					},
				]}
				items={sorted.sort(
					(a, b) => b.avgNormalizedScore - a.avgNormalizedScore,
				)}
				header={
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<h2>Applicants</h2>
						<Button onClick={() => downloadCSV(sorted)}>Download CSV</Button>
					</div>
				}
			/>
		</SpaceBetween>
	);
}

export default Scores;
