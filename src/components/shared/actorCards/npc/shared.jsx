import { useState } from "react";
import ReactMarkdown from "react-markdown";

export const ATTR_SHORT = {
  dexterity: "dex",
  insight: "ins",
  might: "mig",
  will: "wlp",
};

export const damageTypeLabels = {
  physical: "physical_damage",
  air: "air_damage",
  bolt: "bolt_damage",
  dark: "dark_damage",
  earth: "earth_damage",
  fire: "fire_damage",
  ice: "ice_damage",
  light: "light_damage",
  poison: "poison_damage",
};

export function SpanMarkdown({ children }) {
  return (
    <span
      style={{
        whiteSpace: "pre-line",
        display: "inline",
        margin: 0,
        padding: 0,
      }}
    >
      <ReactMarkdown
        components={{
          p: ({ _node, ...props }) => <span {...props} />,
          strong: ({ _node, ...props }) => (
            <strong style={{ fontWeight: "bold" }} {...props} />
          ),
          em: ({ _node, ...props }) => (
            <em style={{ fontStyle: "italic" }} {...props} />
          ),
          span: ({ _node, ...props }) => <span {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </span>
  );
}

export function StyledMarkdown({ children }) {
  return (
    <div style={{ whiteSpace: "pre-line", margin: 0, padding: 0 }}>
      <ReactMarkdown
        components={{
          p: ({ _node, ...props }) => (
            <p style={{ margin: 0, padding: 0 }} {...props} />
          ),
          ul: ({ _node, ...props }) => (
            <ul style={{ margin: 0, padding: 0 }} {...props} />
          ),
          li: ({ _node, ...props }) => (
            <li style={{ margin: 0, padding: 0 }} {...props} />
          ),
          strong: ({ _node, ...props }) => (
            <strong style={{ fontWeight: "bold" }} {...props} />
          ),
          em: ({ _node, ...props }) => (
            <em style={{ fontStyle: "italic" }} {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function ClickableName({ name, onAction }) {
  const [hovered, setHovered] = useState(false);
  return (
    <strong
      onClick={onAction}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        textDecoration: hovered ? "underline" : "none",
        textUnderlineOffset: "2px",
      }}
    >
      {name}
    </strong>
  );
}
