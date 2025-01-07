"use client";

import { useRouter } from "next/navigation";

import { useContext } from "react";

import Box from "@cloudscape-design/components/box";
import Cards from "@cloudscape-design/components/cards";
import Header from "@cloudscape-design/components/header";

import OrganizerInput from "./OrganizerInput";
import useOrganizers, { Organizer } from "@/lib/admin/useOrganizers";
import UserContext from "@/lib/admin/UserContext";
import { isDirector } from "@/lib/admin/authorization";

function Directors() {
	const router = useRouter();

	const { roles } = useContext(UserContext);

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	const { organizerList, loading } = useOrganizers();

	const counter = `(${organizerList.length})`;

	const emptyContent = (
		<Box textAlign="center" color="inherit">
			No Organizers
		</Box>
	);

	return (
		<Cards
			cardDefinition={{
				header: CardHeader,
				sections: [
					{
						id: "uid",
						header: "UID",
						content: ({ _id }) => _id,
					},
					{
						id: "roles",
						header: "Roles",
						content: ({ roles }) => roles.join(", "),
					},
				],
			}}
			loading={loading}
			loadingText="Loading applicants"
			items={organizerList}
			trackBy="_id"
			variant="full-page"
			empty={emptyContent}
			header={
				<Header counter={counter} actions={<OrganizerInput />}>
					Organizers
				</Header>
			}
		/>
	);
}

const CardHeader = ({ first_name, last_name }: Organizer) => {
	return (
		<span>
			{first_name} {last_name}
		</span>
	);
};

export default Directors;
