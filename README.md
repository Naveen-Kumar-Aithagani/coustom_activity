# Postman-like Custom Activity for Salesforce Marketing Cloud (SFMC)

A scalable, stateless, and secure Custom Journey Builder Activity for SFMC that allows you to make dynamic HTTP API calls from within a journey—just like Postman!

## Features
- Supports HTTP methods: GET, POST, PUT, DELETE, PATCH
- Dynamic headers and payloads using journey data (e.g., `{{Contact.Email}}`, `{{Event.Data.FirstName}}`)
- Optional authentication step: Bearer Token, Basic Auth, or OAuth2 (client_credentials)
- Logs API responses and handles errors (with branching)
- Postman-like UI with tabs for Request, Auth, Headers, Body, and Preview
- Stateless and secure (no sensitive data stored)

## Folder Structure
```
Custom_Activity/
  manifest.json
  package.json
  package-lock.json
  public/
    customActivity.js
    index.html
  server.js
```

## Setup & Local Development
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the server locally:**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000` by default.

3. **Test the UI:**
   Open `public/index.html` in your browser (for local development/testing only).

## Deployment
- Deploy to your preferred host (e.g., Vercel, Heroku, AWS, etc.).
- Update all endpoint and UI URLs in `manifest.json` to match your deployed domain (replace `https://example.com` with your real URL).

## Registering in SFMC
1. Upload your `manifest.json` to your hosting location or provide the URL to SFMC when registering the custom activity.
2. In SFMC, go to **Journey Builder > Custom Activities** and register your activity using the manifest URL.
3. The activity will appear in the Journey Builder canvas.

## Using in Journey Builder
- Drag the custom activity onto your journey.
- Configure the API request using the Postman-like UI:
  - Set the endpoint, method, headers, body, and authentication.
  - Insert journey data variables as needed (e.g., `{{Contact.Email}}`).
  - Preview the request before saving.
- The activity will execute the configured API call for each contact in the journey, replacing variables with actual data.
- Branching is supported based on API success/failure.

## Security & Notes
- No sensitive data is stored on the server.
- All variable replacements are stateless and per-request.
- For production, use HTTPS and secure your deployment.

## Customization
- Add more journey variables to the picker in `public/index.html` as needed.
- Adjust error handling or logging in `server.js` for your requirements.

---

**Questions or need enhancements?**
Open an issue or contact the project maintainer. 