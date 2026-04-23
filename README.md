# Komonity

顧問の先生と指導者をつなぐ、相談・投稿・コミュニティ型サービスのプロトタイプです。

`Expo + React Native + TypeScript` で構成しており、Web / iOS / Android で動かせる想定です。

## 動作環境

- Node.js 20 以上を推奨
- npm

## 画面が表示されるまでの手順

Git からクローンしてコードだけが手元にある状態を想定しています。

### 1. プロジェクトディレクトリへ移動

```bash
cd advisor-community-service
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. Web で起動

もっとも簡単に画面確認する方法です。

```bash
npm run web
```

起動後、ターミナルに表示されるURLをブラウザで開くと画面が表示されます。

## Expo 開発サーバーを起動する方法

Expo のメニューを使って Web / iOS / Android を切り替えたい場合は、以下でも起動できます。

```bash
npm start
```

起動後の操作例:

- `w`: Web で開く
- `i`: iOS シミュレータで開く
- `a`: Android エミュレータで開く

## iOS / Android で起動する場合

### iOS

```bash
npm run ios
```

前提:

- macOS
- Xcode
- iOS Simulator

### Android

```bash
npm run android
```

前提:

- Android Studio
- Android Emulator

## 型チェック

```bash
npm run typecheck
```

## Firebase Authentication 連携手順

このアプリは `Firebase Authentication` の `Email/Password` を使う前提です。
あわせて、登録したプロフィール情報は `Cloud Firestore` に、投稿に添付した画像・動画は `Firebase Storage` に保存する想定です。

### 1. Firebase プロジェクトを作成する

1. [Firebase console](https://console.firebase.google.com/) を開く
2. `プロジェクトを追加` を押す
3. 新規作成するか、既存の Google Cloud プロジェクトに Firebase を追加する

公式:

- [既存の Google Cloud project に Firebase を追加](https://firebase.google.com/docs/projects/use-firebase-with-existing-cloud-project)

### 2. Web アプリを Firebase に登録する

1. Firebase console で対象プロジェクトを開く
2. `プロジェクトの設定` を開く
3. `アプリを追加` から `Web` を選ぶ
4. アプリ名を入力して登録する
5. 表示される `firebaseConfig` を控える

### 3. Authentication を有効にする

1. Firebase console で `Authentication` を開く
2. `Sign-in method` を開く
3. `Email/Password` を有効化して保存する

公式:

- [Get Started with Firebase Authentication on Websites](https://firebase.google.com/docs/auth/web/start)
- [Email/Password 認証](https://firebase.google.com/docs/auth/web/password-auth)

### 4. Firestore Database を作成する

1. Firebase console で `Firestore Database` を開く
2. `データベースを作成` を押す
3. ロケーションを選択する
4. 開発中はテストモード、本番ではルールを適切に設定する

このアプリでは登録完了時に `users` コレクションへプロフィールを保存します。

公式:

- [Cloud Firestore にデータを追加](https://firebase.google.com/docs/firestore/manage-data/add-data)

### 5. 環境変数を設定する

`.env.example` を元に `.env` を作成してください。

```bash
cp .env.example .env
```

`.env` に Firebase console で確認した値を設定します。

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

`EXPO_PUBLIC_FIREBASE_APP_ID` には `Measurement ID` ではなく `App ID` を入れてください。
正しい例は `1:1234567890:web:abcdef123456` の形式です。
`G-XXXXXXXXXX` の形式は `Measurement ID` なので別物です。

### 6. Firebase Storage を有効にする

1. Firebase console で `Storage` を開く
2. `始める` を押す
3. バケットのロケーションを選択する
4. まずは開発用ルールで開始し、あとで公開範囲に合わせて調整する

このアプリでは、投稿画面から選んだ画像・動画を Storage に保存し、その URL を Firestore の投稿ドキュメントに保存します。

公式:

- [Cloud Storage for Firebase を Web で使う](https://firebase.google.com/docs/storage/web/start)

### 7. 依存関係を入れて起動する

```bash
npm install
npm run web
```

### 8. アプリでできること

- 顧問登録ページから `createUserWithEmailAndPassword` でアカウント作成
- 指導員登録ページから `createUserWithEmailAndPassword` でアカウント作成
- ログインページから `signInWithEmailAndPassword` でログイン
- 登録時のプロフィール情報を Firestore の `users` コレクションへ保存
- 投稿時に画像・動画を Firebase Storage へ保存
- 投稿本文と添付メディアURLを Firestore の公開投稿コレクションへ保存

## Firestore の保存構造

Firestore はスキーマレスなので、MySQL のように事前にカラムを作る必要はありません。
このアプリでは、登録やプロフィール更新が成功した時に必要なドキュメントとフィールドを自動で作成します。

作成される主なコレクション:

- `users`
- `timeline_posts`
- `question_posts`
- `community_posts`
- `follows`
- `post_likes`
- `post_reposts`
- `post_bookmarks`

主なドキュメント構造:

```txt
users/{uid}
  role
  profile
    nickname
    club or specialty
    experience
    achievements
    phone
    publicEmail
    selectedSports
    externalLinks
    iconPreviewEnabled
    bio
    link
  auth
    loginEmail
  visibility
    phonePublic
    emailPublic
  createdAt
  updatedAt
```

```txt
timeline_posts/{postId}
  type
  author
  authorHandle
  role
  title
  body
  tags
  sports
  likes
  reposts
  comments
  replies
  media
  createdByUid
  visibility
  createdAt
  updatedAt
```

```txt
question_posts/{postId}
  type
  category
  title
  body
  author
  authorHandle
  role
  answers
  bestAnswer
  replies
  media
  sports
  createdByUid
  visibility
  createdAt
  updatedAt
```

```txt
community_posts/{postId}
  type
  title
  body
  author
  authorHandle
  role
  cta
  replies
  media
  sports
  createdByUid
  visibility
  createdAt
  updatedAt
```

```txt
follows/{followerUid__followingUid}
  followerUid
  followerName
  followingUid
  followingName
  createdAt
```

```txt
post_likes/{userUid__source__postId}
  userUid
  postId
  source
  createdAt
```

```txt
post_reposts/{userUid__source__postId}
  userUid
  postId
  source
  createdAt
```

```txt
post_bookmarks/{userUid__source__postId}
  userUid
  postId
  source
  createdAt
```

つまり、Firestore Database を有効にした状態でこのアプリから登録や更新を実行すれば、必要な項目は自動で保存されます。

他のユーザーからも投稿を閲覧できるようにするには、Firestore ルールで公開投稿コレクションの `read` を許可する必要があります。
さらに、このアプリでは

- 投稿の新規作成
- 投稿への返信追加
- いいね
- 再投稿
- 保存

を行うため、投稿コレクションの `update` と、操作用コレクションの `create/delete` も必要です。最低限の例は以下です。

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow create, update: if request.auth != null && request.auth.uid == userId;
    }

    match /timeline_posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }

    match /question_posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }

    match /community_posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }

    match /follows/{followId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.followerUid == request.auth.uid;
      allow delete: if request.auth != null;
    }

    match /post_likes/{likeId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userUid == request.auth.uid;
      allow delete: if request.auth != null;
    }

    match /post_reposts/{repostId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userUid == request.auth.uid;
      allow delete: if request.auth != null;
    }

    match /post_bookmarks/{bookmarkId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userUid == request.auth.uid;
      allow delete: if request.auth != null;
    }
  }
}
```

Firebase console の `Firestore Database` → `ルール` で、この内容に更新して `公開` してください。

Storage にも、ログイン済みユーザーが投稿メディアやプロフィール画像をアップロードできるルールが必要です。最低限の例は以下です。

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /post-media/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /reply-media/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /profile-icons/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /profile-covers/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

`profile-icons` はアイコン画像、`profile-covers` はプロフィール上部のヘッダー画像で使います。プロフィール画像やヘッダー画像の保存で `403 Forbidden` が出る場合は、このルールが未反映であることが多いです。

## Firebase 連携ファイル

- Firebase 初期化: [src/lib/firebase.ts](/Users/kazu/Documents/advisor-community-service/src/lib/firebase.ts)
- 認証と登録画面: [App.tsx](/Users/kazu/Documents/advisor-community-service/App.tsx)
- 環境変数ひな形: [.env.example](/Users/kazu/Documents/advisor-community-service/.env.example)

## よく使うコマンド

```bash
npm install
npm run web
npm start
npm run ios
npm run android
npm run typecheck
```

## うまく起動しないとき

### `npm install` で失敗する

- Node.js のバージョンが古い可能性があります
- `node -v` で確認し、Node.js 20 以上を使用してください

### Web が開かない

- 先に `npm run web` を再実行してください
- ターミナルに表示されたローカルURLを直接ブラウザで開いてください

### iOS / Android が開かない

- シミュレータやエミュレータのセットアップが必要です
- まずは `npm run web` で画面確認するのがおすすめです

## 現在の実装範囲

このリポジトリはフロントエンドのプロトタイプです。現時点では以下は未実装です。

- バックエンド
- 認証
- データベース
- 通知
- 本番向けインフラ

安全性の観点から、個人情報やなりすまし対策が必要になる1対1の連絡機能や練習試合のマッチング機能は現時点では含めていません。

将来的には `Firebase Authentication`、`Firestore`、`Firebase Storage`、`Cloud Functions for Firebase` などを組み合わせる想定です。
