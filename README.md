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

The current build contains the temporary testing key requested for this test. It is exposed in the browser fallback and MUST be replaced/removed before real use.

## Hosting
This project includes a Vercel-compatible `/api/analyse-rubbish.js` function. Deploy the project to a host that supports server-side functions and add `OPENAI_API_KEY` in that host's environment-variable settings.

The API uses OpenAI's Responses API with image input. The server function, not the browser, holds the secret key.
