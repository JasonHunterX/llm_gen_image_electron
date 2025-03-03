chrome.runtime.onInstalled.addListener(() => {
  // 初始化存储默认设置
  chrome.storage.local.set({
    settings: {
      ollama: {
        apiUrl: 'http://localhost:11434',
        modelName: 'kevin_qwen:latest'
      },
      imageParams: {
        width: 1024,
        height: 1024,
        seed: 100,
        model: 'flux',
        nologo: true,
        enhance: false
      }
    },
    history: []
  });
  
  console.log('班大师AI图片生成器已安装/更新');
});

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_NOTIFICATION') {
    // 转发通知到所有打开的popup
    chrome.runtime.sendMessage({
      type: 'NOTIFICATION',
      notification: message.notification
    });
  }
  
  // 确保异步响应正常工作
  return true;
});

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GENERATE_IMAGE') {
    handleImageGeneration(request.prompt, request.settings)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});