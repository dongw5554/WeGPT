// 获取元素
const introDiv = document.getElementById('intro');
const newsSummaryDiv = document.getElementById('news-summary');
const newsDetailsDiv = document.getElementById('news-details');
const statsDiv = document.getElementById('stats');

// 获取美国东部时间
const now = new Date();
const usTimeOptions = { 
    timeZone: "America/New_York", 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
};
const usDateStr = now.toLocaleDateString('zh-CN', usTimeOptions);
const [yyyy, mm, dd] = usDateStr.split('/');

// 设置日期显示
document.getElementById('date').textContent = `美国东部时间：${yyyy}年${mm}月${dd}日`;

// 关于WeGPT推荐值
introDiv.innerHTML = `
    <h2>🧠 关于 WeGPT 推荐值</h2>
    <p>WeGPT推荐值是由人工智能大模型基于新闻来源权威性、内容完整度、情感倾向与关注热度等维度综合计算的新闻价值参考分。它帮助您快速了解新闻的重要性与可信度。当前为试运行阶段，如有不足，敬请谅解与支持。</p>
`;

// 初始化新闻数组
let news = [];

fetch('data/news-${yyyy}年${mm}月${dd}日.json')
.then(response => response.json())
.then(data => {
    // 处理数据
    data.forEach(item => {
        if(item.output){
            if(Array.isArray(item.output)){ 
                news = news.concat(item.output);
            } else {
                news.push(item.output);
            }
        } else if(item.id || item.title){
            news.push(item);
        }
    });

    // 📰 资讯摘要
    if(news.length === 0){
        newsSummaryDiv.innerHTML = "<p>⚠️ 今日暂无新闻，请稍后再试。</p>";
    } else {
        let summaryHTML = "<h2>📰 资讯摘要</h2><ol>";
        news.forEach(n => summaryHTML += `<li>${n.title_zh || n.title}</li>`);
        summaryHTML += "</ol>";
        newsSummaryDiv.innerHTML = summaryHTML;
    }

    // 🤖 AI资讯详细
    if(news.length > 0){
        let detailsHTML = "<h2>🤖 AI资讯</h2>";
        news.forEach((n, i) => {
            const score = parseFloat(n.attentionscore || 0);
            const scoreClass = score >= 80 ? "score-high" : (score >= 60 ? "score-medium" : "score-low");
            
            detailsHTML += `
            <div class="news-card">
                <h3 class="news-title">${i+1}. ${n.title_zh || n.title}</h3>
                <p class="news-summary"><strong>核心要点：</strong>${n.ai_summary || "暂无摘要"}</p>
                <div class="news-meta">
                    <span>
                        <strong>WeGPT推荐值：</strong>
                        <span class="score ${scoreClass}">${score.toFixed(2)}</span>
                    </span>
                    <a href="${n.link || '#'}" target="_blank" class="news-link">🔗 阅读原文</a>
                </div>
            </div>`;
        });
        newsDetailsDiv.innerHTML = detailsHTML;
    }

    // 📊 数据统计
    const total = news.length;
    const avgScore = total ? (news.reduce((sum, n) => sum + parseFloat(n.attentionscore || 0), 0) / total).toFixed(2) : 0;
    const genTime = new Date().toLocaleString('zh-CN', { 
        timeZone: 'America/New_York',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    statsDiv.innerHTML = `
        <h2>📈 数据统计</h2>
        <div class="stats-box">
            <div class="stats-line">
                <span><strong>总新闻数：</strong>${total} 条</span>
                <span><strong>平均推荐值：</strong>${avgScore}</span>
                <span><strong>生成时间：</strong>${genTime}</span>
            </div>
        </div>`;
})
.catch(err => {
    console.error("加载数据出错：", err);
    newsSummaryDiv.innerHTML = "<p>❌ 无法加载数据，请稍后重试。</p>";
});
