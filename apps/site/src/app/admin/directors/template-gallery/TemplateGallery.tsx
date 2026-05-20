"use client";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import axios from "axios";

import Cards from "@cloudscape-design/components/cards";
import Box from "@cloudscape-design/components/box";
import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import ButtonDropdown from "@cloudscape-design/components/button-dropdown";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

import UserContext from "@/lib/admin/UserContext";
import { isDirector } from "@/lib/admin/authorization";
import useTemplates, { Template } from "@/lib/admin/useTemplates";

const createCardHeaderFactory = (
	onDuplicate: (t: Template) => void,
	onRename: (t: Template) => void,
	onDelete: (t: Template) => void,
) =>
	function TemplateCardHeader(template: Template) {
		return (
			<TemplateCardHeader
				template={template}
				onDuplicate={() => onDuplicate(template)}
				onRename={() => onRename(template)}
				onDelete={() => onDelete(template)}
			/>
		);
	};

function TemplateGallery() {
	const router = useRouter();
	const { roles } = useContext(UserContext);

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	const { templateList, loading, mutate } = useTemplates();
	const [renamingTemplate, setRenamingTemplate] = useState<Template | null>(
		null,
	);
	const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(
		null,
	);

	async function handleCreate() {
		router.push("/admin/directors/template-management/new");
	}

	async function handleDelete(template: Template) {
		await axios.post("/api/director/delete-template", {
			old_template_name: template.name,
		});
		await mutate();
	}

	async function handleRename(template: Template) {
		const newName = prompt("New template name:", template.name);
		if (!newName || newName === template.name) return;

		await axios.post("/api/director/rename-template", {
			old_template_name: template.name,
			new_template_name: newName,
		});
		await mutate();
	}

	async function handleDuplicate(template: Template) {
		await axios.post("/api/director/duplicate-template", {
			template_name: template.name,
		});
		await mutate();
	}

	const emptyContent = (
		<Box textAlign="center" color="inherit">
			No templates created.
		</Box>
	);

	return (
		<Cards
			cardDefinition={{
				header: createCardHeaderFactory(
					handleDuplicate,
					handleRename,
					handleDelete,
				),
				sections: [
					{
						id: "dates",
						header: "Dates",
						content: ({ startDate, endDate }) =>
							`${formatDate(startDate)} - ${formatDate(endDate)}`,
					},
				],
			}}
			loading={loading}
			loadingText="Loading templates"
			items={templateList}
			trackBy="_id"
			variant="full-page"
			empty={emptyContent}
			header={
				<Header
					counter={`(${templateList.length})`}
					actions={
						<Button
							iconName="add-plus"
							variant="primary"
							onClick={handleCreate}
						>
							New Template
						</Button>
					}
				>
					Template Gallery
				</Header>
			}
		/>
	);
}

interface CardHeaderProps {
	template: Template;
	onDuplicate: () => void;
	onRename: () => void;
	onDelete: () => void;
}

function TemplateCardHeader({
	template,
	onDuplicate,
	onRename,
	onDelete,
}: CardHeaderProps) {
	const router = useRouter();

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				width: "100%",
			}}
		>
			<SpaceBetween direction="horizontal" size="xs" alignItems="center">
				<span
					style={{ cursor: "pointer", fontWeight: 600 }}
					onClick={() =>
						router.push(`/admin/template-management/${template.name}`)
					}
				>
					{template.name}
				</span>
				{template.isPublished && (
					<StatusIndicator type="success">Published</StatusIndicator>
				)}
			</SpaceBetween>

			<ButtonDropdown
				variant="icon"
				ariaLabel="Template actions"
				items={[
					{ id: "duplicate", text: "Duplicate" },
					{ id: "rename", text: "Rename" },
					{ id: "delete", text: "Delete", disabled: template.isPublished },
				]}
				onItemClick={({ detail }) => {
					if (detail.id === "duplicate") onDuplicate();
					if (detail.id === "rename") onRename();
					if (detail.id === "delete") onDelete();
				}}
			/>
		</div>
	);
}

function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

export default TemplateGallery;
