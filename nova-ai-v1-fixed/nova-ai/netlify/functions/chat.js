const SYSTEM_INSTRUCTION = `You are NOVA AI, a helpful, clear and friendly AI assistant. Reply in the same language as the user. Use simple Hindi when the user writes in Hindi. Be accurate, honest about uncertainty, age-appropriate, and concise unless detail is requested. Do not claim to have capabilities you do not have. Format answers with readable paragraphs and lists when useful.`;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders(), body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json(500, { error: 'Server setup incomplete: GEMINI_API_KEY is missing in Netlify environment variables.' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Invalid JSON request.' }); }
  if (!Array.isArray(body.messages) || body.messages.length === 0) return json(400, { error: 'Please enter a message.' });
  const messages = body.messages.slice(-12).filter(m => m && ['user','assistant'].includes(m.role) && typeof m.text === 'string').map(m => ({ role: m.role, text: m.text.slice(0, 4000) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') return json(400, { error: 'The last message must be from the user.' });

  // Stateless requests keep conversation history in the user's browser and avoid server-side interaction storage.
  const input = messages.map(m => ({
    type: m.role === 'user' ? 'user_input' : 'model_output',
    content: [{ type: 'text', text: m.text }]
  }));

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ model: 'gemini-flash-latest', input, system_instruction: SYSTEM_INSTRUCTION, store: false })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data?.error?.message || `Gemini API error (${response.status})`;
      return json(response.status === 429 ? 429 : 502, { error: detail });
    }
    const reply = (data.steps || []).filter(s => s.type === 'model_output').flatMap(s => s.content || []).filter(c => c.type === 'text').map(c => c.text || '').join('\n').trim();
    if (!reply) return json(502, { error: 'The AI did not return text. Please try again.' });
    return json(200, { reply });
  } catch (error) {
    return json(502, { error: 'Could not reach the AI service. Please try again later.' });
  }
};

function corsHeaders() { return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json' }; }
function json(statusCode, payload) { return { statusCode, headers: corsHeaders(), body: JSON.stringify(payload) }; }
