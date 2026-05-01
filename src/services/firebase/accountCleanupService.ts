import {
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
  type Firestore,
} from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

import { COLLECTIONS } from "../../constants/app";
import { normalizeMedia, normalizeReplies } from "../serializers";
import type { Reply } from "../../types/app";
import { deleteStorageFilesQuietly } from "./storageService";

const postCollectionNames = [
  COLLECTIONS.feed,
  COLLECTIONS.questions,
  COLLECTIONS.community,
] as const;

/**
 * 返信ツリーに含まれる添付メディアURLを再帰的に集めます。
 */
export const collectReplyMediaUrls = (replies: Reply[]): string[] =>
  replies.flatMap((reply) => [
    ...(reply.media?.map((item) => item.url) ?? []),
    ...(reply.replies ? collectReplyMediaUrls(reply.replies) : []),
  ]);

/**
 * Firestore の投稿ドキュメントから、投稿本体と返信ツリーのメディアURLを集めます。
 */
export const collectPostMediaUrlsFromDocument = (
  data: Record<string, unknown>
) => [
  ...normalizeMedia(data.media).map((item) => item.url),
  ...collectReplyMediaUrls(normalizeReplies(data.replies)),
];

/**
 * 退会時に、本人が作成した投稿と投稿に添付されたメディアをまとめて削除します。
 * Firestore の投稿ドキュメントを削除する前に URL を集め、削除後に Storage の実体も掃除します。
 */
export const deleteOwnedPostsAndMedia = async ({
  db,
  storage,
  uid,
}: {
  db: Firestore | null;
  storage: FirebaseStorage | null;
  uid: string;
}) => {
  if (!db) {
    return;
  }

  const ownedPostSnapshots = await Promise.all(
    postCollectionNames.map(async (collectionName) => ({
      collectionName,
      snapshot: await getDocs(
        query(collection(db, collectionName), where("createdByUid", "==", uid))
      ),
    }))
  );

  const mediaUrls = ownedPostSnapshots.flatMap(({ snapshot }) =>
    snapshot.docs.flatMap((postDoc) =>
      collectPostMediaUrlsFromDocument(postDoc.data())
    )
  );

  await Promise.all(
    ownedPostSnapshots.flatMap(({ snapshot }) =>
      snapshot.docs.map((postDoc) => deleteDoc(postDoc.ref))
    )
  );
  await deleteStorageFilesQuietly(storage, mediaUrls);
};
