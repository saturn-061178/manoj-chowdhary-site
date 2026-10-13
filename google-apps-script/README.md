# Email notifications for the website forms

When a visitor submits either form, the site opens WhatsApp and also posts the details to a small Google Apps Script. The script emails them to the addresses set at the top of `Code.gs` and adds a row to a Google Sheet.

One-time setup, from the Google account that should send the emails:

1. Open https://script.google.com and choose **New project**.
2. Delete the sample code, paste in everything from `Code.gs`, and save.
3. Pick `setup` in the function dropdown and press **Run**. Approve the permissions Google asks for. A test email arrives at both addresses, and the sheet link is printed under **Execution log**.
4. **Deploy → New deployment → Web app**. Set *Execute as* to **Me** and *Who has access* to **Anyone**, then **Deploy**.
5. Copy the web app URL (it ends in `/exec`) and paste it into `NOTIFY_URL` near the end of `js/main.js`.

If you later edit `Code.gs`, use **Deploy → Manage deployments → Edit → New version** so the same URL keeps working.

Emails come from the Google account that deployed the script. A free Google account can send about 100 a day.
