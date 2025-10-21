// 获取元素
const weatherEl = document.getElementById('weather');
const newsSummaryDiv = document.getElementById('news-summary');
const newsDetailsDiv = document.getElementById('news-details');
const statsDiv = document.getElementById('stats');

fetch('data/news-latest.json')
.then(response => response.json())
.then(data => {
    // 初始化
    let weatherText = "天气数据暂缺";
    let news = [];

    // 遍历 JSON
    data.forEach(item => {
        // 天气
        if(item.weatherStr){
            weatherText = item.weatherStr;
        } 
        // 如果有 output
        else if(item.output){
            if(Array.isArray(item.output)){ 
                // 兼容未来 output 是数组的情况
                news = news.concat(item.output);
            } else {
                news.push(item.output);
            }
        }
        // 其他直接新闻对象
        else if(item.id || item.title){
            news.push(item);
        }
    });

    // 显示天气
    weatherEl.textContent = weatherText;

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
    if(news.length === 0){
        newsDetailsDiv.innerHTML = "";
    } else {
        let detailsHTML = "<h2>🤖 AI资讯</h2>";
        news.forEach((n,i)=>{
            const score = parseFloat(n.attentionscore || 0); // 小写
            const scoreClass = score >= 80 ? "score-high" : (score >= 50 ? "score-medium" : "score-low");
            detailsHTML += `
            <div class="news-item">
                <h3>${i+1}. ${n.title_zh || n.title}</h3>
                <p><strong>发布时间：</strong>${n.pubdate ? new Date(n.pubdate).toLocaleString("zh-CN") : "未知"}</p>
                <p><strong>作者/来源：</strong>${n.creator || "未知作者"} | ${n.source || "未知来源"}</p>
                <p><strong>核心要点：</strong>${n.ai_summary || "暂无摘要"}</p>
                <p><strong>原文链接：</strong><a href="${n.link || '#'}" target="_blank">阅读原文</a></p>
                <p><strong>WeGPT得分：</strong><span class="score ${scoreClass}">${score}</span></p>
                <p><strong>WeGPT分析：</strong>${n.wegpt_comment || "暂无分析"}</p>
            </div>`;
        });
        newsDetailsDiv.innerHTML = detailsHTML;
    }

    // 📊 数据统计
    const total = news.length;
    const avgScore = total ? (news.reduce((sum,n)=>sum+parseFloat(n.attentionscore||0),0)/total).toFixed(2) : 0;

    statsDiv.innerHTML = `
        <h2>📊 数据统计</h2>
        <div class="stats-box">
            <div class="stats-line">
                <strong>总新闻数</strong>：${total} <span class="divider">|</span>
                <strong>平均得分</strong>：${avgScore} <span class="divider">|</span>
                <strong>生成时间</strong>：${new Date().toLocaleString("zh-CN")}
            </div>
        </div>`;
})
.catch(err => {
    console.error("加载数据出错：", err);
    newsSummaryDiv.innerHTML = "<p>❌ 无法加载数据，请稍后重试。</p>";
});
