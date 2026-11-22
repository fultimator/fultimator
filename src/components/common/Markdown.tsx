import type { ReactNode } from "react";
import ReactMarkdown, { type Options } from "react-markdown";

// react-markdown 9+ throws on `className` and non-string children; keep v7 behaviour.
const toText = (value: ReactNode): string =>
  Array.isArray(value)
    ? value.map(toText).join("")
    : typeof value === "string" || typeof value === "number"
      ? String(value)
      : "";

type Props = Omit<Options, "children"> & {
  children?: ReactNode;
  className?: string;
};

export default function Markdown({ className, children, ...props }: Props) {
  const markdown = <ReactMarkdown {...props}>{toText(children)}</ReactMarkdown>;
  return className ? <div className={className}>{markdown}</div> : markdown;
}
