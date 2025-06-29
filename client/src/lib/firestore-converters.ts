// client/src/lib/firestore-converters.ts
import {
  type DocumentData,
  type FirestoreDataConverter,
  type PartialWithFieldValue,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

// This generic converter is constrained to only accept types
// that are compatible with Firestore's DocumentData.[2]
export const converter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
  toFirestore(data: PartialWithFieldValue<T>): DocumentData {
    // When writing data, we pass the object through.
    // `PartialWithFieldValue` allows for using FieldValues like `deleteField()`
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<T>): T {
    // The `snapshot.data()` method will now return a fully typed object.
    return snapshot.data();
  }
});