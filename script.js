// 获取元素
const weatherEl = document.getElementById('weather');
const newsSummaryDiv = document.getElementById('news-summary');
const newsDetailsDiv = document.getElementById('news-details');
const statsDiv = document.getElementById('stats');

// 获取当前时间（UTC）
const now = new Date();

// 北京时间 = UTC + 8
const beijingOffset = 8 * 60; // 分钟
const utcOffset = now.getTimezoneOffset(); // 分钟
const beijingTime = new Date(now.getTime() + (beijingOffset + utcOffset) * 60 * 1000);

// 格式化日期 YYYY-MM-DD
const yyyy = beijingTime.getFullYear();
const mm = String(beijingTime.getMonth() + 1).padStart(2, '0');
const dd = String(beijingTime.getDate()).padStart(2, '0');

// 拼接文件名
const fileName = `news-${yyyy}-${mm}-${dd}.json`;

// Base64 -> JSON 安全解码（支持中文）
function base64ToJson(base64Str) {
    // 去掉空格和换行
    base64Str = base64Str.replace(/\s+/g, '');
    // atob -> 二进制字符串
    const binaryStr = atob(base64Str);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    // UTF-8 解码
    const decodedStr = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(decodedStr);
}

// fetch 当天文件
fetch(`data/${fileName}`)
.then(response => response.text())  // 先读取原始 Base64 文本
.then(base64Data => {
    // 解码 Base64 -> JSON
    const data = base64ToJson(base64Data);

    // 初始化
    let weatherText = "天气数据暂缺";
    let news = [];

    // 遍历 JSON
    data.forEach(item => {
        if(item.weatherStr){
            weatherText = item.weatherStr;
        } else if(item.output){
            news = news.concat(Array.isArray(item.output) ? item.output : [item.output]);
        } else if(item.id || item.title){
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
    if(news.length > 0){
        let detailsHTML = "<h2>🤖 AI资讯</h2>";
        news.forEach((n,i)=>{
            const score = parseFloat(n.attentionscore || 0);
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
