import axios from 'axios';
import OpenAI from 'openai';

// Ollama服务地址，默认为本地服务
const OLLAMA_API_URL = 'http://127.0.0.1:11434';
// 使用的模型名称，可以根据实际安装的模型修改
const MODEL_NAME ='kevin_qwen:latest';

// 生成图片的函数
export async function generateImage(prompt, settings) {
  if (settings.selectedService === 'deepseek') {
    return await generateWithDeepseek(prompt, settings.deepseek, settings.imageParams);
  }
  return await generateWithOllama(prompt, settings.ollama, settings.imageParams);
}

// Deepseek模型的图片生成
async function generateWithDeepseek(prompt, settings, imageParams) {
  try {
    const imageParamsString = Object.entries(imageParams || {})
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: settings.apiKey,
      dangerouslyAllowBrowser: true
    });

    const response = await openai.chat.completions.create({
      model: settings.modelName,
      messages: [{
        role: "user",
        content: `你是一个 AI 图片生成助手。我将提供提示 ${prompt}，请基于此提示，以流畅且生动的英文描述图片内容，并将你的描述直接填充到以下 URL 的 {query} 占位符中:
![image](https://image.pollinations.ai/prompt/{query}?${imageParamsString})`
      }]
    });

    // 更新：从 Deepseek 响应中正确提取内容
    const content = response.choices[0].message.content;
    return extractImageUrl(content, imageParamsString);
  } catch (error) {
    console.error("Deepseek生成图片时出错:", error);
    throw new Error(error.message || "使用Deepseek生成图片时出错");
  }
}

// Ollama模型的图片生成
async function generateWithOllama(prompt, settings, imageParams) {
  try {
    // 构建图片参数字符串
    const imageParamsString = Object.entries(imageParams || {})
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    console.log('imageParamsString',imageParamsString)
    console.log('prompt',prompt)
    const response = await axios.post(`${settings.apiUrl}/api/generate`, {
      model: settings.modelName,
      prompt: `你是一个 AI 图片生成助手。我将提供提示 ${prompt}，请基于此提示，以流畅且生动的英文描述图片内容，并将你的描述直接填充到以下 URL 的 {query} 占位符中:
![image](https://image.pollinations.ai/prompt/{query}?${imageParamsString})`,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 1024,
      }
    });
    
    // 修改这里，将 imageParamsString 传递给 extractImageUrl 函数
    return extractImageUrl(response.data.response, imageParamsString);
  } catch (error) {
    console.error("Ollama生成图片时出错:", error);
    throw new Error(error.message || "使用Ollama生成图片时出错");
  }
}

// 修改 extractImageUrl 函数，接收 imageParamsString 参数
function extractImageUrl(responseText, imageParamsString) {
  // 首先移除所有 <think> 标签及其内容
  responseText = responseText.replace(/<think>[\s\S]*?<\/think>/g, '');
  
  const urlRegex = /https:\/\/image\.pollinations\.ai\/prompt\/([^?]+)/;
  const match = responseText.match(urlRegex);
  console.log("responseText:", responseText);
  if (match) {
    // 修复：不再包含右括号，使用正则表达式提取完整URL
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
    
    // 使用传入的图片参数构建URL，而不是硬编码的参数
    return `https://image.pollinations.ai/prompt/${cleanDescription}?${imageParamsString}`;
  }
  
  throw new Error("无法从响应中提取图片URL");
}

// 生成音频的函数
export async function generateAudio(prompt, settings) {
  if (settings.selectedService === 'deepseek') {
    return await generateAudioWithDeepseek(prompt, settings.deepseek, settings.imageParams);
  }
  return await generateAudioWithOllama(prompt, settings.ollama, settings.imageParams);
}

// Ollama模型的音频生成
async function generateAudioWithOllama(prompt, settings, imageParams) {
  try {
    // 获取用户选择的voice参数，如果未设置则默认使用nova
    const voice = imageParams?.voice || 'nova';
    
    const response = await axios.post(`${settings.apiUrl}/api/generate`, {
      model: settings.modelName,
      prompt: `你是一个AI故事生成机器人，我给你这个提示："${prompt}"，请用你的想象力去简短的续写这段故事，然后将续写的内容充到下面url的占位符中:
[点击播放音频](https://text.pollinations.ai/{query}?model=openai-audio&voice=${voice})`,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 1024,
      }
    });

    const content = response.data.response;
    const audioUrl = extractAudioUrl(content);
    const audioText = extractAudioText(content);

    return {
      audioUrl,
      audioText
    };
  } catch (error) {
    console.error("生成音频时出错:", error);
    throw new Error(error.message || "使用Ollama生成音频时出错");
  }
}

// 从响应中提取音频URL
function extractAudioUrl(content) {
  const urlRegex = /https:\/\/text\.pollinations\.ai\/([^?\)]+)/;
  const match = content.match(urlRegex);
  
  if (match) {
    const fullUrl = content.match(/https:\/\/text\.pollinations\.ai\/[^)]+(\?[^)]+)?/);
    if (fullUrl) {
      return fullUrl[0];
    }
  }
  
  // 如果没有找到匹配，尝试另一种正则表达式
  const altMatch = content.match(/https:\/\/text\.pollinations\.ai\/[^?\s]+\?[^)\s]+/);
  if (altMatch) {
    return altMatch[0];
  }
  
  throw new Error("无法从响应中提取音频URL");
}

// 删除这个重复的函数
// function extractAudioUrl(responseText) {
//   const urlRegex = /https:\/\/text\.pollinations\.ai\/([^?\)]+)/;
//   const match = responseText.match(urlRegex);
//   
//   if (match) {
//     const fullUrl = responseText.match(/https:\/\/text\.pollinations\.ai\/[^)]+(\?[^)]+)?/);
//     if (fullUrl) {
//       return fullUrl[0];
//     }
//   }
//   
//   throw new Error("无法从响应中提取音频URL");
// }

// 从响应中提取音频文本
function extractAudioText(content) {
  // 移除URL部分，保留纯文本内容
  const textContent = content.replace(/\[点击播放音频\]\(https:\/\/.*?\)/, '').trim();
  return textContent;
}

// Deepseek的音频生成
async function generateAudioWithDeepseek(prompt, settings, imageParams) {
  try {
    // 获取用户选择的voice参数，如果未设置则默认使用nova
    const voice = imageParams?.voice || 'nova';
    
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: settings.apiKey,
      dangerouslyAllowBrowser: true
    });

    const response = await openai.chat.completions.create({
      model: settings.modelName,
      messages: [{
        role: "user",
        content: `你现在是一个ai故事生成机器人，我给你这个提示："${prompt}"，请用你的想象力去简短的续写这段故事，然后将续写的内容充到下面url的占位符中:
[点击播放音频](https://text.pollinations.ai/{query}?model=openai-audio&voice=${voice})`
      }]
    });

    // 更新：从 Deepseek 响应中正确提取内容
    const content = response.choices[0].message.content;
    const audioUrl = extractAudioUrl(content);
    const audioText = extractAudioText(content);
    
    // 确保返回包含 audioUrl 和 audioText
    return { 
      audioUrl: audioUrl,
      audioText: audioText
    };
  } catch (error) {
    console.error("生成音频时出错:", error);
    throw new Error(error.message || "使用Deepseek生成音频时出错");
  }
}

// 添加保存图片到本地的函数
export async function saveImageToLocal(imageUrl, filename = 'generated-image.png') {
  try {
    // 获取图片数据
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('获取图片失败');
    }
    
    const blob = await response.blob();
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    
    // 添加到文档并触发点击
    document.body.appendChild(a);
    a.click();
    
    // 清理
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('保存图片失败:', error);
    throw new Error(`保存图片失败: ${error.message}`);
  }
}

// 提取音频文本内容
// 删除这个重复的函数
// function extractAudioText(responseText) {
//   // 移除 URL 部分，只保留文本内容
//   return responseText.replace(/\[点击播放音频\]\(https:\/\/text\.pollinations\.ai\/[^)]+\)/g, '').trim();
// }