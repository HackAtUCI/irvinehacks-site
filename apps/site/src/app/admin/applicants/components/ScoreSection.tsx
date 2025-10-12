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
}: ScoreSectionProps) {
	const defaultOptions: SelectProps.Option[] = useMemo(
		() => options ?? [],
		[options],
	);

	function getSelectedOption() {
		if (value === -1) return null;
		return defaultOptions.find((opt) => opt.value === String(value)) ?? null;
	}

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
							/>
						</SpaceBetween>
					)}
				</Box>
			</SpaceBetween>
		</Container>
	);
}
