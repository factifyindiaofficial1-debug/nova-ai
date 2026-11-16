# NOVA AI — Version 1.0

A lightweight, responsive AI chat website using the Gemini Interactions API through a Netlify Function. Chat history is saved in the current browser only. Requests use `store: false`; the API key stays on the server.

## Files

- `index.html` — app layout
- `styles.css` — responsive styling
- `app.js` — chat UI and browser-side history
- `netlify/functions/chat.js` — secure server-side Gemini API call
- `netlify.toml` — Netlify configuration

## Setup

1. Create a Gemini API key in Google AI Studio: https://aistudio.google.com/app/apikey
2. Create a free Netlify account: https://app.netlify.com/
3. Upload the extracted `nova-ai` folder contents to a new GitHub repository. In Netlify, choose **Add new project** → **Import an existing project** → connect that repository. (Netlify must build/deploy the project so the serverless function is included; a static drag-and-drop deploy is not the recommended route for this project.)
4. Keep the publish directory as `.` and functions directory as `netlify/functions` (the included `netlify.toml` already sets these). Deploy the project.
5. After the first deploy, open **Site configuration / Project configuration → Environment variables**.
6. Add a variable named `GEMINI_API_KEY` and paste your API key as its value. Make sure it is available to Functions.
7. Trigger a new deploy so the function receives the variable.
8. Open your Netlify site URL and send a test message.

## Local development (optional)

Install Node.js, then run:

```bash
npm install -g netlify-cli
netlify dev
```

Set `GEMINI_API_KEY` in your local shell before starting `netlify dev`. Do not put the key in `app.js`, `index.html`, or any public file.

## Important

- Gemini API free-tier availability, model access, quotas, and regional eligibility can change. Check current limits in Google AI Studio before sharing the site publicly.
- Netlify hosting/functions also have plan limits. “Free first” does not mean unlimited usage.
- The browser stores chat history in local storage on that device. Clearing browser data removes it.
- This is a first working chatbot, not a custom-trained foundation model. NOVA AI is your interface/brand and Gemini supplies the model responses.
- Before public launch, add abuse protection/rate limiting, privacy information, terms, and a way to report issues. Do not collect sensitive information from visitors.
