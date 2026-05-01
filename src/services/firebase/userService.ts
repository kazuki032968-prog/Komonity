import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  type Firestore,
} from "firebase/firestore";

import { COLLECTIONS, FIRESTORE_SAVE_TIMEOUT_MS, SUPPORT_EMAIL_ADDRESS } from "../../constants/app";

/**
 * users/{uid} にプロフィール情報を保存します。
 * 保存が長時間返らないケースを避けるため、一定時間でタイムアウトさせます。
 */
export const saveProfileDocument = async ({
  db,
  uid,
  data,
}: {
  db: Firestore | null;
  uid: string;
  data: object;
}) => {
  if (!db) {
    return;
  }

  await Promise.race([
    setDoc(doc(db, "users", uid), data, { merge: true }),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("firestore-save-timeout"));
      }, FIRESTORE_SAVE_TIMEOUT_MS);
    }),
  ]);
};

/**
 * Firebase Extension の Trigger Email が読む mail コレクションへ送信指示を追加します。
 */
export const queueSupportEmail = async ({
  db,
  subject,
  text,
  replyTo,
}: {
  db: Firestore | null;
  subject: string;
  text: string;
  replyTo?: string;
}) => {
  if (!db) {
    return;
  }

  await addDoc(collection(db, COLLECTIONS.mail), {
    to: [SUPPORT_EMAIL_ADDRESS],
    replyTo: replyTo ? [replyTo] : undefined,
    message: {
      subject,
      text,
    },
    createdAt: serverTimestamp(),
  });
};
