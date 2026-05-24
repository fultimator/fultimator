import React, { useState } from "react";
import { Box, Divider, Grid, Tab, Tabs } from "@mui/material";
import type { TabDefinition } from "./config/fieldConfig";
import type { ItemFieldConfig } from "./config/fieldConfig";
import type { FormSurface } from "../schema/fieldParity";
import type { GroupLabels } from "./config/fieldConfig";
import { SchemaFieldRenderer } from "./SchemaFieldRenderer";
import { useTranslate } from "../../translation/translate";

interface TabbedSchemaFormRendererProps<
  TFormState extends Record<string, unknown>,
> {
  tabs: TabDefinition[];
  config: ItemFieldConfig<TFormState>;
  state: TFormState;
  onChange: (next: TFormState) => void;
  surface: FormSurface;
  groupLabels?: GroupLabels;
  cols?: 1 | 2 | 3 | 4;
  extraProps?: Record<string, unknown>;
}

// Fields with no tab property fall into the first tab.
function fieldsForTab<TFormState extends Record<string, unknown>>(
  config: ItemFieldConfig<TFormState>,
  tabKey: string,
  isFirst: boolean,
): ItemFieldConfig<TFormState> {
  return config.filter((f) =>
    isFirst ? !f.tab || f.tab === tabKey : f.tab === tabKey,
  );
}

export function TabbedSchemaFormRenderer<
  TFormState extends Record<string, unknown>,
>({
  tabs,
  config,
  state,
  onChange,
  surface,
  groupLabels,
  cols = 2,
  extraProps,
}: TabbedSchemaFormRendererProps<TFormState>) {
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState(0);

  if (tabs.length === 0) {
    return (
      <Grid container spacing={2}>
        <SchemaFieldRenderer
          config={config}
          state={state}
          onChange={onChange}
          surface={surface}
          groupLabels={groupLabels}
          cols={cols}
          extraProps={extraProps}
        />
      </Grid>
    );
  }

  const activeTabDef = tabs[activeTab];
  const visibleFields = fieldsForTab(config, activeTabDef.key, activeTab === 0);

  // Collect unique groups in order of first appearance within the tab
  const groups: string[] = [];
  for (const f of visibleFields) {
    const g = f.group ?? "";
    if (!groups.includes(g)) groups.push(g);
  }

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, v: number) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.key} label={t(tab.label)} />
        ))}
      </Tabs>

      <Grid container spacing={2}>
        {groups.map((group, idx) => (
          <React.Fragment key={group}>
            {idx > 0 && (
              <Grid size={12}>
                <Divider />
              </Grid>
            )}
            <SchemaFieldRenderer
              config={visibleFields}
              state={state}
              onChange={onChange}
              surface={surface}
              group={group || undefined}
              groupLabels={groupLabels}
              cols={cols}
              extraProps={extraProps}
            />
          </React.Fragment>
        ))}
      </Grid>
    </Box>
  );
}
