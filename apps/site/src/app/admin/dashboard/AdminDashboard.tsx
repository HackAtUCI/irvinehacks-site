"use client";

import { useContext } from "react";

import ContentLayout from "@cloudscape-design/components/content-layout";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { isApplicationManager } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";

import ApplicantSummary from "./components/ApplicantSummary";
import ApplicantTable from "./components/ApplicantTable";
import HackerCount from "./components/HackerCount";

function AdminDashboard() {
	const { roles } = useContext(UserContext);

	return (
		<ContentLayout>
			<SpaceBetween size="l">
				<HackerCount />
				{isApplicationManager(roles) && <ApplicantSummary />}
				{isApplicationManager(roles) && <ApplicantTable />}
			</SpaceBetween>
		</ContentLayout>
	);
}

export default AdminDashboard;
