// ===== Cloudflare Workers — EchoDict AI Fallback =====
// デプロイ方法:
//   1. https://workers.cloudflare.com でアカウント作成
//   2. 新しいWorkerを作成してこのコードを貼り付け
//   3. Settings > Variables > Secret で ANTHROPIC_API_KEY を追加
//   4. index.html の WORKER_URL をデプロイ後のURLに書き換える

export default {
  async fetch(request, env) {
    // CORSヘッダー（GitHub Pagesなど外部からのアクセスを許可）
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // OPTIONSリクエスト（プリフライト）への応答
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let word;
    try {
      const body = await request.json();
      word = body.word?.trim();
      if (!word) throw new Error('no word');
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Claude APIを呼ぶ
    try {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `英単語「${word}」について、以下のJSON形式だけを返してください。前置きや説明は不要です。

{
  "word": "正しいスペル",
  "phonetic": "発音記号（IPA）",
  "source": "ai",
  "meanings": [
    {
      "pos": "品詞（名詞・動詞・形容詞・副詞など）",
      "ja": "日本語の意味",
      "ex": "英語の例文",
      "exj": "例文の日本語訳"
    }
  ]
}

品詞ごとに分けて最大3つ。JSONのみ返すこと。`
          }]
        })
      });

      const data = await claudeRes.json();
      const text = data.content?.[0]?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'AI lookup failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
};
