"use client";

import {
	Container,
	Header,
	Textarea,
	SpaceBetween,
	TextContent,
	Box,
	Button,
} from "@cloudscape-design/components";
import { Review } from "@/lib/admin/useApplicant";
import { Uid } from "@/lib/userRecord";
import { useState } from "react";

interface ReviewerNotesProps {
	notes: string;
	onNotesChange: (notes: string) => void;
	reviews?: Review[];
	applicant: Uid;
	onDeleteNotes: (uid: Uid, idx: number) => void;
	reviewerId: Uid | null;
}

interface ReviewWithOriginalIdx {
	review: Review;
	originalIdx: number;
}

export default function ReviewerNotes({
	notes,
	onNotesChange,
	reviews,
	applicant,
	reviewerId,
	onDeleteNotes,
}: ReviewerNotesProps) {
	/*
	Filter out reviews with null notes, keeping the original index with the review.
	This is because the backend endpoint needs the original index of the review in 
	the mongodb document to delete the correct note.
	*/
	const [reviewsWithNotes, setReviewsWithNotes] = useState<
		ReviewWithOriginalIdx[]
	>(
		(reviews ?? [])
			.map((review, originalIdx) => ({ review, originalIdx }))
			.filter(({ review }) => review[3] !== null),
	);

	// Lazy delete notes and update the component without re-rendering the entire list in the frontend
	const deleteNotesAndUpdateComponent = (originalIdx: number) => {
		onDeleteNotes(applicant, originalIdx);
		setReviewsWithNotes((prev) =>
			prev.filter(({ originalIdx: idx }) => idx !== originalIdx),
		);
	};

	return (
		<Container header={<Header variant="h2">Reviewer Notes</Header>}>
			<SpaceBetween direction="vertical" size="s">
				{reviewsWithNotes.length > 0 && (
					<TextContent>
						Past Notes
						<ul>
							{reviewsWithNotes.map(
								({ review: [ , reviewer, , note], originalIdx }) => {
									return (
										<li
											key={originalIdx}
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
												{reviewer === reviewerId && (
													<Button
														onClick={() =>
															deleteNotesAndUpdateComponent(originalIdx)
														}
													>
														Delete
													</Button>
												)}
											</div>
											<Box>{note}</Box>
										</li>
									);
								},
							)}
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
