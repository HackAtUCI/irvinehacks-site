import React, { useMemo } from "react";
import {
	SpaceBetween,
	Slider,
	Box,
	Select,
	SelectProps,
} from "@cloudscape-design/components";
import ResponseSection from "./ResponseSection";

interface ScoreSectionProps {
	title: string;
	useDropdown?: boolean;
	// Slider configuration
	min?: number;
	max?: number;
	step?: number;
	// Dropdown configuration
	options?: SelectProps.Option[];
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

	return (
		<ResponseSection
			title={title}
			leftColumn={leftColumn}
			rightColumn={rightColumn}
			wordLimit={wordLimit}
		>
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
		</ResponseSection>
	);
}
