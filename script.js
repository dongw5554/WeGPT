fetch('data/news-latest.json')
  .then(response => response.json())
  .then(data => {
    // 天气
    document.getElementById('weather').textContent = data.weather;

    // 新闻渲染
    const container = document.getElementById('news-container');
    data.news.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'section news-item';
      const score = parseFloat(item.attentionscore || 0).toFixed(2);
      div.innerHTML = `
        <h2>🤖 ${item.title_zh || item.title}</h2>
        <ul>
          <li><strong>发布时间</strong>：${item.pubdate ? new Date(item.pubdate).toLocaleString("zh-CN") : "未知"}</li>
          <li><strong>作者/来源</strong>：${item.creator || "未知作者"} | ${item.source || "未知来源"}</li>
          <li><strong>核心要点</strong>：${item.ai_summary || "暂无摘要"}</li>
          <li><strong>原文链接</strong>：<a href="${item.link || "#"}" target="_blank">阅读原文</a></li>
          <li><strong>WeGPT得分</strong>：${score}</li>
          <li><strong>WeGPT分析</strong>：${item.wegpt_comment || "暂无分析"}</li>
        </ul>
      `;
      container.appendChild(div);
      container.appendChild(document.createElement('hr'));
    });

    // 统计
    const statsDiv = document.getElementById('stats');
    const total = data.news.length;
    const avgScore = (data.news.reduce((sum, n) => sum + parseFloat(n.attentionscore || 0), 0) / total).toFixed(2);
    statsDiv.innerHTML = `
      <h2>📈 数据统计</h2>
      <ul>
        <li><strong>总新闻数</strong>：${total} 条</li>
        <li><strong>平均得分</strong>：${avgScore}</li>
        <li><strong>生成时间</strong>：${data.processed_at}</li>
      </ul>
    `;
  });