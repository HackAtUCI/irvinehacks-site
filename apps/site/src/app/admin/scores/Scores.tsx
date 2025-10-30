"use client";

import {
	Box,
	ColumnLayout,
	Container,
	Header,
	SpaceBetween,
} from "@cloudscape-design/components";

function Scores() {
	return (
		<SpaceBetween size="l">
			<Header variant="h1">Scores</Header>
			<Container header={<Header variant="h2">Normalized Scores</Header>}>
				<SpaceBetween size="l">
					<ColumnLayout columns={3} borders="vertical">
						<Box>
							<Header variant="h3">Accepted</Header>
						</Box>

						<Box>
							<Header variant="h3">Waitlisted</Header>
						</Box>

						<Box>
							<Header variant="h3">Rejected</Header>
						</Box>
					</ColumnLayout>
				</SpaceBetween>
			</Container>
		</SpaceBetween>
	);
}

export default Scores;
