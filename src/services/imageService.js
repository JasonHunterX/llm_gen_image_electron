import OpenAI from 'openai';

export const generateImage = async (settings, prompt) => {
  const service = settings.selectedService;
  
  switch (service) {
    case 'ollama':
      return await generateOllamaImage(settings.ollama, prompt);
    case 'deepseek':
      return await generateDeepseekImage(settings.deepseek, prompt);
    default:
      throw new Error('不支持的服务类型');
  }
};

// Ollama 图片生成
const generateOllamaImage = async (settings, prompt) => {
  const response = await fetch(`${settings.apiUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.modelName,
      prompt: prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error('Ollama 图片生成失败');
  }

  return await response.json();
};

// Deepseek 图片生成
const generateDeepseekImage = async (settings, prompt) => {
  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: settings.apiKey,
    dangerouslyAllowBrowser: true
  });

  const response = await openai.images.generate({
    model: settings.modelName,
    prompt: prompt,
    n: 1,
    size: "1024x1024"
  });

  return response.data[0];
};