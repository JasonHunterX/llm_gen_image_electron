// 浏览器存储服务
export const storageService = {
  // 获取设置
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get('settings', (result) => {
        resolve(result.settings || {
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
        });
      });
    });
  },

  // 保存设置
  async saveSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ settings }, resolve);
    });
  },

  // 获取历史记录
  async getHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get('history', (result) => {
        resolve(result.history || []);
      });
    });
  },

  // 添加历史记录
  async addToHistory(item) {
    const history = await this.getHistory();
    const updatedHistory = [item, ...history].slice(0, 20); // 只保留最近20条
    return new Promise((resolve) => {
      chrome.storage.local.set({ history: updatedHistory }, resolve);
    });
  }
};