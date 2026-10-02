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
money between your own accounts and never count as spending. Under Net, the Cards tab projects where
it will be at the end of the month: income still to come, less spending still to come if
every budget is used up.

## Paid for work or friends

On an expense, set **Paid back by** to Work or Friends, with the whole amount or just
their part of a split bill. Only your share counts as spending, while the card still
takes the full charge. When money comes back, record a **Payback** (or change a scanned
incoming payment to Payback) and tick what it pays for: one meal several friends are
paying back bit by bit, or all the claims covered by a lump sum from work. With nothing
ticked, a payback clears the oldest claims first. The Cards tab shows what's still owed
to you, and each claim shows how much of it has come back.

## Monthly bills

Bills that land once a month, like rent or utilities, can be marked **monthly** in the
Budget tab, even if each month's total comes in several payments. Stats checks them
against their own budget only and leaves them out of the daily pace, so they stay green
until they go over. If one comes in over budget, the difference comes out of what's left for daily
spending. Projected savings count each one at its budget until it comes in higher.

## Stats

Stats opens with today's allowance for your daily categories and what they've spent so
far, with a cheer when you've kept within it on recent days. The allowance is your daily
budget, or less when you need to make up for spending above plan or a monthly bill over
budget. Below that is one bar
for the whole month's budget, with a marker for where today's plan is. Below
it are your categories in your own order, each with one status in words, and a switch
to see spending by card. Tap the month or any category to see it day by day and over the
last six months. Savings shows this month's projection against your target (expected
income minus your monthly budgets) and the months before it, and the running total for Special Spending sits at the bottom.

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
