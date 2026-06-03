# 🏆 World Cup 2026 Pool

A fully themed FIFA World Cup 2026 pool website. Participants pick 2 teams from each of 3 tiers (16 teams each, ranked by FIFA world ranking), then score points as their teams advance through the tournament.

## Files
- `index.html` — main site (all pages in one file)
- `style.css` — all styles
- `app.js` — all logic, team data, scoring engine

---

## 🚀 Deploying to GitHub Pages

1. Create a new repo on GitHub (e.g. `worldcup2026pool`)
2. Upload all three files (`index.html`, `style.css`, `app.js`)
3. Go to **Settings → Pages → Source: main branch / root**
4. Site will be live at `https://seenasja.github.io/worldcup2026pool/`

---

## 📊 Google Sheets Backend Setup

You need a Google Apps Script to receive picks and serve the leaderboard.

### Step 1: Create the Google Sheet

Create a new Google Sheet with two tabs:

**Tab 1: "Entries"**
Columns (Row 1 headers):
`Timestamp | Name | Email | Tier1_1 | Tier1_2 | Tier1_3 | Tier2_1 | Tier2_2 | Tier3_1`

**Tab 2: "Results"**
Columns:
`Timestamp | Round | Team1 | Team2 | Outcome`

### Step 2: Create the Apps Script

In your Google Sheet: **Extensions → Apps Script**

Paste this code:

```javascript
const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.openById(SHEET_ID);

  if (data.action === 'submitEntry') {
    const sheet = ss.getSheetByName('Entries');
    sheet.appendRow([
      data.timestamp, data.name, data.email,
      data.tier1_1, data.tier1_2, data.tier1_3,
      data.tier2_1, data.tier2_2,
      data.tier3_1
    ]);
  }

  if (data.action === 'logResult') {
    const sheet = ss.getSheetByName('Results');
    sheet.appendRow([data.timestamp, data.round, data.team1, data.team2, data.outcome]);
  }

  return ContentService.createTextOutput('ok');
}

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.openById(SHEET_ID);

  if (action === 'getEntries') {
    const sheet = ss.getSheetByName('Entries');
    const rows = sheet.getDataRange().getValues().slice(1); // skip header
    const entries = rows.map(r => ({
      timestamp: r[0], name: r[1], email: r[2],
      tier1_1: r[3], tier1_2: r[4], tier1_3: r[5],
      tier2_1: r[6], tier2_2: r[7],
      tier3_1: r[8]
    }));
    return ContentService
      .createTextOutput(JSON.stringify({ entries }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getResults') {
    const sheet = ss.getSheetByName('Results');
    const rows = sheet.getDataRange().getValues().slice(1);
    const results = rows.map(r => ({
      timestamp: r[0], round: r[1], team1: r[2], team2: r[3], outcome: r[4]
    }));
    return ContentService
      .createTextOutput(JSON.stringify({ results }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 3: Deploy the Apps Script

1. Click **Deploy → New Deployment**
2. Type: **Web App**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Deploy** → Copy the **Web App URL**

### Step 4: Update app.js

Open `app.js` and replace this line at the top:
```javascript
const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```
With your actual URL:
```javascript
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_ID/exec';
```

Also change the admin password:
```javascript
const ADMIN_PASSWORD = 'your_chosen_password';
```

---

## 🎯 Scoring System

| Round         | Win | Draw | Win (Pens) | Loss (Pens) |
|---------------|-----|------|------------|-------------|
| Group Stage   | 3   | 1    | —          | —           |
| Round of 32   | 4   | —    | 3          | 1           |
| Round of 16   | 5   | —    | 4          | 2           |
| Quarterfinals | 6   | —    | 5          | 3           |
| Semifinals    | 7   | —    | 6          | 4           |
| Final         | 8   | —    | 7          | 5           |

## 📋 Team Tiers (by FIFA Ranking)

**Tier 1** (Rankings 1–17): France, Spain, Argentina, England, Portugal, Brazil, Netherlands, Morocco, Belgium, Germany, Croatia, Colombia, Senegal, Mexico, USA, Uruguay

**Tier 2** (Rankings 18–42): Japan, Switzerland, Iran, Austria, Ecuador, South Korea, Australia, Egypt, Canada, Ivory Coast, Qatar, Algeria, Sweden, Tunisia, Czechia, Türkiye

**Tier 3** (Rankings 44–90): Norway, Scotland, DR Congo, Bosnia & Herz., Panama, Saudi Arabia, South Africa, Iraq, Ghana, Mali, Uzbekistan, Jordan, Paraguay, New Zealand, Cape Verde, Curaçao
