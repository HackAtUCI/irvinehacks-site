"use client";

import { useContext, useEffect, useState } from "react";

import ContentLayout from "@cloudscape-design/components/content-layout";
import SegmentedControl from "@cloudscape-design/components/segmented-control";
import SpaceBetween from "@cloudscape-design/components/space-between";
import ExpandableSection from "@cloudscape-design/components/expandable-section";

import { isApplicationManager, isDirector } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";

import ApplicantSummary from "./components/ApplicantSummary";
import ApplicantTable from "./components/ApplicantTable";
import HackerCount from "./components/HackerCount";
import ReviewerSummary from "./components/ReviewerSummary";

type HackathonMode = "irvinehacks" | "zothacks";

const HACKATHON_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function getHackathonMode(): HackathonMode {
	const value = document.cookie
		.split("; ")
		.find((cookie) => cookie.startsWith("hackathon="))
		?.split("=")[1];

	return value === "zothacks" ? "zothacks" : "irvinehacks";
}

function AdminDashboard() {
	const { roles } = useContext(UserContext);
	const [hackathonMode, setHackathonMode] =
		useState<HackathonMode>("irvinehacks");

	useEffect(() => {
		setHackathonMode(getHackathonMode());
	}, []);

	const handleHackathonModeChange = (selectedId: string) => {
		const nextMode: HackathonMode =
			selectedId === "zothacks" ? "zothacks" : "irvinehacks";
		document.cookie = `hackathon=${nextMode}; path=/; max-age=${HACKATHON_COOKIE_MAX_AGE}`;
		setHackathonMode(nextMode);
		window.location.reload();
	};

	return (
		<ContentLayout>
			<SpaceBetween size="l">
				{isDirector(roles) && (
					<SegmentedControl
						selectedId={hackathonMode}
						label="Hackathon mode"
						options={[
							{ id: "irvinehacks", text: "IrvineHacks" },
							{ id: "zothacks", text: "ZotHacks" },
						]}
						onChange={({ detail }) =>
							handleHackathonModeChange(detail.selectedId)
						}
					/>
				)}
				<HackerCount />
				{isApplicationManager(roles) && <ApplicantSummary />}
				{isApplicationManager(roles) && (
					<ExpandableSection headerText="Applicant Table" defaultExpanded>
						<ApplicantTable />
					</ExpandableSection>
				)}

				{isApplicationManager(roles) && (
					<ExpandableSection headerText="Reviewer Summary" defaultExpanded>
						<ReviewerSummary />
					</ExpandableSection>
				)}
			</SpaceBetween>
		</ContentLayout>
	);
}

export default AdminDashboard;
