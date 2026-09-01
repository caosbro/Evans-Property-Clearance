export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try {
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({error:'OPENAI_API_KEY is not configured on the server.'});
    const {image, pricing} = req.body || {};
    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) return res.status(400).json({error:'A photo is required.'});
    const prompt = `You are the rubbish-estimation assistant for Evans Property Clearance in the UK. Inspect the supplied photo carefully. Identify visible waste and estimate the amount that would need removing. Do not invent items that are not reasonably visible. Use conservative but practical estimates for a house-clearance/waste-removal job. Return ONLY valid JSON with this exact shape: {"summary":"short description","mixed_tonnes":0,"wood_tonnes":0,"soil_tonnes":0,"rubble_tonnes":0,"mattresses":0,"fridges":0,"confidence":"low|medium|high","notes":"brief assumptions"}. Estimate tonnes to one decimal place for bulk waste; mattresses/fridges as whole items. If a category is not visible, use 0. Pricing reference (for context only): mixed £170/tonne, wood £110/tonne, soil/rubble £80/tonne, mattress/fridge £50 each. The customer price is calculated by the app, not by you.`;
    const r = await fetch('https://api.openai.com/v1/responses', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},
      body:JSON.stringify({model:'gpt-5.6-luna',input:[{role:'user',content:[{type:'input_text',text:prompt},{type:'input_image',image_url:image,detail:'high'}]}]})
    });
    const data=await r.json();
    if(!r.ok) return res.status(r.status).json({error:data?.error?.message || 'AI request failed.'});
    const text=data.output_text || '';
    const match=text.match(/\{[\s\S]*\}/);
    if(!match) return res.status(502).json({error:'AI returned an unexpected result.'});
    const result=JSON.parse(match[0]);
    return res.status(200).json(result);
  } catch(e) {
    return res.status(500).json({error:e.message || 'Unable to analyse photo.'});
  }
}
