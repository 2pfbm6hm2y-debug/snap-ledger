# Snap Ledger

A personal expense ledger for iPhone that runs entirely on the phone. It reads card
statement screenshots and PDF e-statements on-device, picks out each transaction,
lets you review and approve them in a batch, and tracks spending by category and
card against monthly budgets. Nothing is uploaded and no AI service is called.

## Put it online (GitHub Pages, free)

1. Sign in at github.com (or create a free account).
2. Create a new repository named `snap-ledger`, set to **Public**.
3. On the empty repo page, click **uploading an existing file**. Drag in everything
   inside this folder (the files and the `icons` and `lib` folders, not the outer
   folder itself). Click **Commit changes**.
4. Go to **Settings > Pages**. Under "Build and deployment", set Source to
   **Deploy from a branch**, Branch to **main** and folder **/ (root)**. Save.
5. After a minute the site is live at `https://YOUR-USERNAME.github.io/snap-ledger/`.

## Install on your iPhone

1. Open that address in **Safari**.
2. Tap **Share**, then **Add to Home Screen**.
3. Open it from the new home-screen icon while online once, so it can finish
   downloading the text reader. After that it works offline.

Always open it from the home-screen icon. Its data is kept separately from Safari.

## Set up your cards

Add each card in the **Cards** tab with its last 4 digits (if a card's app shows
more than 4 digits, enter the last 4). For an e-wallet, choose **E-wallet** and
leave the digits empty. You can then add screenshots from all
your cards in one go, and the app works out which card each screenshot belongs to.

## Balances and transfers

To track what you have and owe, tap **Add balance** on a card or account and copy the
figure from your bank app. From then on, spending, income and transfers move the
balance. Update it now and then, and a correction entry makes up any difference so it
matches your bank again. Card payments and wallet top-ups are transfers: they move
money between your own accounts and never count as spending.

## Spending outside the monthly budget

In the **Budget** tab, mark categories that sit outside the monthly budget (Special
Spending is one by default). They still count toward balances, and Stats shows a
running total for the year instead.

## Your data

Everything is stored on the phone. Use **Settings > Back up now** from time to time
and save the file to Files or iCloud Drive. **Restore backup** brings it back on a
new phone.

## Updating

Upload changed files to the same repository. The app picks up the new version the
next time it opens while online.

## Third-party components

- Tesseract OCR engine (tesseract.js-core) and English language data (tessdata_fast),
  Apache License 2.0. See `lib/LICENSE-tesseract-js-core.txt` and `lib/LICENSE-tessdata.txt`.
- PDF.js by Mozilla, Apache License 2.0. See `lib/LICENSE-pdfjs.txt`.
