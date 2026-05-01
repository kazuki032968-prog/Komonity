import { deleteObject, getDownloadURL, ref, uploadBytes, type FirebaseStorage } from "firebase/storage";

import type { LocalMediaAsset, MediaAttachment } from "../../types/app";

type ProfileMediaKind = "icon" | "cover";
type PostMediaFolder = "post-media" | "reply-media";

/**
 * プロフィール用の画像を Firebase Storage にアップロードし、公開URLを返します。
 * すでに http(s) URL の場合は既存画像として扱い、再アップロードしません。
 */
export const uploadProfileMedia = async ({
  storage,
  uid,
  uri,
  kind,
}: {
  storage: FirebaseStorage | null;
  uid: string;
  uri: string;
  kind: ProfileMediaKind;
}) => {
  if (!uri) {
    return "";
  }

  if (/^https?:\/\//u.test(uri)) {
    return uri;
  }

  if (!storage) {
    throw new Error("storage-not-configured");
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  const storagePath =
    kind === "icon"
      ? `profile-icons/${uid}/${Date.now()}-avatar.jpg`
      : `profile-covers/${uid}/${Date.now()}-cover.jpg`;
  const mediaRef = ref(storage, storagePath);

  await uploadBytes(mediaRef, blob, {
    contentType: blob.type || "image/jpeg",
  });

  return getDownloadURL(mediaRef);
};

/**
 * 投稿・返信に添付する画像/動画を Storage に保存し、Firestore 保存用のメディア配列へ変換します。
 */
export const uploadMediaAssets = async ({
  storage,
  uid,
  media,
  folder,
}: {
  storage: FirebaseStorage | null;
  uid: string;
  media: LocalMediaAsset[];
  folder: PostMediaFolder;
}): Promise<MediaAttachment[]> => {
  if (!storage || media.length === 0) {
    return [];
  }

  return Promise.all(
    media.map(async (asset, index) => {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const safeName = asset.fileName.replace(/\s+/g, "-");
      const storagePath = `${folder}/${uid}/${Date.now()}-${index}-${safeName}`;
      const mediaRef = ref(storage, storagePath);

      await uploadBytes(mediaRef, blob, {
        contentType: asset.mimeType ?? undefined,
      });

      const url = await getDownloadURL(mediaRef);

      return {
        kind: asset.kind,
        url,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        storagePath,
        width: asset.width,
        height: asset.height,
      };
    })
  );
};

/**
 * Storage のダウンロードURLからファイルを削除します。
 * すでに存在しないファイルは成功扱いにして、削除処理を止めないようにします。
 */
export const deleteStorageFileByUrl = async (
  storage: FirebaseStorage | null,
  url: string
) => {
  if (!url || !storage || !/^https?:\/\//u.test(url)) {
    return;
  }

  try {
    await deleteObject(ref(storage, url));
  } catch (error) {
    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : "";

    if (errorCode.includes("object-not-found")) {
      return;
    }

    throw error;
  }
};

/**
 * 複数の Storage ファイルを削除します。個別ファイルの削除失敗は握りつぶし、
 * Firestore 側の削除フローを継続できるようにしています。
 */
export const deleteStorageFilesQuietly = async (
  storage: FirebaseStorage | null,
  urls: string[]
) => {
  await Promise.all(
    urls.map(async (url) => {
      try {
        await deleteStorageFileByUrl(storage, url);
      } catch {
        // Storage 側の一時的な失敗でアカウント削除全体を止めないため、個別エラーは無視します。
      }
    })
  );
};
