# Evans Clearance

The AI button is now an **AI Rubbish Estimate**. It lets you take a photo or upload a photo, sends it to the included `/api/analyse-rubbish` server function, estimates the visible waste, applies the Evans Property Clearance pricing rules, and lets you **ADD ESTIMATE TO QUOTE**.

## AI setup
The browser app must be hosted with the included serverless function. The function uses the OpenAI Responses API for image analysis. Set the hosting environment variable:

`OPENAI_API_KEY=your_key_here`

Do **not** put the API key in `app.js` or any browser-side file.

The included function is compatible with a Vercel-style `/api` deployment. OpenAI's current API supports image input in the Responses API, including base64 data URLs. See the official OpenAI documentation for current API setup. 
