import { Action, ActionPanel, Icon } from "@raycast/api";

type perfProps = {
  showDetail: boolean;
  onDetail: () => void;
};

export function ActionSettings({ showDetail, onDetail }: perfProps) {
  return (
    <ActionPanel.Section title="Settings">
      <Action
        title={showDetail ? "Hide Details" : "Show Details"}
        onAction={onDetail}
        icon={Icon.Eye}
        shortcut={{ modifiers: ["cmd"], key: "d" }}
      />
    </ActionPanel.Section>
  );
}
