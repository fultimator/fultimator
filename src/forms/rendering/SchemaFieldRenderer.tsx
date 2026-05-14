import React from "react";
import { Divider, Grid, Typography } from "@mui/material";
import type { ItemFieldConfig } from "./config/fieldConfig";
import type { FormSurface } from "../schema/fieldParity";
import { componentMap } from "./componentMap";

interface SchemaFieldRendererProps<TFormState extends Record<string, unknown>> {
  config: ItemFieldConfig<TFormState>;
  state: TFormState;
  onChange: (next: TFormState) => void;
  surface: FormSurface;
  // Optional group filter.
  group?: string;
  // Optional section heading.
  label?: string;
  // Fields per row on md+ screens.
  cols?: 1 | 2 | 3 | 4;
  // Extra props merged into each field's component props.
  extraProps?: Record<string, unknown>;
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
  cols = 2,
  extraProps,
}: SchemaFieldRendererProps<TFormState>) {
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

  return (
    <>
      {label && (
        <Grid size={12}>
          <Typography variant="h6">{label}</Typography>
          <Divider sx={{ mt: 0.5, mb: 1 }} />
        </Grid>
      )}
      {visible.map((field) => {
        const Component = componentMap[field.component!];
        if (!Component) return null;

        const handleCommit = (newValue: unknown) => {
          const parsed = field.parse ? field.parse(newValue) : newValue;
          let next: TFormState = { ...state, [field.key]: parsed };
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

        const displayValue = field.format
          ? field.format(state[field.key] as TFormState[keyof TFormState])
          : state[field.key];

        const mergedProps = extraProps
          ? { ...field.componentProps, ...extraProps }
          : field.componentProps;

        return (
          <Grid
            key={field.key}
            size={{ xs: 12, md: field.fullWidth ? 12 : mdSize }}
          >
            <Component
              fieldKey={field.key}
              label={field.label}
              value={displayValue}
              onCommit={handleCommit}
              componentProps={mergedProps}
            />
          </Grid>
        );
      })}
    </>
  );
}
