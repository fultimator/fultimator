import { visit } from "unist-util-visit";

export default function remarkCustomCallouts() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === "containerDirective" &&
        node.name.startsWith("callout-")
      ) {
        const type = node.name.replace("callout-", "");

        node.data = {
          hName: "div",
          hProperties: {
            className: `callout-${type}`,
          },
        };
      }
    });
  };
}
