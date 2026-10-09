# Snap Ledger

Your money, sorted, without the busywork. A personal expense ledger for iPhone that
runs entirely on the phone.

- **Convenient.** Snap a screenshot or PDF statement and it's read on the phone, matched
  to the card and categorised. Bank alert emails (DBS, PayLah!, Citi) can come in on
  their own.
- **Insightful.** Your budget becomes what you can spend today. See where the month will
  end, what each day did to it, and why you're short if you are.
- **Robust.** Balances match your bank app. Card bills and transfers aren't counted as
  spending, duplicates are caught, and money paid back isn't counted as income.
- **Private.** Your data stays on the phone: no sign-up, no ads, no AI service.

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

## Choose how deep to go

The first time you open it, pick how much you want from it. You can change this any
time in **Settings > Your setup**, and nothing you've entered is lost.

- **Track spending:** see where your money goes, by category and card.
- **Stick to a budget:** plus monthly budgets and how much you can spend each day.
- **Save and plan:** plus a savings target, balances that match your bank, transfers,
  paybacks and where the month will end.

A short checklist on the Ledger walks you through setting up what you picked, one
step at a time, and ticks each step off as you do it.

## Set up your cards

Add each card in the **Cards** tab with its last 4 digits (if a card's app shows
more than 4 digits, enter the last 4). For an e-wallet, choose **E-wallet** and
leave the digits empty. You can then add screenshots from all
your cards in one go, and the app works out which card each screenshot belongs to.

## Balances and transfers

To track what you have and owe, tap **Add balance** on a card or account and copy the
figure from your bank app. From then on, spending, income and transfers move the
balance. Check it now and then. If your bank app shows the same figure, tap **Confirm balance**
and the card is marked as checked today, with no typing. If it's different, tap **Update balance**
and enter the figure, and a correction entry makes up the difference so it matches your bank again.
The pencil in a card's corner edits it, and **Transactions** at the bottom opens its entries.
Card payments and wallet top-ups are transfers: they move
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
last six months. Savings leads with **gross savings**: income less everything except special
spending, projected for this month and checked against your target (expected income minus
your monthly budgets). Stick to your budgets and you hit the target, however big a one-off
purchase is. Below it, special spending comes off to give **net savings**, which matches your
balances and the end-of-month projection in Cards. Each month's bar is gross savings: the
solid part is net savings and the hollow part is what special spending took, against the
target line. At the bottom, the year so far: gross savings, less special spending, gives net
savings. Tap special spending to see it month by month, and a month to see its entries.

## Spending outside the monthly budget

In the **Budget** tab, mark categories that sit outside the monthly budget (Special
Spending is one by default). They still count toward balances and net savings, but not
toward gross savings or your target. Stats shows them in the year-so-far recap under Savings.

## Payments from email

Snap Ledger can bring in payments from your bank's alert emails, so you don't type them.
It reads DBS card, PayLah! and Citi card alerts for now. A small script (`email-inbox.gs`) runs in your own
Google account: when the app asks with its secret key, the script looks for emails from
your banks' addresses since the last check and sends their text to the phone. It only
reads, keeps nothing, and ignores every other email.

Set it up once in **Settings > Payments from email**: copy the setup script, paste it
into a new project at script.google.com, deploy it as a web app (Execute as Me, Who has
access Anyone), and paste the Web app URL back into the app. After that the app checks
whenever you open it, and a banner shows new payments to review before they're added.
The link and key stay on the phone and aren't part of backups.

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
