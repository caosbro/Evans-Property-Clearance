# Evans Clearance — AI Rubbish Estimate

The AI button now works as a photo-to-quote estimator:

1. Tap **AI RUBBISH ESTIMATE**.
2. Take a photo or choose a photo.
3. The app automatically sends the image to the secure server function.
4. The AI identifies visible waste and estimates quantities.
5. Evans Property Clearance pricing rules are applied in the app.
6. Tap **ADD ESTIMATE TO QUOTE** to put the estimate into the normal quote.

## Important security note
Do NOT put an OpenAI API key in `index.html`, `app.js`, or any browser-side JavaScript. The key must be stored as the server environment variable `OPENAI_API_KEY`.

The API key previously pasted into ChatGPT should be revoked and replaced because it has been exposed. Do not paste the replacement key into chat.

## Hosting
This project includes a Vercel-compatible `/api/analyse-rubbish.js` function. Deploy the project to a host that supports server-side functions and add `OPENAI_API_KEY` in that host's environment-variable settings.

The API uses OpenAI's Responses API with image input. The server function, not the browser, holds the secret key.
