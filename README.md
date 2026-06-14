# 副業スタート案内所

副業初心者向けに、note記事、Brain教材、作業環境、AI活用に関する記事を目的別に整理する静的ブログサイトです。

## 内容

- トップページの記事一覧、カテゴリ、媒体タグ、目的タグによる絞り込み
- 記事詳細ページ
- PR表記、購入済み表示、元記事日表示
- SEO向けメタ情報、OGP、構造化データ
- AI検索向け `llms.txt`

## PR・広告表記について

このサイトには、PR表記のあるアフィリエイト広告リンクや外部販売ページへのリンクが含まれます。各記事カードと記事本文の冒頭に必要な表示を行います。

## ローカル確認

`index.html` をブラウザで開くとトップページを確認できます。記事詳細は `article.html?id=記事ID` の形式で表示します。

JavaScriptの構文確認は以下で実行できます。

```bash
node --check scripts/app.js
```

## GitHub Pages

`index.html` がリポジトリルートにあるため、GitHub Pagesでは `main` ブランチの `/root` を指定すれば公開できます。独自ドメインや公開URLが決まった後に、`sitemap.xml`、canonical URL、OGP画像の絶対URLを追加してください。

## 元サイトから公開用フォルダへ同期

元の作業フォルダ `C:\Users\User1\副業\side_business-local\会社\開発部\sales-site` を更新した後は、公開用フォルダで以下を実行してください。

```powershell
.\sync-public-site.ps1
```

このスクリプトは公開対象ファイルだけを allowlist 方式でコピーします。会社データ、日報、業務ログ、未使用画像はコピーしません。

同期後は差分を確認してからコミット・pushします。

```bash
git status
git add .
git commit -m "Update public sales site"
git push
```

## 元サイト更新時に自動同期する

元の作業フォルダの変更を監視して、公開用フォルダへ自動同期したい場合は、公開用フォルダで以下を実行します。

```powershell
.\watch-public-site.ps1
```

この監視は、起動しているPowerShellを閉じるまで有効です。変更を検知すると `sync-public-site.ps1` を呼び出し、公開対象ファイルだけを同期します。自動コミットや自動pushは行いません。

動作確認だけしたい場合は、1回だけ同期して終了できます。

```powershell
.\watch-public-site.ps1 -Once
```

