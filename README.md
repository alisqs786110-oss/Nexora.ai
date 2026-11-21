# NEXORA AI — Starter Project

A responsive premium-dark AI chat interface built with plain HTML, CSS and JavaScript.

## Run it on Windows

1. Extract `nexora-ai-project.zip`.
2. Open the `nexora-ai` folder in VS Code.
3. Open `index.html` in your browser, or use the VS Code Live Server extension.
4. Try the prompt cards, New chat, chat history and Settings.

## What works now

- Responsive dark/purple chat interface
- New conversations and saved chat history (browser localStorage)
- Prompt suggestion cards
- Typing indicator and copy response
- Demo replies, so the interface works without an API key
- Optional backend endpoint setting

## Important: Demo mode vs real AI

By default this project uses sample/demo responses. It is **not connected to a real AI model** yet.

To enable real AI, create a secure backend endpoint that:
- accepts `POST` JSON: `{ "message": "your question" }`
- returns JSON: `{ "reply": "AI response" }`
- stores the AI provider API key in a server-side environment variable
- validates requests and applies rate limits

Then open Settings in NEXORA and enter your backend endpoint URL. Never paste a private AI API key into `app.js`, `index.html`, or any browser-visible code.

## Project files

- `index.html` — page structure
- `styles.css` — premium dark/purple design and responsive layout
- `app.js` — chat logic, local history, demo replies and backend connection
- `README.md` — setup notes

## Suggested next upgrades

1. Add secure login/signup using a proper authentication service.
2. Add a backend with API-key protection and rate limiting.
3. Add streaming responses, Markdown rendering and code blocks.
4. Add user accounts and cloud-synced chat history.
5. Add file uploads and image input only after backend support is ready.
