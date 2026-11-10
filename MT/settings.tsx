import Page from "@valenced/components/Page";
import { Design } from "@valenced/discord/design";
import { ScrollView } from "react-native";

const { Stack, TableRowGroup, TableSwitchRow, TableRow } = Design;

export default function Settings({ api: { jsonStorage, plugin: instance } }: any) {
  const value = jsonStorage.use((data: any) => "enhancedLayout" in data)?.enhancedLayout ?? true;
  return <Page><ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
    <Stack spacing={24}>
      <TableRowGroup title="Appearance">
        <TableSwitchRow label="Enhanced layout" subLabel="Separate rounded panels for supported channel lists, headers and the message composer. Applies only while Midnight is selected. Restart Discord after changing this option." value={value} onValueChange={async (enhancedLayout: boolean) => {
          await jsonStorage.set({ enhancedLayout });
          instance.requireReload();
        }} />
      </TableRowGroup>
      <TableRowGroup title="Setup">
        <TableRow label="Choose Midnight (Auto)" subLabel="Open Valenced Settings → Themes → Color themes → Midnight." />
        <TableRow label="Font and moon icon" subLabel="Choose Midnight Figtree under Fonts and Midnight Moon under Icons. Restart Discord after applying fonts or icons." />
        <TableRow label="Automatic appearance" subLabel="The palette follows Discord's appearance. Select automatic appearance in Discord to follow your device." />
      </TableRowGroup>
      <TableRowGroup title="About">
        <TableRow label="Midnight Mobile · 1.0.0-beta" subLabel="Desktop theme by refact0r. Mobile adaptation by dariuss. Desktop window controls and hover effects do not apply on mobile." />
      </TableRowGroup>
    </Stack>
  </ScrollView></Page>;
}
