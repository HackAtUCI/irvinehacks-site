import Button from "@cloudscape-design/components/button";

export default function RefreshSummaryButton({
  onRefresh,
}: {
  onRefresh: () => void;
}) {
  return (
    <Button
      iconName="refresh"
      variant="normal"
      onClick={onRefresh}
    >
      Refresh chart
    </Button>
  );
}
