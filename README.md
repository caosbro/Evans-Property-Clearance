# Evans Property Clearance – AI Rubbish Estimate

## Important
The AI estimate now uses a **server-side API route**. The browser never sends an OpenAI API key directly to OpenAI.

### Testing build
For this temporary test build the key is stored only inside `api/analyse-rubbish.js`. Replace it with an environment variable before publishing the app.

### Deploy
This project is configured for Vercel. Deploy the `evans_final` folder as a Vercel project. The app calls `/api/analyse-rubbish` on the same domain.

For the proper live setup, add `OPENAI_API_KEY` as a Vercel environment variable and remove the temporary fallback key from `api/analyse-rubbish.js`.

### How the AI estimate works
1. User takes/selects a rubbish photo.
2. The browser compresses the image to reduce upload size.
3. The browser sends the image to `/api/analyse-rubbish`.
4. The server calls the OpenAI Responses API with image input.
5. The server returns structured waste quantities.
6. The app applies the Evans Property Clearance pricing rules and displays the customer price.

The customer never sees tip costs, labour costs or profit.
