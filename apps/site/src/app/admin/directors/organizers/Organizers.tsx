"use client";

import { useRouter } from "next/navigation";

import { useContext, useState } from "react";

import axios from "axios";
import Cards from "@cloudscape-design/components/cards";
import Box from "@cloudscape-design/components/box";
import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";

import ConfirmationModal from "../email-sender/components/ConfirmationModal";
import EditOrganizerModal from "./EditOrganizerModal";
import UserContext from "@/lib/admin/UserContext";
import { isDirector } from "@/lib/admin/authorization";

import AddOrganizer from "./AddOrganizer";
import useOrganizers, { Organizer } from "@/lib/admin/useOrganizers";

const createCardHeaderFactory = (
	onEdit: (organizer: Organizer) => void,
	onRemove: (organizer: Organizer) => void,
) =>
	function OrganizerCardHeader(organizer: Organizer) {
		return (
			<CardHeader
				organizer={organizer}
				onEdit={() => onEdit(organizer)}
				onRemove={() => onRemove(organizer)}
			/>
		);
	};

function Organizers() {
	const router = useRouter();

	const { roles } = useContext(UserContext);

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	const { organizerList, loading, mutate } = useOrganizers();
	const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(
		null,
	);
	const [removingOrganizer, setRemovingOrganizer] = useState<Organizer | null>(
		null,
	);

	const counter = `(${organizerList.length})`;

	const emptyContent = (
		<Box textAlign="center" color="inherit">
			No Organizers
		</Box>
	);

	async function updateOrganizerRoles(uid: string, roles: string[]) {
		await axios.post("/api/director/update-organizers", { uid, roles });
	}

	async function deleteOrganizer(organizer: Organizer) {
		await axios.post("/api/director/delete-organizers", { uid: organizer._id });
	}

	return (
		<>
			<Cards
				cardDefinition={{
					header: createCardHeaderFactory(
						setEditingOrganizer,
						setRemovingOrganizer,
					),
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
					<Header counter={counter} actions={<AddOrganizer />}>
						Organizers
					</Header>
				}
			/>

			<EditOrganizerModal
				organizer={editingOrganizer}
				onDismissAction={() => setEditingOrganizer(null)}
				onConfirmAction={async (roles) => {
					if (!editingOrganizer) {
						return;
					}
					await updateOrganizerRoles(editingOrganizer._id, roles);
					await mutate();
					setEditingOrganizer(null);
				}}
			/>

			<ConfirmationModal
				buttonText="Remove roles"
				modalText={`Remove all admin roles for ${removingOrganizer?.first_name} ${removingOrganizer?.last_name}?`}
				onConfirm={async () => {
					if (!removingOrganizer) {
						return;
					}

					await deleteOrganizer(removingOrganizer);
					await mutate();
					setRemovingOrganizer(null);
				}}
				visible={removingOrganizer !== null}
				setVisible={(visible) => {
					if (!visible) {
						setRemovingOrganizer(null);
					}
				}}
			/>
		</>
	);
}

interface CardHeaderProps {
	organizer: Organizer;
	onEdit: () => void;
	onRemove: () => void;
}

const CardHeader = ({ organizer, onEdit, onRemove }: CardHeaderProps) => {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				width: "100%",
			}}
		>
			<span>
				{organizer.first_name} {organizer.last_name}
			</span>
			<SpaceBetween direction="horizontal" size="xs">
				<Button
					iconName="edit"
					variant="icon"
					ariaLabel={`Edit roles for ${organizer.first_name} ${organizer.last_name}`}
					onClick={onEdit}
				/>
				<Button
					iconName="remove"
					variant="icon"
					ariaLabel={`Remove roles from ${organizer.first_name} ${organizer.last_name}`}
					onClick={onRemove}
				/>
			</SpaceBetween>
		</div>
	);
};

export default Organizers;
