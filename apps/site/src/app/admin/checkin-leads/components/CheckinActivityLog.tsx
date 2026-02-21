import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { useCheckinEventLog } from "./useCheckinEventLog";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString();
}

export default function CheckinActivityLog() {
  const { events } = useCheckinEventLog();

  return (
    <Container header={<Box variant="h3">Check-in Activity</Box>}>
      <SpaceBetween size="xs">
        {events.length === 0 && (
          <Box variant="p">No actions recorded yet</Box>
        )}

        {events.map((e, i) => (
          <Box key={i}>
            <b>{formatTime(e.time)}</b> — {e.text}
          </Box>
        ))}
      </SpaceBetween>
    </Container>
  );
}
