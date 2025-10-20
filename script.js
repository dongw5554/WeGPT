// 获取元素
const weatherEl = document.getElementById('weather');
const newsSummaryDiv = document.getElementById('news-summary');
const newsDetailsDiv = document.getElementById('news-details');
const statsDiv = document.getElementById('stats');

fetch('data/news-latest.json')
.then(response => response.json())
.then(data => {
    // 天气
    weatherEl.textContent = data.weather || "天气数据暂缺";

    const news = data.news || [];

    // 📰 资讯摘要
    if(news.length === 0){
        newsSummaryDiv.innerHTML = "<p>⚠️ 今日暂无新闻，请稍后再试。</p>";
    } else {
        let summaryHTML = "<h2>📰 资讯摘要</h2><ol>";
        news.forEach(n => {
            summaryHTML += `<li>${n.title_zh || n.title}</li>`;
        });
        summaryHTML += "</ol>";
        newsSummaryDiv.innerHTML = summaryHTML;
    }

    // 🤖 AI资讯详细
    if(news.length === 0){
        newsDetailsDiv.innerHTML = "";
    } else {
        let detailsHTML = "<h2>🤖 AI资讯</h2>";
        news.forEach((n,i)=>{
            const score = parseFloat(n.AttentionScore || 0);
            const scoreClass = score >= 80 ? "score-high" : (score >= 50 ? "score-medium" : "score-low");
            detailsHTML += `
            <div class="news-item">
                <h3>${i+1}. ${n.title_zh || n.title}</h3>
                <p><strong>发布时间：</strong>${n.pubDate ? new Date(n.pubDate).toLocaleString("zh-CN") : "未知"}</p>
                <p><strong>作者/来源：</strong>${n.creator || "未知作者"} | ${n.source || "未知来源"}</p>
                <p><strong>核心要点：</strong>${n.AI_summary || "暂无摘要"}</p>
                <p><strong>原文链接：</strong><a href="${n.link || '#'}" target="_blank">阅读原文</a></p>
                <p><strong>WeGPT得分：</strong><span class="score ${scoreClass}">${score}</span></p>
                <p><strong>WeGPT分析：</strong>${n.WeGPT_Comment || "暂无分析"}</p>
            </div>
            `;
        });
        newsDetailsDiv.innerHTML = detailsHTML;
    }

    // 📊 数据统计
    const total = news.length;
    const avgScore = (news.reduce((sum, n)=>sum+parseFloat(n.AttentionScore||0),0)/total || 0).toFixed(2);
    const generatedTime = new Date().toLocaleString("zh-CN");

    statsDiv.innerHTML = `
        <h2>📊 数据统计</h2>
        <div class="stats-box">
            <div class="stats-line">
                <strong>总新闻数</strong>：${total} <span class="divider">|</span>
                <strong>平均得分</strong>：${avgScore} <span class="divider">|</span>
                <strong>生成时间</strong>：${generatedTime}
            </div>
        </div>
    `;
})
.catch(err => {
    console.error("加载数据出错：", err);
    newsSummaryDiv.innerHTML = "<p>❌ 无法加载数据，请稍后重试。</p>";
});
