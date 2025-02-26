document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let searchData = null;

    // 获取基础URL
    const baseUrl = document.querySelector('base')?.href || window.location.origin;
    
    // 加载搜索索引
    console.log('开始加载搜索索引...');
    fetch(new URL('/index.json', baseUrl).toString())
        .then(response => {
            console.log('搜索索引响应状态:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('搜索索引加载成功:', data);
            searchData = data;
            // 如果URL中有搜索参数，立即执行搜索
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q');
            if (query) {
                searchInput.value = query;
                performSearch();
            }
        })
        .catch(error => {
            console.error('搜索索引加载失败:', error);
            searchResults.innerHTML = '<p class="no-results">搜索索引加载失败</p>';
        });

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    // 高亮搜索结果中的关键词
    function highlightText(text, query) {
        if (!query || !text) return text || '';
        const words = query.split(/\s+/).filter(word => word.length > 0);
        let result = text;
        words.forEach(word => {
            const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            result = result.replace(regex, '<span class="search-highlight">$&</span>');
        });
        return result;
    }

    // 执行搜索
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        console.log('执行搜索，关键词:', query);
        
        if (!searchData) {
            console.log('搜索数据未加载');
            searchResults.innerHTML = '<p class="no-results">搜索数据正在加载中...</p>';
            return;
        }

        if (query.length < 2) {
            console.log('搜索关键词太短');
            searchResults.innerHTML = '';
            return;
        }

        console.log('可搜索的文章数量:', searchData.articles.length);
        const results = searchData.articles.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(query);
            const contentMatch = item.content.toLowerCase().includes(query);
            const tagsMatch = item.tags ? item.tags.some(tag => tag.toLowerCase().includes(query)) : false;
            const categoriesMatch = item.categories ? item.categories.some(cat => cat.toLowerCase().includes(query)) : false;
            
            return titleMatch || contentMatch || tagsMatch || categoriesMatch;
        });

        console.log('搜索结果数量:', results.length);

        if (results.length === 0) {
            searchResults.innerHTML = '<p class="no-results">没有找到匹配的结果</p>';
            return;
        }

        const resultsHtml = results.map(item => `
            <article class="search-result-item">
                <h2><a href="${item.permalink}">${highlightText(item.title, query)}</a></h2>
                <div class="search-result-date">${item.date}</div>
                <div class="search-result-summary">${highlightText(item.summary, query)}</div>
                ${item.tags && item.tags.length > 0 ? `
                    <div class="search-result-tags">
                        标签: ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join(', ')}
                    </div>
                ` : ''}
            </article>
        `).join('');

        searchResults.innerHTML = resultsHtml;
    }

    // 添加搜索输入事件监听器（使用防抖）
    searchInput.addEventListener('input', debounce(performSearch, 300));

    // 阻止表单默认提交行为
    const form = searchInput.closest('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }

    // 添加快捷键支持
    document.addEventListener('keydown', function(e) {
        // 按下 Ctrl/Cmd + K 时聚焦搜索框
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
        // 按下 Esc 键时清空搜索框
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchResults.innerHTML = '';
            searchInput.blur();
        }
    });
}); 