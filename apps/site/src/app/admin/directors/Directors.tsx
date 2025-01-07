"use client";

import { useRouter } from "next/navigation";

import { useContext } from "react";

import Box from "@cloudscape-design/components/box";
import Cards from "@cloudscape-design/components/cards";
import Header from "@cloudscape-design/components/header";

import UserContext from "@/lib/admin/UserContext";
import { isDirector } from "@/lib/admin/authorization";

interface Organizer {
	_id: string;
	first_name: string;
	last_name: string;
	roles: ReadonlyArray<string>;
}

function Directors() {
	const router = useRouter();

	const { roles } = useContext(UserContext);

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	const items: Organizer[] = [
		{
			_id: "edu.uci.a",
			first_name: "alb",
			last_name: "wa",
			roles: ["Organizer", "Hacker Reviewer"],
		},
		{
			_id: "edu.uci.a",
			first_name: "alb",
			last_name: "wa",
			roles: ["Organizer", "Hacker Reviewer"],
		},
		{
			_id: "edu.uci.a",
			first_name: "alb",
			last_name: "wa",
			roles: ["Organizer", "Hacker Reviewer"],
		},
		{
			_id: "edu.uci.a",
			first_name: "alb",
			last_name: "wa",
			roles: ["Organizer", "Hacker Reviewer"],
		},
	];

	const counter = `(${items.length})`;

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
			// loading={loading}
			loadingText="Loading applicants"
			items={items}
			trackBy="_id"
			variant="full-page"
			empty={emptyContent}
			header={<Header counter={counter}>Organizers</Header>}
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
