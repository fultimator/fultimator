import copyrightMarkdown from "../../COPYRIGHT.md?raw";

export interface IconAuthor {
  name: string;
  role: string;
  link: string;
  notes: string;
}

export interface IconAsset {
  name: string;
  path: string;
  url: string;
  category: string;
  author: string;
  source: string;
  license: string;
}

export interface IconCredits {
  authors: IconAuthor[];
  assets: IconAsset[];
}

const CREDITED_ROOTS = [
  { prefix: "assets/icons/", category: (path: string) => path.split("/")[2] },
  { prefix: "assets/branding/", category: () => "branding" },
  { prefix: "images/routes/icons/species/", category: () => "species" },
];

const parseRow = (line: string): string[] =>
  line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim().replace(/^`|`$/g, ""));

const isDataRow = (line: string) =>
  line.startsWith("|") &&
  !/^\|\s*-/.test(line) &&
  !/^\|\s*(Asset Name|Author \/ Studio)\b/.test(line);

const sectionLines = (
  md: string,
  heading: string,
  includeSubsections = false,
): string[] => {
  const lines = md.split("\n");
  const start = lines.findIndex((l) => l.startsWith(heading));
  if (start === -1) return [];
  const level = heading.match(/^#+/)![0].length;
  const stop = includeSubsections ? new RegExp(`^#{1,${level}} `) : /^#{1,6} /;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => stop.test(l));
  return end === -1 ? rest : rest.slice(0, end);
};

export function parseIconCredits(md: string): IconCredits {
  const authors = sectionLines(md, "## Authors")
    .filter(isDataRow)
    .map(parseRow)
    .map(([name, role, link, notes]) => ({
      name,
      role: role ?? "",
      link: link ?? "",
      notes: notes ?? "",
    }));

  const assets = sectionLines(md, "## Asset Inventory", true)
    .filter(isDataRow)
    .map(parseRow)
    .flatMap(([name, path, author, source, license]) => {
      const root = CREDITED_ROOTS.find((r) => path?.startsWith(r.prefix));
      if (!root) return [];
      const url = `/${path}`;
      return [
        {
          name,
          path,
          url,
          category: root.category(path),
          author,
          source,
          license,
        },
      ];
    });

  return { authors, assets };
}

export const iconCredits: IconCredits = parseIconCredits(copyrightMarkdown);

export const isUrl = (value: string) => /^(https?:\/\/|mailto:)/i.test(value);
