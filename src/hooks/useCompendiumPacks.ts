import { useState, useEffect, useCallback } from "react";
import { getDb, notifyListeners, subscribeToStore } from "../platform/idb";
import type {
  CompendiumPack,
  CompendiumItem,
  CompendiumItemType,
  PackTheme,
  PackType,
} from "../types/CompendiumPack";
import { validateManifest } from "../utils/validateCompendiumPack";
import { decodeThemeFile, themeSlug } from "../utils/themePackCodec";
import {
  sanitizeImportedCustomization,
  DEFAULT_CUSTOMIZATION,
} from "../themes/themeCustomization";
import { useThemeStore } from "../store/themeStore";
import {
  slugFuid,
  collectRefPacks,
  parseRef,
  buildRef,
  resolveRefMeta,
} from "../utils/compendiumRefs";

const STORE = "compendium-packs";
const PERSONAL_ID = "personal";
const toFuid = (value: string): string => slugFuid(value);
const ensureItemDataFuid = (
  type: CompendiumItemType,
  data: Record<string, unknown>,
  _itemId: string,
): Record<string, unknown> => {
  const existing = typeof data.fuid === "string" ? toFuid(data.fuid) : "";
  if (existing) return { ...data, fuid: existing };

  const namePart =
    typeof data.name === "string" ? toFuid(data.name) : toFuid(type);
  const base = namePart || toFuid(type) || "item";
  return { ...data, fuid: base };
};
const deriveAutoRequires = (pack: CompendiumPack): string[] => {
  const currentPackFuid = toFuid(pack.fuid || "");
  const refs = new Set<string>();
  for (const item of pack.items) {
    for (const refPack of collectRefPacks(item.data)) {
      if (refPack && refPack !== currentPackFuid) refs.add(refPack);
    }
  }
  return Array.from(refs).sort((a, b) => a.localeCompare(b));
};
const normalizeManualRequires = (pack: CompendiumPack): string[] => {
  const raw = pack.requiresManual ?? pack.requires ?? [];
  return Array.from(new Set(raw.map((v) => toFuid(v)).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );
};
const mergeRequires = (manual: string[], auto: string[]): string[] =>
  Array.from(new Set([...manual, ...auto])).sort((a, b) => a.localeCompare(b));
const finalizePackRequires = (pack: CompendiumPack): CompendiumPack => {
  const requiresManual = normalizeManualRequires(pack);
  const requiresAuto = deriveAutoRequires(pack);
  const requires = mergeRequires(requiresManual, requiresAuto);
  return { ...pack, requiresManual, requiresAuto, requires };
};
const normalizePackAndItems = (pack: CompendiumPack): CompendiumPack => {
  const normalizedItems = pack.items.map((item) => ({
    ...item,
    data: ensureItemDataFuid(item.type, item.data, item.id),
  }));
  const currentFuid = toFuid(pack.fuid || pack.name || "") || "pack";
  const aliases = Array.from(
    new Set((pack.aliases ?? []).map((v) => toFuid(v)).filter(Boolean)),
  ).filter((alias) => alias !== currentFuid);
  const normalizedPack: CompendiumPack = {
    ...pack,
    fuid: currentFuid,
    aliases,
    items: normalizedItems,
  };
  return finalizePackRequires(normalizedPack);
};
const rewriteAliasResolvedRefs = (
  pack: CompendiumPack,
  packs: CompendiumPack[],
): CompendiumPack => {
  const items = pack.items.map((item) => {
    const nextData: Record<string, unknown> = { ...item.data };
    let changed = false;
    for (const [key, value] of Object.entries(nextData)) {
      if (!key.endsWith("Ref")) continue;
      const meta = resolveRefMeta(value, packs);
      if (!meta || !meta.resolvedViaAlias || !meta.canonicalRef) continue;
      nextData[key] = meta.canonicalRef;
      changed = true;
    }
    return changed ? { ...item, data: nextData } : item;
  });
  return { ...pack, items };
};
const rewriteSelfRefsForPackFuidChange = (
  pack: CompendiumPack,
  previousFuid: string,
  nextFuid: string,
): CompendiumPack => {
  if (!previousFuid || !nextFuid || previousFuid === nextFuid) return pack;
  const items = pack.items.map((item) => {
    const nextData: Record<string, unknown> = { ...item.data };
    let changed = false;
    for (const [key, value] of Object.entries(nextData)) {
      if (!key.endsWith("Ref")) continue;
      const parsed = parseRef(value);
      if (!parsed || parsed.packFuid !== previousFuid) continue;
      nextData[key] = buildRef(nextFuid, parsed.itemFuid);
      changed = true;
    }
    return changed ? { ...item, data: nextData } : item;
  });
  return { ...pack, items };
};
const packsEquivalent = (a: CompendiumPack, b: CompendiumPack): boolean =>
  JSON.stringify(a) === JSON.stringify(b);
async function getAllPacks(): Promise<CompendiumPack[]> {
  const db = await getDb();
  return db.getAll(STORE) as Promise<CompendiumPack[]>;
}

async function savePack(pack: CompendiumPack): Promise<void> {
  const db = await getDb();
  await db.put(STORE, pack);
  notifyListeners(STORE);
}

export function useCompendiumPacks() {
  const [packs, setPacks] = useState<CompendiumPack[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const all = await getAllPacks();
    const normalizedBase = all.map((pack) => normalizePackAndItems(pack));
    const normalized = normalizedBase.map((pack) =>
      finalizePackRequires(rewriteAliasResolvedRefs(pack, normalizedBase)),
    );
    const changed = normalized.filter(
      (pack, idx) => !packsEquivalent(pack, all[idx]),
    );
    if (changed.length > 0) {
      const db = await getDb();
      const tx = db.transaction(STORE, "readwrite");
      for (const pack of changed) {
        await tx.store.put(pack);
      }
      await tx.done;
    }
    setPacks(normalized);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    return subscribeToStore(STORE, reload);
  }, [reload]);

  const personalPack = packs.find((p) => p.id === PERSONAL_ID) ?? null;

  //  Pack CRUD
  const ensurePersonalPack = useCallback(async (): Promise<CompendiumPack> => {
    const all = await getAllPacks();
    const existing = all.find((p) => p.id === PERSONAL_ID);
    if (existing) return existing;

    const now = Date.now();
    const pack: CompendiumPack = {
      id: PERSONAL_ID,
      name: "Personal",
      isPersonal: true,
      createdAt: now,
      updatedAt: now,
      items: [],
      themes: [],
    };
    try {
      const db = await getDb();
      await db.add(STORE, pack); // throws on duplicate key (race condition)
      notifyListeners(STORE);
      return pack;
    } catch {
      // Another concurrent call already created it - return the existing one
      const refreshed = await getAllPacks();
      return refreshed.find((p) => p.id === PERSONAL_ID)!;
    }
  }, []);

  const createPack = useCallback(
    async (
      name: string,
      description?: string,
      fuid?: string,
    ): Promise<string> => {
      const id = crypto.randomUUID();
      const now = Date.now();
      const computedFuid = toFuid(fuid?.trim() || name);
      const pack: CompendiumPack = {
        id,
        fuid: computedFuid || "pack",
        name,
        description,
        requiresManual: [],
        requiresAuto: [],
        requires: [],
        optional: [],
        isPersonal: false,
        createdAt: now,
        updatedAt: now,
        items: [],
        themes: [],
      };
      await savePack(finalizePackRequires(pack));
      return id;
    },
    [],
  );

  const updatePack = useCallback(
    async (
      id: string,
      changes: Partial<
        Pick<
          CompendiumPack,
          | "name"
          | "description"
          | "author"
          | "fuid"
          | "requires"
          | "requiresManual"
          | "optional"
        >
      >,
    ): Promise<void> => {
      const all = await getAllPacks();
      const pack = all.find((p) => p.id === id);
      if (!pack) return;
      const normalizedChanges = {
        ...changes,
        ...(changes.requires
          ? {
              requiresManual: Array.from(
                new Set(changes.requires.map((v) => toFuid(v)).filter(Boolean)),
              ),
            }
          : {}),
        ...(changes.requiresManual
          ? {
              requiresManual: Array.from(
                new Set(
                  changes.requiresManual.map((v) => toFuid(v)).filter(Boolean),
                ),
              ),
            }
          : {}),
      };
      const nextCandidate = {
        ...pack,
        ...normalizedChanges,
        updatedAt: Date.now(),
      };
      const previousFuid = toFuid(pack.fuid || "");
      const nextFuid = toFuid(nextCandidate.fuid || "");
      nextCandidate.aliases = Array.from(
        new Set([
          ...(pack.aliases ?? []).map((v) => toFuid(v)).filter(Boolean),
          ...(previousFuid && previousFuid !== nextFuid ? [previousFuid] : []),
        ]),
      ).filter((alias) => alias !== nextFuid);
      const withRewrittenSelfRefs = rewriteSelfRefsForPackFuidChange(
        nextCandidate,
        previousFuid,
        nextFuid,
      );
      const next = finalizePackRequires(withRewrittenSelfRefs);
      await savePack(next);
    },
    [],
  );

  const setPackActive = useCallback(
    async (id: string, active: boolean): Promise<void> => {
      const all = await getAllPacks();
      const pack = all.find((p) => p.id === id);
      if (!pack) return;
      await savePack({ ...pack, active, updatedAt: Date.now() });
    },
    [],
  );

  const toggleLock = useCallback(async (id: string): Promise<void> => {
    const all = await getAllPacks();
    const pack = all.find((p) => p.id === id);
    if (!pack) return;
    await savePack({ ...pack, locked: !pack.locked, updatedAt: Date.now() });
  }, []);

  const deletePack = useCallback(async (id: string): Promise<void> => {
    const all = await getAllPacks();
    const pack = all.find((p) => p.id === id);
    if (!pack || pack.isPersonal) return;
    const db = await getDb();
    await db.delete(STORE, id);
    notifyListeners(STORE);
  }, []);

  // Item operations
  const addItem = useCallback(
    async (
      packId: string,
      type: CompendiumItemType,
      data: unknown,
    ): Promise<void> => {
      const targetId = packId === PERSONAL_ID ? PERSONAL_ID : packId;
      const all = await getAllPacks();
      let pack = all.find((p) => p.id === targetId);

      // Auto-create personal pack on first use
      if (!pack && targetId === PERSONAL_ID) {
        pack = await ensurePersonalPack();
      }
      if (!pack) return;

      // Deduplicate by source id field when available
      const incoming = data as Record<string, unknown>;
      if (incoming.id !== undefined) {
        const duplicate = pack.items.find(
          (i) => i.type === type && i.data.id === incoming.id,
        );
        if (duplicate) {
          const itemName =
            typeof incoming.name === "string" ? incoming.name : "Item";
          throw new Error(`"${itemName}" is already in "${pack.name}"`);
        }
      }

      const itemId = crypto.randomUUID();
      const item: CompendiumItem = {
        id: itemId,
        type,
        data: ensureItemDataFuid(type, incoming, itemId),
        addedAt: Date.now(),
      };
      await savePack(
        finalizePackRequires({
          ...pack,
          items: [...pack.items, item],
          updatedAt: Date.now(),
        }),
      );
    },
    [ensurePersonalPack],
  );

  const updateItem = useCallback(
    async (packId: string, itemId: string, newData: unknown): Promise<void> => {
      const all = await getAllPacks();
      const pack = all.find((p) => p.id === packId);
      if (!pack) return;
      await savePack(
        finalizePackRequires({
          ...pack,
          items: pack.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  data: ensureItemDataFuid(
                    i.type,
                    newData as Record<string, unknown>,
                    i.id,
                  ),
                }
              : i,
          ),
          updatedAt: Date.now(),
        }),
      );
    },
    [],
  );

  const removeItem = useCallback(
    async (packId: string, itemId: string): Promise<void> => {
      const all = await getAllPacks();
      const pack = all.find((p) => p.id === packId);
      if (!pack) return;
      await savePack(
        finalizePackRequires({
          ...pack,
          items: pack.items.filter((i) => i.id !== itemId),
          updatedAt: Date.now(),
        }),
      );
    },
    [],
  );

  const moveItem = useCallback(
    async (
      itemId: string,
      fromPackId: string,
      toPackId: string,
    ): Promise<void> => {
      const all = await getAllPacks();
      const fromPack = all.find((p) => p.id === fromPackId);
      const toPack = all.find((p) => p.id === toPackId);
      if (!fromPack || !toPack) return;

      const item = fromPack.items.find((i) => i.id === itemId);
      if (!item) return;

      const db = await getDb();
      const tx = db.transaction(STORE, "readwrite");
      await tx.store.put({
        ...finalizePackRequires({
          ...fromPack,
          items: fromPack.items.filter((i) => i.id !== itemId),
          updatedAt: Date.now(),
        }),
      });
      await tx.store.put({
        ...finalizePackRequires({
          ...toPack,
          items: [...toPack.items, { ...item, addedAt: Date.now() }],
          updatedAt: Date.now(),
        }),
      });
      await tx.done;
      notifyListeners(STORE);
    },
    [],
  );

  // Theme operations
  const addTheme = useCallback(
    async (
      packId: string,
      input: {
        name: string;
        description?: string | null;
        baseTheme: string;
        styleProfile: string;
        isDarkMode: boolean;
        customization: unknown;
      },
    ): Promise<void> => {
      const all = await getAllPacks();
      let pack = all.find((p) => p.id === packId);

      if (!pack && packId === PERSONAL_ID) {
        pack = await ensurePersonalPack();
      }
      if (!pack) return;

      const sanitized = sanitizeImportedCustomization(input.customization);
      const customization = { ...DEFAULT_CUSTOMIZATION, ...sanitized };

      const theme: PackTheme = {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        description:
          typeof input.description === "string"
            ? input.description.trim() || null
            : null,
        baseTheme: input.baseTheme,
        styleProfile: input.styleProfile,
        isDarkMode: input.isDarkMode,
        customization,
        addedAt: Date.now(),
      };
      await savePack({
        ...pack,
        themes: [...(pack.themes ?? []), theme],
        updatedAt: Date.now(),
      });
    },
    [ensurePersonalPack],
  );

  const removeTheme = useCallback(
    async (packId: string, themeId: string): Promise<void> => {
      const all = await getAllPacks();
      const pack = all.find((p) => p.id === packId);
      if (!pack) return;
      await savePack({
        ...pack,
        themes: (pack.themes ?? []).filter((t) => t.id !== themeId),
        updatedAt: Date.now(),
      });
    },
    [],
  );

  const applyTheme = useCallback(
    async (packId: string, themeId: string): Promise<void> => {
      const all = await getAllPacks();
      const pack = all.find((p) => p.id === packId);
      const theme = (pack?.themes ?? []).find((t) => t.id === themeId);
      if (!theme) throw new Error(`Theme "${themeId}" not found`);

      const store = useThemeStore.getState();
      store.setTheme(theme.baseTheme as Parameters<typeof store.setTheme>[0]);
      store.setStyleProfile(
        theme.styleProfile as Parameters<typeof store.setStyleProfile>[0],
      );
      if (store.isDarkMode !== theme.isDarkMode) {
        store.toggleDarkMode();
      }
      store.resetCustomization();
      store.setCustomization(
        theme.customization as Parameters<typeof store.setCustomization>[0],
      );
    },
    [],
  );

  // Module I/O
  const exportAsModule = useCallback(
    async (
      packId: string,
      meta: {
        version?: string;
        homepageUrl?: string;
        manifestUrl?: string;
        downloadUrl?: string;
      } = {},
    ): Promise<void> => {
      const JSZip = (await import("jszip")).default;
      const all = await getAllPacks();
      const pack = all.find((p) => p.id === packId);
      if (!pack) return;

      const zip = new JSZip();
      const itemsFolder = zip.folder("items")!;

      const byType: Record<string, CompendiumItem[]> = {};
      for (const item of pack.items) {
        (byType[item.type] ??= []).push(item);
      }

      for (const [type, items] of Object.entries(byType)) {
        const typeFolder = itemsFolder.folder(type)!;
        for (const item of items) {
          const baseName = item.data.name as string | undefined;
          const baseSlug = baseName
            ? baseName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
            : "item";
          const filename = `${baseSlug}-${item.id.slice(0, 8)}.json`;
          typeFolder.file(filename, JSON.stringify(item.data, null, 2));
        }
      }

      // Bundle pack's themes into themes/ folder
      const packThemes = pack.themes ?? [];
      if (packThemes.length > 0) {
        const themesFolder = zip.folder("themes")!;
        for (const theme of packThemes) {
          const slug = themeSlug(theme.name);
          const filename = `${slug}-${theme.id.slice(0, 8)}.json`;
          const payload = {
            schema: "fultimator.theme@1",
            id: theme.id,
            name: theme.name,
            description: theme.description,
            baseTheme: theme.baseTheme,
            styleProfile: theme.styleProfile,
            isDarkMode: theme.isDarkMode,
            customization: theme.customization,
          };
          themesFolder.file(filename, JSON.stringify(payload, null, 2));
        }
      }

      const finalized = finalizePackRequires(pack);
      const manifest = {
        id: pack.id,
        fuid: pack.fuid ?? "",
        name: pack.name,
        version: meta.version ?? "1.0.0",
        type: (pack.type ?? "compendium") as PackType,
        author: pack.author ?? "",
        description: pack.description ?? "",
        homepageUrl: meta.homepageUrl ?? "",
        manifestUrl: meta.manifestUrl ?? "",
        downloadUrl: meta.downloadUrl ?? "",
        requires: finalized.requires ?? [],
        optional: pack.optional ?? [],
        fultimatorMinVersion: "2.0.0",
        createdAt: pack.createdAt,
      };
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const packSlug = pack.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      a.href = url;
      a.download = `${packSlug}.fcp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [],
  );

  const importFromFile = useCallback(async (file: File): Promise<string> => {
    const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
    if (file.size > MAX_SIZE) throw new Error("File is too large (max 50 MB)");

    const JSZip = (await import("jszip")).default;
    let zip: InstanceType<typeof JSZip>;
    try {
      zip = await JSZip.loadAsync(file);
    } catch {
      throw new Error("Could not read file — is it a valid .fcp ZIP archive?");
    }

    const manifestFile = zip.file("manifest.json");
    if (!manifestFile)
      throw new Error("Invalid .fcp file: missing manifest.json");

    let manifest: Record<string, unknown>;
    try {
      const manifestText = await manifestFile.async("text");
      manifest = JSON.parse(manifestText);
    } catch {
      throw new Error("Could not parse manifest.json — file may be corrupt");
    }

    const validation = validateManifest(manifest);
    if (!validation.valid) {
      throw new Error(`Invalid manifest: ${validation.errors.join("; ")}`);
    }

    const validTypes: CompendiumItemType[] = [
      "npc-attack",
      "npc-spell",
      "weapon",
      "armor",
      "shield",
      "player-spell",
      "quality",
      "class",
      "heroic",
      "mnemosphere",
      "hoplosphere",
      "optional",
    ];
    const now = Date.now();
    const packId = crypto.randomUUID();
    const items: CompendiumItem[] = [];

    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir || !path.startsWith("items/")) continue;
      const parts = path.split("/");
      if (parts.length < 3) continue;
      const type = parts[1] as CompendiumItemType;
      if (!validTypes.includes(type)) continue;

      let data: Record<string, unknown>;
      try {
        const text = await zipEntry.async("text");
        const parsed: unknown = JSON.parse(text);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
          continue;
        data = parsed as Record<string, unknown>;
      } catch {
        continue; // skip corrupt item files silently
      }
      const itemId = crypto.randomUUID();
      items.push({
        id: itemId,
        type,
        data: ensureItemDataFuid(type, data, itemId),
        addedAt: now,
      });
    }

    const rawType = manifest.type;
    const packType: PackType =
      rawType === "supplement" ? "supplement" : "compendium";

    const packName =
      typeof manifest.name === "string"
        ? manifest.name.trim()
        : "Imported Pack";
    const importedFuid =
      typeof manifest.fuid === "string" ? toFuid(manifest.fuid.trim()) : "";
    const importedRequires = Array.isArray(manifest.requires)
      ? manifest.requires
          .filter((v): v is string => typeof v === "string")
          .map((v) => toFuid(v))
          .filter(Boolean)
      : [];
    const importedOptional = Array.isArray(manifest.optional)
      ? manifest.optional
          .filter((v): v is string => typeof v === "string")
          .map((v) => toFuid(v))
          .filter(Boolean)
      : [];

    // Import themes from themes/ folder
    const importedThemes: PackTheme[] = [];
    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir || !path.startsWith("themes/")) continue;
      const parts = path.split("/");
      if (parts.length < 2 || !parts[1].endsWith(".json")) continue;

      let raw: unknown;
      try {
        const text = await zipEntry.async("text");
        raw = JSON.parse(text);
      } catch {
        continue;
      }

      const result = decodeThemeFile(raw);
      if (!result.ok) continue;

      const { payload } = result;
      importedThemes.push({
        id: crypto.randomUUID(), // fresh ID on import
        name: payload.name,
        description: payload.description,
        baseTheme: payload.baseTheme,
        styleProfile: payload.styleProfile,
        isDarkMode: payload.isDarkMode,
        customization: { ...DEFAULT_CUSTOMIZATION, ...payload.customization },
        addedAt: now,
      });
    }

    const pack: CompendiumPack = {
      id: packId,
      fuid: importedFuid || toFuid(packName) || "pack",
      name: packName,
      description:
        typeof manifest.description === "string"
          ? manifest.description.trim() || undefined
          : undefined,
      author:
        typeof manifest.author === "string"
          ? manifest.author.trim() || undefined
          : undefined,
      type: packType,
      version:
        typeof manifest.version === "string"
          ? manifest.version.trim() || undefined
          : undefined,
      requiresManual: importedRequires,
      requiresAuto: [],
      requires: importedRequires,
      optional: importedOptional,
      isPersonal: false,
      createdAt:
        typeof manifest.createdAt === "number" ? manifest.createdAt : now,
      updatedAt: now,
      items,
      themes: importedThemes,
    };
    await savePack(finalizePackRequires(pack));

    return packId;
  }, []);

  const importFromManifestUrl = useCallback(
    async (url: string): Promise<string> => {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        throw new Error("Invalid URL format");
      }
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("URL must use http or https");
      }

      const manifestResp = await fetch(url);
      if (!manifestResp.ok)
        throw new Error(`Failed to fetch manifest: ${manifestResp.status}`);

      let manifest: Record<string, unknown>;
      try {
        manifest = await manifestResp.json();
      } catch {
        throw new Error("Failed to parse manifest response as JSON");
      }

      if (!manifest.downloadUrl || typeof manifest.downloadUrl !== "string") {
        throw new Error("Manifest missing downloadUrl");
      }

      try {
        const dlUrl = new URL(manifest.downloadUrl);
        if (!["http:", "https:"].includes(dlUrl.protocol)) {
          throw new Error("downloadUrl must use http or https");
        }
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("downloadUrl")) throw e;
        throw new Error("Manifest contains an invalid downloadUrl");
      }

      const packResp = await fetch(manifest.downloadUrl);
      if (!packResp.ok)
        throw new Error(`Failed to fetch pack: ${packResp.status}`);
      const blob = await packResp.blob();
      return importFromFile(
        new File([blob], "pack.fcp", { type: "application/zip" }),
      );
    },
    [importFromFile],
  );

  return {
    packs,
    loading,
    personalPack,
    ensurePersonalPack,
    createPack,
    updatePack,
    deletePack,
    setPackActive,
    toggleLock,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    addTheme,
    removeTheme,
    applyTheme,
    exportAsModule,
    importFromFile,
    importFromManifestUrl,
  };
}
