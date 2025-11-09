"use client";

import {
	Container,
	Header,
	Textarea,
	SpaceBetween,
	TextContent,
	Box,
} from "@cloudscape-design/components";
import { Review } from "@/lib/admin/useApplicant";

interface ReviewerNotesProps {
	notes: string;
	onNotesChange: (notes: string) => void;
	reviews?: Review[];
}

const formatReviewDate = (date: string) => {
	const parsedDate = new Date(date);
	if (Number.isNaN(parsedDate.getTime())) {
		return date;
	}

	return parsedDate.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
};

export default function ReviewerNotes({
	notes,
	onNotesChange,
	reviews,
}: ReviewerNotesProps) {
	const pastReviews = (reviews ?? []).filter((review) => {
		return review[3] !== null;
	});

	return (
		<Container header={<Header variant="h2">Reviewer Notes</Header>}>
			<SpaceBetween direction="vertical" size="s">
				{pastReviews.length > 0 && (
					<TextContent>
						Past Notes
						<ul>
							{pastReviews.map(([date, reviewer, score, note]) => {
								const formattedDate = formatReviewDate(date);

								return (
									<li
										key={`${date}-${reviewer}`}
										style={{
											marginBottom: "0.5rem",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
											}}
										>
											<Box fontWeight="bold">{reviewer}</Box>
											<Box color="text-status-inactive">{formattedDate}</Box>
										</div>
										<Box>{note}</Box>
									</li>
								);
							})}
						</ul>
					</TextContent>
				)}
				<Textarea
					placeholder="Reviewer Notes"
					value={notes}
					onChange={({ detail }) => onNotesChange(detail.value)}
					rows={5}
				/>
			</SpaceBetween>
		</Container>
	);
}
