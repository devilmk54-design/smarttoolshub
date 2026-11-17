# SmartToolsHub

A complete static website with 10 free online tools. It uses only HTML, CSS and JavaScript, so there is no server, database or build step.

## What is inside

```
index.html                  Homepage
about.html contact.html privacy-policy.html terms.html disclaimer.html 404.html
tools/                      One page per tool (10 pages)
css/style.css               All styling
js/tools.js                 All tool logic
js/main.js                  Menu, footer year, contact form
sitemap.xml  robots.txt  _headers  favicon.svg
```

Tools: Word Counter, Password Generator, Age Calculator, BMI Calculator, Percentage Calculator, Unit Converter, Case Converter, JSON Formatter, Base64 Encoder/Decoder, Color Converter.

## Step 1: Preview on your computer

Unzip the folder and double-click `index.html`. It opens in your browser and all tools work, because links are relative.

## Step 2: Replace two placeholders (important)

You will do this once, after you know your real web address.

1. Install the free editor **VS Code** (code.visualstudio.com) and open the unzipped folder with File > Open Folder.
2. Press **Ctrl+Shift+H** (Cmd+Shift+H on Mac) to open Find and Replace across all files.
3. Replace `https://smarttoolshub.pages.dev` with your real address, for example `https://www.yourname.com`. Do not add a trailing slash. Click "Replace All".
4. Replace `contact@example.com` with your real email address. Click "Replace All".
5. Save all files.

If you deploy first and use the free `*.pages.dev` address Cloudflare gives you, set `https://smarttoolshub.pages.dev` to that address, then change it again if you later add your own domain.

## Step 3: Upload to GitHub

1. Create a free account at github.com.
2. Click **+** (top right) > **New repository**. Name it `smarttoolshub`, choose **Public**, click **Create repository**.
3. On the new repository page click **uploading an existing file**.
4. Open your unzipped folder, select **everything inside it** (not the folder itself) and drag it into the browser. Make sure `index.html` is at the top level of the repository, not inside a subfolder.
5. Click **Commit changes**.

## Step 4: Deploy with Cloudflare Pages (free)

1. Create a free account at dash.cloudflare.com.
2. Go to **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
3. Authorise GitHub and select the `smarttoolshub` repository.
4. Use these settings: **Framework preset:** None. **Build command:** leave empty. **Build output directory:** `/` (or leave empty).
5. Click **Save and Deploy**. After about a minute your site is live at `https://something.pages.dev`.
6. Every time you change a file on GitHub, Cloudflare redeploys automatically.

### Add your own domain (optional)

In your Pages project open **Custom domains** > **Set up a custom domain** and follow the prompts. If you buy the domain through Cloudflare, DNS is configured for you. Then update `https://smarttoolshub.pages.dev` in the files again (Step 2).

## Step 5: Tell Google about your site

1. Open Google Search Console (search.google.com/search-console) and add your site.
2. Submit `https://YOUR-ADDRESS/sitemap.xml` under **Sitemaps**.

## Step 6: Apply for Google AdSense (later)

AdSense approval depends on Google’s review, so no site can be guaranteed to pass. These things help:

- Use your own domain (a `pages.dev` address is often not accepted).
- Make sure the Privacy Policy, About, Contact, Terms and Disclaimer pages have your real details.
- Add more original content over time, for example one helpful article per tool, and let the site gain some visitors first.
- When approved, Google gives you a script. Paste it inside the `<head>` of every page, and add the `ads.txt` file Google provides to the top-level folder.
- This site intentionally has **no empty ad boxes**. Add ad units only after approval.

## Notes

- **Clean URLs:** Cloudflare Pages shows `/about` instead of `/about.html`. The sitemap and canonical tags use the clean form; links inside the pages use `.html` so the site also works when opened from your computer.
- **Contact form:** the site has no server, so the form opens the visitor’s email app with the message filled in. Make sure `contact@example.com` is an address you check.
- **Adding a tool:** copy an existing file in `tools/`, change its content, add its logic to `js/tools.js`, then add it to the homepage and `sitemap.xml`.
- **Privacy:** tools run in the browser and send no data anywhere. Update the Privacy Policy if you add analytics or ads.
