import axios from 'axios';

// 生成图片的函数
export async function generateImage(prompt, settings) {
  try {
    // 构建图片参数字符串
    const imageParamsString = Object.entries(settings.imageParams || {})
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    // 发送请求到Ollama API
    const response = await axios.post(`${settings.ollama.apiUrl}/api/generate`, {
      model: settings.ollama.modelName,
      prompt: `你是一个 AI 图片生成助手。我将提供提示 ${prompt}，请基于此提示，以流畅且生动的英文描述图片内容，并将你的描述直接填充到以下 URL 的 {query} 占位符中:
![image](https://image.pollinations.ai/prompt/{query}?${imageParamsString})`,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 1024,
      }
    });
    
    return extractImageUrl(response.data.response, imageParamsString);
  } catch (error) {
    console.error("生成图片时出错:", error);
    throw new Error(error.message || "使用Ollama生成图片时出错");
  }
}

// 从Ollama响应中提取图片URL的辅助函数
function extractImageUrl(responseText, imageParamsString) {
  // 首先移除所有 <think> 标签及其内容
  responseText = responseText.replace(/<think>[\s\S]*?<\/think>/g, '');
  
  const urlRegex = /https:\/\/image\.pollinations\.ai\/prompt\/([^?]+)/;
  const match = responseText.match(urlRegex);
  
  if (match) {
    // 使用正则表达式提取完整URL
    const urlMatch = responseText.match(/https:\/\/image\.pollinations\.ai\/prompt\/[^)]+(\?[^)]+)?/);
    if (urlMatch) {
      return urlMatch[0];
    }
    
    // 如果正则匹配失败，使用旧方法但去掉末尾的右括号
    const startIndex = responseText.indexOf('https://image.pollinations.ai');
    const endIndex = responseText.indexOf(')', startIndex);
    if (startIndex !== -1 && endIndex !== -1) {
      return responseText.substring(startIndex, endIndex);
    }
  }
  
  // 尝试另一种提取方式
  const imgMarkIndex = responseText.indexOf('![image]');
  if (imgMarkIndex !== -1) {
    const urlStart = responseText.indexOf('(', imgMarkIndex) + 1;
    const urlEnd = responseText.indexOf(')', urlStart);
    if (urlStart !== -1 && urlEnd !== -1) {
      return responseText.substring(urlStart, urlEnd);
    }
  }
  
  // 构建备用URL
  if (responseText.includes('pollinations.ai')) {
    const englishDescription = responseText.replace(/[\u4e00-\u9fa5]/g, '').trim();
    const cleanDescription = englishDescription.replace(/[^\w\s]/g, ' ').trim().replace(/\s+/g, '%20');
    
    // 使用传入的图片参数构建URL
    return `https://image.pollinations.ai/prompt/${cleanDescription}?${imageParamsString}`;
  }
  
  throw new Error("无法从响应中提取图片URL");
}