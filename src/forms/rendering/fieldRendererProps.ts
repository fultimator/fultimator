export interface FieldRendererProps {
  fieldKey: string;
  label: string;
  value: unknown;
  onCommit: (value: unknown) => void;
  disabled?: boolean;
  componentProps?: Record<string, unknown>;
}
