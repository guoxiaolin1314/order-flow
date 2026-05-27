/**
 * 订单流程体系优化 — 后端代理服务器
 * 
 * 作用：前端调 AI 时，不直接暴露 API Key，由本服务转发请求到 DeepSeek
 * 部署到 Railway 后，在环境变量中设置 DEEPSEEK_API_KEY 即可
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON body
app.use(express.json());

// 托管静态文件（前端页面 + templates）
app.use(express.static(__dirname));

// 根路径 → 自动跳转到主页面
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/订单流程体系优化.html');
});

/**
 * POST /api/ai-parse
 * 前端调用此接口进行 AI 智能识别，不暴露 API Key
 * Body: { prompt: string }
 * 返回: DeepSeek API 原始响应
 */
app.post('/api/ai-parse', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: '缺少 prompt 参数' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: '服务器未配置 DEEPSEEK_API_KEY' });
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: 'DeepSeek API 错误',
        detail: errText
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('代理请求失败:', err);
    res.status(500).json({ error: '服务器内部错误', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log('✅ 订单流程代理服务已启动，端口:', PORT);
});
