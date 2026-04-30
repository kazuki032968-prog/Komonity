import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const distDir = resolve(rootDir, "dist");
const indexPath = resolve(distDir, "index.html");
const ogImageSourcePath = resolve(rootDir, "assets", "logo-komonity-header.png");
const ogImageOutputPath = resolve(distDir, "ogp.png");

const siteUrl = "https://komonity-510b7.web.app";
const title = "Komonity | 顧問の先生と指導者をつなぐ部活支援SNS";
const description =
  "Komonityは、専門外の部活指導で悩む顧問の先生と知見を持つ指導者をつなぎ、練習メニュー・戦術・相談・コミュニティで現場の知見を共有できるサービスです。";
const ogImageUrl = `${siteUrl}/ogp.png`;

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

if (!existsSync(indexPath)) {
  throw new Error("dist/index.html が見つかりません。先に expo export を実行してください。");
}

if (existsSync(ogImageSourcePath)) {
  copyFileSync(ogImageSourcePath, ogImageOutputPath);
}

let html = readFileSync(indexPath, "utf8");

html = html.replace("<html lang=\"en\">", "<html lang=\"ja\">");
html = html.replace(/<title>.*?<\/title>/u, `<title>${escapeHtml(title)}</title>`);
html = html.replace(
  "You need to enable JavaScript to run this app.",
  "Komonityを利用するにはJavaScriptを有効にしてください。"
);

const metaBlock = `
    <!-- komonity-seo:start -->
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="${siteUrl}" />
    <meta property="og:site_name" content="Komonity" />
    <meta property="og:locale" content="ja_JP" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${siteUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:alt" content="Komonity のロゴ" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <!-- komonity-seo:end -->`;

html = html.replace(
  /\n\s*<!-- komonity-seo:start -->[\s\S]*?<!-- komonity-seo:end -->/u,
  ""
);
html = html.replace(
  /(<meta name="viewport"[^>]*\/>)/u,
  `$1${metaBlock}`
);

writeFileSync(indexPath, html);
