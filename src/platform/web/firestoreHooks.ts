// react-firebase-hooks v5 removed the `idField` option. These wrappers restore
// it with a Firestore converter so callers keep receiving the document id.

import type {
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  Query,
} from "firebase/firestore";
import {
  useCollectionData as useCollectionDataBase,
  useDocumentData as useDocumentDataBase,
} from "react-firebase-hooks/firestore";

type IdOptions = { idField?: string };

// One converter per field name: the hooks compare queries by converter
// identity, so a new converter each render would resubscribe every render.
const converters = new Map<string, FirestoreDataConverter<DocumentData>>();

function idConverter(field: string): FirestoreDataConverter<DocumentData> {
  let converter = converters.get(field);
  if (!converter) {
    converter = {
      toFirestore: (data) => data,
      fromFirestore: (snapshot, options) => ({
        ...snapshot.data(options),
        [field]: snapshot.id,
      }),
    };
    converters.set(field, converter);
  }
  return converter;
}

export function useCollectionData(query?: Query | null, options?: IdOptions) {
  const field = options?.idField;
  return useCollectionDataBase(
    field && query ? query.withConverter(idConverter(field)) : query,
  );
}

export function useDocumentData(
  ref?: DocumentReference | null,
  options?: IdOptions,
) {
  const field = options?.idField;
  return useDocumentDataBase(
    field && ref ? ref.withConverter(idConverter(field)) : ref,
  );
}
