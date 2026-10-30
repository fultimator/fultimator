import { defaultSchema } from "rehype-sanitize";

export const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "span", "div", "mark"],
  attributes: {
    ...defaultSchema.attributes,
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      "className",
      "dataType",
      "dataDice",
      "dataIcon",
    ],
    div: [...(defaultSchema.attributes?.div ?? []), "className"],
  },
};
