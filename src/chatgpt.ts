import axios from 'axios';

export async function getNamingSuggestions(input: string): Promise<string[]> {
  // APIキーとエンドポイントを設定
  const apiKey = process.env.OPENAI_API_KEY;
  const endpoint =
    'https://api.openai.com/v1/engines/davinci-codex/completions';

  // ヘッダーとリクエストボディを設定
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const prompt = `日本語テキスト：${input}\n命名候補：`;
  const requestBody = {
    prompt: prompt,
    max_tokens: 50,
    n: 5,
    stop: null,
    temperature: 0.7,
  };

  try {
    // APIリクエストを送信
    const response = await axios.post(endpoint, requestBody, {
      headers: headers,
    });

    // 命名候補を抽出して返す
    const suggestions = response.data.choices.map((choice: any) =>
      choice.text.trim()
    );
    return suggestions;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}
