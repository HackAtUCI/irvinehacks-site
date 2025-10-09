import React, { useMemo, useState } from "react";
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
	initialScore?: number;
	// Dropdown configuration
	options?: SelectProps.Option[];
	// Header override for Container header
	header?: React.ReactNode;
	// Custom column content
	leftColumn: React.ReactNode;
	rightColumn: React.ReactNode;
}

export default function ScoreSection({
	title,
	useDropdown = false,
	min = 0,
	max = 5,
	step = 1,
	initialScore,
	options,
	leftColumn,
	rightColumn,
}: ScoreSectionProps) {
	const defaultScore = useMemo(() => {
		if (typeof initialScore === "number") return initialScore;
		return Math.round((min + max) / 2);
	}, [initialScore, min, max]);

	const [score, setScore] = useState<number>(defaultScore);

	const defaultOptions: SelectProps.Option[] = useMemo(
		() => options ?? [],
		[options],
	);

	const [selectedOption, setSelectedOption] = useState<SelectProps.Option>(
		() => defaultOptions[0],
	);

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
								selectedOption={selectedOption}
								onChange={({ detail }) =>
									setSelectedOption(detail.selectedOption)
								}
								options={defaultOptions}
								selectedAriaLabel="Selected score"
								placeholder="Select a score"
							/>
						</SpaceBetween>
					) : (
						<SpaceBetween size="s">
							<Box fontWeight="bold">Score: {score}</Box>
							<Slider
								value={score}
								onChange={({ detail }) => setScore(detail.value)}
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
