"use client";

import HackerApplicantsList from "@/app/admin/applicants/components/HackerApplicantsList";

function HackerApplicants() {
	return (
		<HackerApplicantsList
			extraColumn={{
				id: "year",
				header: "Year",
				content: ({ application_data }) => application_data.school_year,
			}}
		/>
	);
}

export default HackerApplicants;
