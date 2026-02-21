import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

import { useQueuePullTimer } from "./useQueuePullTimer";

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export default function QueuePullStopwatch() {
  const { elapsedMs, markPulled, lastPull } = useQueuePullTimer();

  let status: "success" | "warning" | "error" = "success";
  let label = "Good";

  if (elapsedMs !== null) {
    const minutes = elapsedMs / 60000;

    if (minutes >= 20) {
      status = "error";
      label = "Pull now";
    } else if (minutes >= 15) {
      status = "warning";
      label = "Prepare next batch";
    }
  }

  return (
    <Container header={<Box variant="h3">Queue Timing</Box>}>
      <SpaceBetween size="m">

        {/* Timer display */}
        <Box fontSize="heading-s">
          {elapsedMs === null ? "No batch pulled yet" : formatElapsed(elapsedMs)}
        </Box>

        {/* Status indicator */}
        <StatusIndicator type={status}>
          {elapsedMs === null ? "Waiting for first batch" : label}
        </StatusIndicator>

        {/* Manual correction button */}
        <Button onClick={markPulled}>
          Mark batch pulled now
        </Button>

      </SpaceBetween>
    </Container>
  );
}
