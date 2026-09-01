module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'AI service is not configured. Add OPENAI_API_KEY in Vercel Environment Variables and redeploy.' });

  try {
    const { image } = req.body || {};
    if (!image || typeof image !== 'string' || !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(image)) {
      return res.status(400).json({ error: 'A valid rubbish photo is required.' });
    }
    if (image.length > 6_000_000) {
      return res.status(413).json({ error: 'Photo is too large. Please take/upload a smaller photo.' });
    }

    const instructions = `You are the photo-estimation assistant for Evans Property Clearance in the UK.
Inspect the rubbish photo carefully. Only identify items that are reasonably visible. Estimate the quantity/weight that a professional house-clearance and waste-removal company would need to remove.
Return ONLY valid JSON with exactly these fields:
{"summary":"short description","mixed_tonnes":0,"wood_tonnes":0,"soil_tonnes":0,"rubble_tonnes":0,"mattresses":0,"fridges":0,"confidence":"low|medium|high","notes":"brief assumptions"}
Use tonnes to one decimal place for bulk categories and whole numbers for mattresses/fridges. If a category is not visible, return 0. Do not invent hidden rubbish. Be conservative if unclear. Do not calculate a price.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
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
              { type: 'input_image', image_url: image, detail: 'low' }
            ]
          }],
          max_output_tokens: 400
        })
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(502).json({ error: data?.error?.message || `OpenAI returned ${response.status}.` });
    }

    const text = data.output_text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: 'AI returned no usable rubbish estimate.' });

    let result;
    try { result = JSON.parse(match[0]); }
    catch { return res.status(502).json({ error: 'AI returned invalid estimate data.' }); }

    return res.status(200).json(result);
  } catch (error) {
    if (error?.name === 'AbortError') return res.status(504).json({ error: 'The AI service took too long to respond. Please try the photo again.' });
    console.error('analyse-rubbish error:', error);
    return res.status(500).json({ error: error?.message || 'Unable to analyse photo.' });
  }
};
