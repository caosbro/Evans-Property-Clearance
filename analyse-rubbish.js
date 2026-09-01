export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    // TESTING ONLY: move this value to OPENAI_API_KEY in your hosting provider before going live.
    const apiKey = process.env.OPENAI_API_KEY || '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';
    if (!apiKey) return res.status(500).json({ error: 'AI service is not configured.' });

    const { image } = req.body || {};
    if (!image || typeof image !== 'string' || !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(image)) {
      return res.status(400).json({ error: 'A valid rubbish photo is required.' });
    }
    // Keep requests small enough for a serverless function and the vision endpoint.
    if (image.length > 7_500_000) return res.status(413).json({ error: 'Photo is too large. Please choose another photo.' });

    const instructions = `You are the photo-estimation assistant for Evans Property Clearance in the UK.
Inspect the rubbish photo carefully. Only identify items that are reasonably visible. Estimate the quantity/weight that a professional house-clearance and waste-removal company would need to remove.
Return ONLY valid JSON, with exactly these fields:
{"summary":"short description","mixed_tonnes":0,"wood_tonnes":0,"soil_tonnes":0,"rubble_tonnes":0,"mattresses":0,"fridges":0,"confidence":"low|medium|high","notes":"brief assumptions"}
Use tonnes to one decimal place for bulk categories and whole numbers for mattresses/fridges. If a category is not visible, return 0. Do not invent hidden rubbish. Be conservative if unclear. Do not calculate a price.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50_000);
    let response;
    try {
      response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-5.6-luna',
          input: [{
            role: 'user',
            content: [
              { type: 'input_text', text: instructions },
              { type: 'input_image', image_url: image, detail: 'high' }
            ]
          }],
          max_output_tokens: 500
        })
      });
    } catch (e) {
      if (e?.name === 'AbortError') return res.status(504).json({ error: 'The AI service took too long to respond.' });
      throw e;
    } finally { clearTimeout(timeout); }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(502).json({ error: data?.error?.message || `OpenAI returned ${response.status}.` });

    const text = data.output_text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: 'AI returned no usable rubbish estimate.' });
    let result;
    try { result = JSON.parse(match[0]); }
    catch { return res.status(502).json({ error: 'AI returned invalid estimate data.' }); }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Unable to analyse photo.' });
  }
}
