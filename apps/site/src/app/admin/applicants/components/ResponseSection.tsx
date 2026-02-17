import React from "react";
import {
	Container,
	Header,
	SpaceBetween,
	Box,
	ColumnLayout,
} from "@cloudscape-design/components";

interface ResponseSectionProps {
	title: string;
	leftColumn: React.ReactNode;
	rightColumn: React.ReactNode;
	wordLimit?: number;
	children?: React.ReactNode;
}

export default function ResponseSection({
	title,
	leftColumn,
	rightColumn,
	wordLimit,
	children,
}: ResponseSectionProps) {
	const getWordCount = (node: React.ReactNode): number => {
		if (typeof node === "string") {
			return node.trim().split(/\s+/).filter(Boolean).length;
		}
		if (Array.isArray(node)) {
			return node.reduce((sum, child) => sum + getWordCount(child), 0);
		}
		if (React.isValidElement(node)) {
			return getWordCount(node.props.children);
		}
		return 0;
	};

	const wordCount = getWordCount(rightColumn);

	return (
		<Container header={<Header variant="h2">{title}</Header>}>
			<SpaceBetween size="l">
				<ColumnLayout columns={2} borders="vertical">
					<Box>
						<Header variant="h3">Scoring Guidelines</Header>
						{leftColumn}
					</Box>

					<Box>
						<Header variant="h3">Applicant Response</Header>
						{rightColumn}
						{wordLimit && (
							<p style={{ textAlign: "right" }}>
								({wordCount}/{wordLimit})
							</p>
						)}
					</Box>
				</ColumnLayout>

				{children}
			</SpaceBetween>
		</Container>
	);
}
