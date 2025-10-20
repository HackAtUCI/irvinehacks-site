import React, { useMemo } from "react";
import {
	Container,
	Header,
	SpaceBetween,
	Slider,
	Box,
	ColumnLayout,
	Select,
	SelectProps,
} from "@cloudscape-design/components";

interface ScoreSectionProps {
	title: string;
	useDropdown?: boolean;
	// Slider configuration
	min?: number;
	max?: number;
	step?: number;
	// Dropdown configuration
	options?: SelectProps.Option[];
	// Header override for Container header
	header?: React.ReactNode;
	// Custom column content
	leftColumn: React.ReactNode;
	rightColumn: React.ReactNode;
	// Controlled value and change handler
	value: number;
	onChange: (value: number) => void;
	disabled?: boolean;
	wordLimit?: number;
}

export default function ScoreSection({
	title,
	useDropdown = false,
	min = 0,
	max = 5,
	step = 1,
	options,
	leftColumn,
	rightColumn,
	value,
	onChange,
	disabled = false,
	wordLimit,
}: ScoreSectionProps) {
	const defaultOptions: SelectProps.Option[] = useMemo(
		() => options ?? [],
		[options],
	);

	function getSelectedOption() {
		if (value === -1) return null;
		return defaultOptions.find((opt) => opt.value === String(value)) ?? null;
	}
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
							<p style={{textAlign: "right"}}>
								({wordCount}/{wordLimit})
							</p>
						)}
					</Box>
				</ColumnLayout>

				{/* Scoring control */}
				<Box>
					{useDropdown ? (
						<SpaceBetween size="s">
							<Box fontWeight="bold">Select Score:</Box>
							<Select
								selectedOption={getSelectedOption()}
								onChange={({ detail }) => {
									const newVal = Number(detail.selectedOption?.value ?? -1);
									onChange(newVal);
								}}
								options={defaultOptions}
								selectedAriaLabel="Selected score"
								placeholder="Select a score"
								disabled={disabled}
							/>
						</SpaceBetween>
					) : (
						<SpaceBetween size="s">
							<Box fontWeight="bold">
								{value === -1 ? "Score: Not selected" : `Score: ${value}`}
							</Box>
							<Slider
								value={value === -1 ? min : value}
								onChange={({ detail }) => onChange(detail.value)}
								min={min}
								max={max}
								step={step}
								ariaLabel="Score slider"
								disabled={disabled}
							/>
						</SpaceBetween>
					)}
				</Box>
			</SpaceBetween>
		</Container>
	);
}
