/* ==================== 技术博客子页面交互 ====================
 * 1. 从 assets/data/blog.json 读取「分类清单」
 * 2. 按清单并行加载每个分类的文章 JSON（assets/data/blog/<category>.json）
 * 3. 渲染左侧分类按钮、文章列表卡片
 * 4. 支持分类筛选 + 关键词搜索
 * 5. 点击卡片进入详情视图，使用 hash 路由（#post=xxx）
 * 6. 浏览器前进/后退按钮可在列表与详情之间切换
 * ============================================================ */
(function () {
    const MANIFEST_URL = 'assets/data/blog.json';

    // 「全部」是固定虚拟分类，其余从清单里读出来
    const ALL_CATEGORY = { key: 'all', label: '全部', icon: 'uil-apps' };

    // DOM 引用
    const $nav        = document.getElementById('blogCategoryNav');
    const $list       = document.getElementById('blogList');
    const $empty      = document.getElementById('blogEmpty');
    const $search     = document.getElementById('blogSearchInput');
    const $listView   = document.getElementById('blogListView');
    const $detailView = document.getElementById('blogDetailView');
    const $detailBack = document.getElementById('blogDetailBack');

    // 状态
    let categories = [ALL_CATEGORY];   // 渲染左侧导航用：包含「全部」
    let posts = [];                    // 全部文章（带分类元数据）
    let currentCategory = 'all';
    let currentKeyword  = '';

    /* ---------- 工具函数 ---------- */
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getPostById(id) {
        return posts.find(p => p.id === id);
    }

    function readHashPostId() {
        const m = (location.hash || '').match(/#post=([^&]+)/);
        return m ? decodeURIComponent(m[1]) : null;
    }

    /* ---------- 渲染：左侧分类 ---------- */
    function renderCategories() {
        $nav.innerHTML = categories.map(cat => `
            <div class="nav-category">
                <button class="nav-btn category-btn blog-cat-btn${cat.key === currentCategory ? ' active' : ''}"
                        data-target="${escapeHTML(cat.key)}">
                    <i class="uil ${escapeHTML(cat.icon || 'uil-bookmark')}"></i>&nbsp;${escapeHTML(cat.label || cat.key)}
                </button>
            </div>
        `).join('');

        $nav.querySelectorAll('.blog-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentCategory = btn.getAttribute('data-target') || 'all';
                $nav.querySelectorAll('.blog-cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderList();
            });
        });
    }

    /* ---------- 渲染：文章列表 ---------- */
    function renderList() {
        const keyword = currentKeyword.trim().toLowerCase();

        const filtered = posts.filter(p => {
            const catMatch = currentCategory === 'all' || p.category === currentCategory;
            if (!catMatch) return false;
            if (!keyword) return true;
            const haystack = [
                p.title || '',
                p.summary || '',
                (p.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return haystack.indexOf(keyword) !== -1;
        });

        if (filtered.length === 0) {
            $list.innerHTML = '';
            $empty.style.display = 'block';
            return;
        }
        $empty.style.display = 'none';

        $list.innerHTML = filtered.map(p => `
            <article class="blog-card" data-id="${escapeHTML(p.id)}">
                <div class="blog-card-meta">
                    <span class="blog-card-tag">${escapeHTML(p.categoryLabel || '')}</span>
                    <span class="blog-card-date">
                        <i class="uil uil-calendar-alt"></i> ${escapeHTML(p.date || '')}
                    </span>
                </div>
                <h2 class="blog-card-title">${escapeHTML(p.title || '')}</h2>
                <p class="blog-card-desc">${escapeHTML(p.summary || '')}</p>
                <div class="blog-card-footer">
                    <span class="blog-card-tags">${(p.tags || []).map(t => '#' + escapeHTML(t)).join(' ')}</span>
                    <a href="#post=${encodeURIComponent(p.id)}" class="blog-card-link">
                        阅读全文 <i class="uil uil-arrow-right"></i>
                    </a>
                </div>
            </article>
        `).join('');

        // 整张卡片都可点击进入详情
        $list.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('click', e => {
                // 如果点的就是内部链接，让它自己走 hash 切换
                if (e.target.closest('.blog-card-link')) return;
                const id = card.getAttribute('data-id');
                if (id) location.hash = '#post=' + encodeURIComponent(id);
            });
        });
    }

    /* ---------- 渲染：文章详情 ---------- */
    function configureMarked() {
        if (typeof marked === 'undefined' || !marked.setOptions) return;
        marked.setOptions({
            gfm: true,
            breaks: false,
            headerIds: false,
            mangle: false
        });
    }

    function renderMarkdown(src) {
        const text = Array.isArray(src) ? src.join('\n') : (src || '');
        if (typeof marked !== 'undefined') {
            // marked 14.x 用 marked.parse，旧版本兼容直接调用 marked()
            if (typeof marked.parse === 'function') return marked.parse(text);
            if (typeof marked === 'function')       return marked(text);
        }
        // 没有 marked 时退化成纯文本
        return '<pre>' + escapeHTML(text) + '</pre>';
    }

    // 已经获取过的外部 .md 文件做下缓存，避免重复请求
    const mdCache = Object.create(null);

    function loadPostBody(post) {
        // 1. 优先使用内联 content
        if (post.content !== undefined && post.content !== null) {
            return Promise.resolve(renderMarkdown(post.content));
        }
        // 2. 再尝试外部 contentFile
        if (post.contentFile) {
            if (mdCache[post.contentFile]) {
                return Promise.resolve(renderMarkdown(mdCache[post.contentFile]));
            }
            return fetch(post.contentFile, { cache: 'no-cache' })
                .then(r => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.text();
                })
                .then(text => {
                    mdCache[post.contentFile] = text;
                    return renderMarkdown(text);
                })
                .catch(err => {
                    console.error('[TechBlog] 加载 Markdown 文件失败:', err);
                    return '<p style="color:#e57373;">加载文章正文失败：' +
                        escapeHTML(post.contentFile) + '</p>';
                });
        }
        // 3. 都没有
        return Promise.resolve('<p style="color:#aaa;">（暂无正文）</p>');
    }

    function renderDetail(post) {
        document.getElementById('detailCategory').textContent = post.categoryLabel || '';
        document.getElementById('detailDate').textContent     = post.date || '';
        document.getElementById('detailTitle').textContent    = post.title || '';
        document.getElementById('detailSummary').textContent  = post.summary || '';
        document.getElementById('detailTags').innerHTML       = (post.tags || [])
            .map(t => `<span class="blog-detail-tag">#${escapeHTML(t)}</span>`).join(' ');

        const $content = document.getElementById('detailContent');
        $content.innerHTML = '<p style="color:#888;">加载中...</p>';

        loadPostBody(post).then(html => {
            $content.innerHTML = html;
        });
    }

    /* ---------- 视图切换 ---------- */
    function showList() {
        $detailView.style.display = 'none';
        $listView.style.display   = '';
        document.title = '技术博客';
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    function showDetail(post) {
        renderDetail(post);
        $listView.style.display   = 'none';
        $detailView.style.display = '';
        document.title = (post.title || '文章') + ' · 技术博客';
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    function syncViewByHash() {
        const id = readHashPostId();
        if (!id) {
            showList();
            return;
        }
        const post = getPostById(id);
        if (post) {
            showDetail(post);
        } else {
            // hash 上的 id 没匹配到文章，回到列表
            showList();
        }
    }

    /* ---------- 事件绑定 ---------- */
    if ($search) {
        $search.addEventListener('input', e => {
            currentKeyword = e.target.value || '';
            renderList();
        });
    }

    if ($detailBack) {
        $detailBack.addEventListener('click', e => {
            e.preventDefault();
            // 清空 hash，回到列表视图
            if (location.hash) {
                history.pushState('', document.title, location.pathname + location.search);
            }
            showList();
        });
    }

    window.addEventListener('hashchange', syncViewByHash);

    /* ---------- 加载数据 ---------- */
    function loadCategoryPosts(cat) {
        if (!cat.file) return Promise.resolve([]);
        return fetch(cat.file, { cache: 'no-cache' })
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(arr => {
                if (!Array.isArray(arr)) return [];
                // 把分类元数据回填到每篇文章上，渲染层无需关心从哪个文件来
                return arr.map(p => Object.assign({}, p, {
                    category: cat.key,
                    categoryLabel: cat.label
                }));
            })
            .catch(err => {
                console.error('[TechBlog] 加载分类 "' + cat.key + '" 失败:', err);
                return [];
            });
    }

    function showLoadError(msg) {
        renderCategories();
        $list.innerHTML = '';
        $empty.style.display = 'block';
        $empty.querySelector('p').textContent = msg;
    }

    configureMarked();
    fetch(MANIFEST_URL, { cache: 'no-cache' })
        .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(manifest => {
            const list = (manifest && Array.isArray(manifest.categories))
                ? manifest.categories
                : [];

            // 渲染左侧导航：「全部」永远在最前
            categories = [ALL_CATEGORY].concat(list.map(c => ({
                key: c.key,
                label: c.label,
                icon: c.icon
            })));
            renderCategories();

            // 并行加载每个分类的文章
            return Promise.all(list.map(loadCategoryPosts));
        })
        .then(groups => {
            if (!groups) return; // 上一步已处理错误
            posts = groups.reduce((acc, arr) => acc.concat(arr), []);
            // 默认按日期倒序，方便阅读
            posts.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
            renderList();
            syncViewByHash();
        })
        .catch(err => {
            console.error('[TechBlog] 加载文章清单失败:', err);
            showLoadError('加载文章数据失败，请确认通过 HTTP 服务器访问页面（直接双击打开本地 file:// 会被浏览器拦截 fetch）。');
        });
})();
