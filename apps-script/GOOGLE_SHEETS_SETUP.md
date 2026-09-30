# Google Sheets & Email Alert Setup for Equinox Website

All consultation and callback forms on the Equinox website are pre-wired to:
1. **Append the lead into your private Google Sheet** with Lead ID, IST timestamp, name, mobile, service, and referral source.
2. **Automatically send an instant email notification to `eqinoxwellness@gmail.com`** with one-tap WhatsApp and phone call buttons.

---

## 3-Minute Deployment Instructions:

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) in your Google account.
2. Name the spreadsheet: **"Equinox Clinic Leads"**.

### Step 2: Open Apps Script
1. In the Google Sheet top menu, click **Extensions** > **Apps Script**.
2. Delete whatever is in the code editor, and copy-paste the entire contents of [`apps-script/Code.gs`](./Code.gs) into the editor.
3. Click the **Save** (💾) icon or press `Ctrl + S`.

### Step 3: Run Setup Once
1. At the top of the Apps Script toolbar, make sure **`setup`** is selected in the function dropdown.
2. Click **Run**.
3. Google will ask for permission ("Authorization Required"). Click **Review permissions**, select your Google account (`eqinoxwellness@gmail.com` or your admin email), click **Advanced**, and click **Go to Equinox (unsafe)**. Then click **Allow**.
4. Check your Google Sheet: you will see all columns formatted in bold with automated status and grade dropdowns.

### Step 4: Deploy as Web App
1. At the top right of the Apps Script window, click the blue **Deploy** button > **New deployment**.
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**.
3. Fill in these settings:
   - **Description**: `Equinox Lead & Email Webhook`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` *(Crucial so website forms can submit)*
4. Click **Deploy**.
5. Copy the **Web App URL** (it will look like: `https://script.google.com/macros/s/AKfycb.../exec`).

### Step 5: Connect to the Website
1. Open `js/main.js` line 30:
   ```javascript
   googleSheetWebAppUrl: 'PASTE_YOUR_COPIED_URL_HERE',
   ```
2. Or in `.env`:
   ```bash
   APPS_SCRIPT_URL="PASTE_YOUR_COPIED_URL_HERE"
   ```

---

## What Happens on Every Lead Submission:
- **Instant Email to `eqinoxwellness@gmail.com`**: Includes Patient Name, Mobile (+91), Requested Treatment, Preferred Time, Notes, and 1-tap "💬 Reply on WhatsApp" & "📞 Call Patient" buttons.
- **Row in Google Sheet**: Saves all 27 tracking parameters including referral source, campaign, device, and landing page.
- **Visitor Confirmation**: Visitor sees an immediate luxury confirmation card with a direct WhatsApp chat launcher.
- **Local Vault Backup**: Every lead is also cached in the browser vault (`localStorage.getItem('equinox_leads_vault')`) to guarantee 0% lead loss.
