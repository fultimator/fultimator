// Hook for managing Compendium Packs stored in IndexedDB ("compendium-packs" store).
// Always local — never synced to Firestore, but included in Drive backup via STORES.
  // Pack CRUD
import { useState, useEffect, useCallback } from "react";
import { getDb, notifyListeners, subscribeToStore } from "../platform/idb";
import type { CompendiumPack, CompendiumItem, CompendiumItemType, PackType } from "../types/CompendiumPack";
import { validateManifest } from "../utils/validateCompendiumPack";
  // Item operations
const STORE = "compendium-packs";
const PERSONAL_ID = "personal";
  // Module I/O
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
    setPacks(all);
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
    };
    try {
      const db = await getDb();
      await db.add(STORE, pack); // throws on duplicate key (race condition)
      notifyListeners(STORE);
      return pack;
    } catch {
      // Another concurrent call already created it — return the existing one
      const refreshed = await getAllPacks();
      return refreshed.find((p) => p.id === PERSONAL_ID)!;
    }
  }, []);

  const createPack = useCallback(
    async (name: string, description?: string): Promise<string> => {
      const id = crypto.randomUUID();
      const now = Date.now();
      const pack: CompendiumPack = {
        id,
        name,
        description,
        isPersonal: false,
        createdAt: now,
        updatedAt: now,
        items: [],
      };
      await savePack(pack);
      return id;
    },
    []
  );

  const updatePack = useCallback(
    async (id: string, changes: Partial<Pick<CompendiumPack, "name" | "description" | "author">>): Promise<void> => {
      const all = await getAllPacks();
      const pack = all.find((p) => p.id === id);
      if (!pack) return;
      await savePack({ ...pack, ...changes, updatedAt: Date.now() });
    },
    []
  );

  const setPackActive = useCallback(async (id: string, active: boolean): Promise<void> => {
    const all = await getAllPacks();
    const pack = all.find((p) => p.id === id);
    if (!pack) return;
    await savePack({ ...pack, active, updatedAt: Date.now() });
  }, []);

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
    async (packId: string, type: CompendiumItemType, data: unknown): Promise<void> => {
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
          (i) => i.type === type && i.data.id === incoming.id
        );
        if (duplicate) {
          const itemName = typeof incoming.name === "string" ? incoming.name : "Item";
          throw new Error(`"${itemName}" is already in "${pack.name}"`);
        }
      }

      const item: CompendiumItem = {
        id: crypto.randomUUID(),
        type,
        data: incoming,
        addedAt: Date.now(),
      };
      await savePack({
        ...pack,
        items: [...pack.items, item],
        updatedAt: Date.now(),
      });
    },
    [ensurePersonalPack]
  );

  const updateItem = useCallback(async (packId: string, itemId: string, newData: unknown): Promise<void> => {
    const all = await getAllPacks();
    const pack = all.find((p) => p.id === packId);
    if (!pack) return;
    await savePack({
      ...pack,
      items: pack.items.map((i) => i.id === itemId ? { ...i, data: newData as Record<string, unknown> } : i),
      updatedAt: Date.now(),
    });
  }, []);

  const removeItem = useCallback(async (packId: string, itemId: string): Promise<void> => {
    const all = await getAllPacks();
    const pack = all.find((p) => p.id === packId);
    if (!pack) return;
    await savePack({
      ...pack,
      items: pack.items.filter((i) => i.id !== itemId),
      updatedAt: Date.now(),
    });
  }, []);

  const moveItem = useCallback(
    async (itemId: string, fromPackId: string, toPackId: string): Promise<void> => {
      const all = await getAllPacks();
      const fromPack = all.find((p) => p.id === fromPackId);
      const toPack = all.find((p) => p.id === toPackId);
      if (!fromPack || !toPack) return;

      const item = fromPack.items.find((i) => i.id === itemId);
      if (!item) return;

      const db = await getDb();
      const tx = db.transaction(STORE, "readwrite");
      await tx.store.put({ ...fromPack, items: fromPack.items.filter((i) => i.id !== itemId), updatedAt: Date.now() });
      await tx.store.put({ ...toPack, items: [...toPack.items, { ...item, addedAt: Date.now() }], updatedAt: Date.now() });
      await tx.done;
      notifyListeners(STORE);
    },
    []
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
      } = {}
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
            ? baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
            : "item";
          const filename = `${baseSlug}-${item.id.slice(0, 8)}.json`;
          typeFolder.file(filename, JSON.stringify(item.data, null, 2));
        }
      }

      const manifest = {
        id: pack.id,
        name: pack.name,
        version: meta.version ?? "1.0.0",
        type: (pack.type ?? "compendium") as PackType,
        author: pack.author ?? "",
        description: pack.description ?? "",
        homepageUrl: meta.homepageUrl ?? "",
        manifestUrl: meta.manifestUrl ?? "",
        downloadUrl: meta.downloadUrl ?? "",
        fultimatorMinVersion: "2.0.0",
        createdAt: pack.createdAt,
      };
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const packSlug = pack.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      a.href = url;
      a.download = `${packSlug}.fcp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    []
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
    if (!manifestFile) throw new Error("Invalid .fcp file: missing manifest.json");

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

    const validTypes: CompendiumItemType[] = ["npc-attack", "npc-spell", "weapon", "armor", "shield", "player-spell", "quality", "class", "heroic"];
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
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) continue;
        data = parsed as Record<string, unknown>;
      } catch {
        continue; // skip corrupt item files silently
      }
      items.push({ id: crypto.randomUUID(), type, data, addedAt: now });
    }

    const rawType = manifest.type;
    const packType: PackType = rawType === "supplement" ? "supplement" : "compendium";

    const pack: CompendiumPack = {
      id: packId,
      name: (manifest.name as string).trim(),
      description: typeof manifest.description === "string" ? manifest.description.trim() || undefined : undefined,
      author: typeof manifest.author === "string" ? manifest.author.trim() || undefined : undefined,
      type: packType,
      version: typeof manifest.version === "string" ? manifest.version.trim() || undefined : undefined,
      isPersonal: false,
      createdAt: typeof manifest.createdAt === "number" ? manifest.createdAt : now,
      updatedAt: now,
      items,
    };
    await savePack(pack);
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
      if (!manifestResp.ok) throw new Error(`Failed to fetch manifest: ${manifestResp.status}`);

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
      if (!packResp.ok) throw new Error(`Failed to fetch pack: ${packResp.status}`);
      const blob = await packResp.blob();
      return importFromFile(new File([blob], "pack.fcp", { type: "application/zip" }));
    },
    [importFromFile]
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
    exportAsModule,
    importFromFile,
    importFromManifestUrl,
  };
}
