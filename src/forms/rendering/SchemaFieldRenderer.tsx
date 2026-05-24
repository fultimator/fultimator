import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import type { GroupLabels, ItemFieldConfig } from "./config/fieldConfig";
import type { FormSurface } from "../schema/fieldParity";
import { componentMap } from "./componentMap";
import { useTranslate } from "../../translation/translate";

interface SchemaFieldRendererProps<TFormState extends Record<string, unknown>> {
  config: ItemFieldConfig<TFormState>;
  state: TFormState;
  onChange: (next: TFormState) => void;
  surface: FormSurface;
  // Optional group filter.
  group?: string;
  // Optional section heading. Takes precedence over groupLabels lookup.
  label?: string;
  // Group-key → dot-path label string map from the item config. Used when label is omitted.
  groupLabels?: GroupLabels;
  // Optional action element rendered beside the section label (e.g. a search icon button).
  labelAction?: React.ReactNode;
  // Fields per row on md+ screens.
  cols?: 1 | 2 | 3 | 4;
  // Extra props merged into each field's component props.
  extraProps?: Record<string, unknown>;
  // When true, renders nothing (useful for conditionally hiding entire sections).
  hidden?: boolean;
}

// Resolve a nested path (for example "damage.value") to [parent, leafKey].
function resolvePath(
  obj: Record<string, unknown>,
  path: string,
): [Record<string, unknown>, string] {
  const parts = path.split(".");
  let cursor: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (cursor[part] == null || typeof cursor[part] !== "object") {
      cursor[part] = {};
    }
    cursor = cursor[part] as Record<string, unknown>;
  }
  return [cursor, parts[parts.length - 1]];
}

// Apply effect transforms to a copied state object.
function applyEffects<TFormState extends Record<string, unknown>>(
  state: TFormState,
  effects: Record<string, (s: TFormState) => unknown>,
): TFormState {
  let next = { ...state };
  for (const [path, transform] of Object.entries(effects)) {
    const newValue = transform(next as TFormState);
    if (path.includes(".")) {
      const topKey = path.split(".")[0];
      const nested = { ...((next[topKey] as Record<string, unknown>) ?? {}) };
      const [parent, leaf] = resolvePath(nested, path.slice(topKey.length + 1));
      parent[leaf] = newValue;
      next = { ...next, [topKey]: nested };
    } else {
      next = { ...next, [path]: newValue };
    }
  }
  return next as TFormState;
}

export function SchemaFieldRenderer<
  TFormState extends Record<string, unknown>,
>({
  config,
  state,
  onChange,
  surface,
  group,
  label,
  groupLabels,
  labelAction,
  cols = 2,
  extraProps,
  hidden,
}: SchemaFieldRendererProps<TFormState>) {
  const { t } = useTranslate();
  if (hidden) return null;
  const mdSize = Math.floor(12 / cols) as 3 | 4 | 6 | 12;

  const visible = config
    .filter((field) => {
      if (field.surfaces && !field.surfaces.includes(surface)) return false;
      if (group !== undefined && field.group !== group) return false;
      if (field.kind === "computed") return false;
      if (!field.component) return false;
      if (field.dependencies && !field.dependencies(state)) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);

  const resolvedLabel =
    label ?? (group && groupLabels ? groupLabels[group] : undefined);

  return (
    <>
      {resolvedLabel && (
        <Grid size={12}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
            >
              {typeof resolvedLabel === "string" ? t(resolvedLabel) : ""}
            </Typography>
            {labelAction}
          </Box>
        </Grid>
      )}
      {visible.map((field) => {
        const Component = componentMap[field.component!];
        if (!Component) return null;

        const handleCommit = (newValue: unknown) => {
          const parsed = field.parse ? field.parse(newValue) : newValue;
          let next: TFormState;
          if (field.key.includes(".")) {
            next = applyEffects(state, {
              [field.key]: () => parsed,
            } as Record<string, (s: TFormState) => unknown>);
          } else {
            next = { ...state, [field.key]: parsed };
          }
          if (field.onChangeEffects) {
            next = applyEffects(
              next,
              field.onChangeEffects as Record<
                string,
                (s: TFormState) => unknown
              >,
            );
          }
          onChange(next);
        };

        const rawValue = field.key.includes(".")
          ? field.key
              .split(".")
              .reduce<unknown>(
                (cur, k) =>
                  cur != null && typeof cur === "object"
                    ? (cur as Record<string, unknown>)[k]
                    : undefined,
                state,
              )
          : state[field.key];
        const displayValue = field.format
          ? field.format(rawValue as TFormState[keyof TFormState])
          : rawValue;

        const filteredExtra = extraProps
          ? field.component === "fuid" ||
            field.component === "grouped-select" ||
            field.component === "autocomplete"
            ? extraProps
            : Object.fromEntries(
                Object.entries(extraProps).filter(([k]) => k !== "onBrowse"),
              )
          : undefined;
        const mergedProps = filteredExtra
          ? { ...field.componentProps, ...filteredExtra }
          : field.componentProps;
        const componentPropsWithNestedRenderer = {
          ...(mergedProps ?? {}),
          ...(field.component === "fuid" ? { name: state.name ?? "" } : {}),
          renderNestedFields: ({
            config,
            state,
            onChange,
            surface = "edit",
            cols = 2,
          }: {
            config: ItemFieldConfig<Record<string, unknown>>;
            state: Record<string, unknown>;
            onChange: (next: Record<string, unknown>) => void;
            surface?: FormSurface;
            cols?: 1 | 2 | 3 | 4;
          }) => (
            <SchemaFieldRenderer
              config={config}
              state={state}
              onChange={onChange}
              surface={surface}
              cols={cols}
            />
          ),
        };

        return (
          <Grid
            key={field.key}
            size={
              field.gridSize !== undefined
                ? field.gridSize
                : { xs: 12, md: field.fullWidth ? 12 : mdSize }
            }
            sx={
              field.component === "checkbox" ||
              field.component === "martial-toggle" ||
              field.component === "offensive-toggle"
                ? { display: "flex", alignItems: "center" }
                : undefined
            }
          >
            <Component
              fieldKey={field.key}
              label={
                typeof field.label === "function"
                  ? field.label(state)
                  : field.label
              }
              value={displayValue}
              onCommit={handleCommit}
              componentProps={componentPropsWithNestedRenderer}
            />
          </Grid>
        );
      })}
    </>
  );
}
