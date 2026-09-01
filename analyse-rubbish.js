export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    // TEMPORARY TEST KEY: replace/remove this when testing is finished.
    // Production should use OPENAI_API_KEY in the hosting provider's environment.
    const TEST_OPENAI_API_KEY = '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';
    const apiKey = process.env.OPENAI_API_KEY || TEST_OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'AI service is not configured on the server.' });

    const { image } = req.body || {};
    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'A rubbish photo is required.' });
    }

    const instructions = `You are the photo-estimation assistant for Evans Property Clearance in the UK.
Inspect the rubbish photo carefully. Only identify items that are reasonably visible. Estimate the quantity/weight that a professional house-clearance and waste-removal company would need to remove.

Return ONLY valid JSON, with no markdown and no extra text, using exactly:
{"summary":"short description","mixed_tonnes":0,"wood_tonnes":0,"soil_tonnes":0,"rubble_tonnes":0,"mattresses":0,"fridges":0,"confidence":"low|medium|high","notes":"brief assumptions"}

Use tonnes to one decimal place for bulk categories. Use whole numbers for mattresses and fridges. If a category is not visible, return 0. Do not invent hidden rubbish. If the image is unclear, use conservative estimates and set confidence to low.

The app calculates the final customer price. Do not calculate or invent a price in your JSON.`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
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
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'AI request failed.' });

    const text = data.output_text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: 'AI returned an unexpected result.' });

    let result;
    try { result = JSON.parse(match[0]); }
    catch { return res.status(502).json({ error: 'AI returned invalid JSON.' }); }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Unable to analyse photo.' });
  }
}
