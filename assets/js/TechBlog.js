/* ==================== 技术博客子页面交互 ====================
 * 1. 从 assets/data/blog.json 读取「分类清单」
 * 2. 按清单并行加载每个分类的文章 JSON（assets/data/blog/<category>.json）
 * 3. 渲染博客卡片和软件 / 模块 / 类型筛选
 * 4. 支持多标签组合筛选 + 关键词搜索
 * 5. 点击卡片进入详情视图，使用 hash 路由（#post=xxx）
 * 6. 浏览器前进/后退按钮可在列表与详情之间切换
 * ============================================================ */
(function () {
    const MANIFEST_URL = 'assets/data/blog.json';

    // DOM 引用
    const $nav        = document.getElementById('blogCategoryNav');
    const $list       = document.getElementById('blogList');
    const $empty      = document.getElementById('blogEmpty');
    const $search     = document.getElementById('blogSearchInput');
    const $listView   = document.getElementById('blogListView');
    const $detailView = document.getElementById('blogDetailView');
    const $detailBack = document.getElementById('blogDetailBack');
    const $detailEdit = document.getElementById('blogDetailEdit');

    // 状态
    let posts = [];                    // 全部文章（带分类元数据）
    let currentCategory = 'all';
    let currentKeyword  = '';
    const selectedFacets = { software: new Set(), module: new Set(), type: new Set() };
    const facetOptions = {
        software: ['3ds Max', 'Photoshop', 'Unity', 'Unreal Engine', '其他'],
        module: ['美术', '动画', '渲染', '工具', '引擎', '其他'],
        type: ['角色', '动画', '场景', 'UI', '特效', '道具', '地形', '其他']
    };

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

    function getPostFacets(post) {
        const source = [post.title, post.summary, post.categoryLabel, ...(post.tags || [])].join(' ').toLowerCase();
        const software = [];
        if (/(3ds\s?max|3dsmax|\bmax\b)/i.test(source)) software.push('3ds Max');
        if (/(photoshop|\bps\b)/i.test(source)) software.push('Photoshop');
        if (/\bunity\b/i.test(source)) software.push('Unity');
        if (/(unreal|\bue[45]?\b|\bue5\b)/i.test(source)) software.push('Unreal Engine');
        if (!software.length) software.push('其他');

        let module = '其他';
        if (post.category === 'art' || /(美术|模型|关卡)/i.test(source)) module = '美术';
        if (post.category === 'shader' || /(shader|渲染|光照|材质|flowmap|法线)/i.test(source)) module = '渲染';
        if (post.category === 'tool' || /(工具|pipeline|tooling|editor tool)/i.test(source)) module = '工具';
        if (post.category === 'UnityEngine' || post.category === 'UnrealEngine') module = '引擎';
        if (/(动画|animation|rigging)/i.test(source)) module = '动画';

        const types = [];
        const typeRules = [
            ['角色', /角色|人物|character|士兵|雷音/i],
            ['动画', /动画|animation|动作|骨骼/i],
            ['场景', /场景|关卡|地形|大世界|建筑|环境|level|environment/i],
            ['UI', /(?:^|[^a-z])ui(?:$|[^a-z])|界面|交互界面/i],
            ['特效', /特效|效果|粒子|vfx|fx|shader|着色器/i],
            ['道具', /道具|武器|资产|模型|prop/i]
        ];
        typeRules.forEach(([label, pattern]) => {
            if (pattern.test(source)) types.push(label);
        });
        if (!types.length) types.push('其他');

        return { software, module: [module], type: types };
    }

    function renderFacetOptions() {
        document.querySelectorAll('[data-facet-group]').forEach(group => {
            const key = group.dataset.facetGroup;
            group.innerHTML = facetOptions[key].map(option => `
                <button class="blog-filter-chip${selectedFacets[key].has(option) ? ' active' : ''}"
                        type="button" data-facet="${escapeHTML(option)}">${escapeHTML(option)}</button>
            `).join('');
        });
    }

    function updateFilterCount() {
        const count = Object.values(selectedFacets).reduce((total, values) => total + values.size, 0);
        const badge = document.getElementById('blogFilterCount');
        if (badge) {
            badge.textContent = count ? String(count) : '';
            badge.hidden = count === 0;
        }
    }

    function clearFacets() {
        Object.values(selectedFacets).forEach(values => values.clear());
        renderFacetOptions();
        updateFilterCount();
        renderList();
    }

    /* ---------- 渲染：左侧分类 ---------- */
    function renderCategories() {
        if ($nav) $nav.hidden = true;
    }

    /* ---------- 渲染：文章列表 ---------- */
    function renderList() {
        const keyword = currentKeyword.trim().toLowerCase();

        const filtered = posts.filter(p => {
            const catMatch = currentCategory === 'all' || p.category === currentCategory;
            if (!catMatch) return false;
            const facets = getPostFacets(p);
            const facetsMatch = Object.entries(selectedFacets).every(([key, selected]) =>
                selected.size === 0 || [...selected].some(value => facets[key].includes(value))
            );
            if (!facetsMatch) return false;
            if (!keyword) return true;
            const haystack = [
                p.title || '',
                p.summary || '',
                (p.tags || []).join(' '),
                p.categoryLabel || '',
                ...Object.values(facets).flat()
            ].join(' ').toLowerCase();
            return haystack.indexOf(keyword) !== -1;
        });

        if (filtered.length === 0) {
            $list.innerHTML = '';
            $empty.style.display = 'block';
            return;
        }
        $empty.style.display = 'none';

        $list.innerHTML = filtered.map(p => {
            const facets = getPostFacets(p);
            const labels = [
                ...facets.software.map(value => ({ group: 'software', value })),
                ...facets.module.map(value => ({ group: 'module', value })),
                ...facets.type.map(value => ({ group: 'type', value }))
            ];
            return `
                <article class="blog-card" data-id="${escapeHTML(p.id)}">
                    <div class="blog-card-meta">
                        <span class="blog-card-tag">${escapeHTML(p.categoryLabel || '')}</span>
                        <span class="blog-card-date">${escapeHTML(p.date || '')}</span>
                    </div>
                    <h2 class="blog-card-title">${escapeHTML(p.title || '')}</h2>
                    <p class="blog-card-desc">${escapeHTML(p.summary || '')}</p>
                    <div class="blog-card-facets">${labels.map(item =>
                        `<span class="blog-facet-tag blog-facet-${item.group}">${escapeHTML(item.value)}</span>`
                    ).join('')}</div>
                    <div class="blog-card-footer">
                        <span class="blog-card-tags">${(p.tags || []).slice(0, 4).map(t => `<span class="blog-card-tag-item">#${escapeHTML(t)}</span>`).join('')}</span>
                        <a href="#post=${encodeURIComponent(p.id)}" class="blog-card-link">
                            阅读全文 <i class="uil uil-arrow-right"></i>
                        </a>
                    </div>
                </article>
            `;
        }).join('');

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

    /* ---------- 代码块装饰：语言标签 + 复制按钮 + highlight.js ---------- */
    // 语言别名 → 显示名
    const LANG_LABELS = {
        cpp: 'C++', 'c++': 'C++',
        csharp: 'C#', cs: 'C#',
        hlsl: 'HLSL',
        glsl: 'GLSL',
        javascript: 'JavaScript', js: 'JavaScript',
        typescript: 'TypeScript', ts: 'TypeScript',
        python: 'Python', py: 'Python',
        json: 'JSON',
        xml: 'XML', html: 'HTML',
        css: 'CSS',
        bash: 'Bash', shell: 'Bash', sh: 'Bash',
        plaintext: 'Plain', text: 'Plain'
    };
    const LANG_OPTIONS = [
        ['csharp', 'C#'],
        ['hlsl', 'HLSL'],
        ['glsl', 'GLSL'],
        ['cpp', 'C++'],
        ['javascript', 'JavaScript'],
        ['python', 'Python'],
        ['json', 'JSON'],
        ['xml', 'XML'],
        ['css', 'CSS'],
        ['bash', 'Bash'],
        ['plaintext', 'Plain']
    ];

    function normalizeLanguage(language) {
        const aliases = {
            'c#': 'csharp',
            cs: 'csharp',
            'c++': 'cpp',
            js: 'javascript',
            ts: 'typescript',
            py: 'python',
            text: 'plaintext',
            plain: 'plaintext'
        };
        return aliases[language] || language;
    }

    function decorateCodeBlocks(container) {
        if (!container) return;
        const blocks = container.querySelectorAll('pre > code');
        blocks.forEach(function (codeEl) {
            const preEl = codeEl.parentElement;
            if (!preEl || preEl.dataset.decorated === '1') return;

            // 解析语言
            let lang = '';
            const m = (codeEl.className || '').match(/language-([\w+#-]+)/i);
            if (m) lang = normalizeLanguage(m[1].toLowerCase());
            const originalCode = codeEl.textContent;
            const label = LANG_LABELS[lang] || (lang ? lang.toUpperCase() : 'Plain');

            function applyLanguage(selectedLang) {
                const activeLang = selectedLang === 'auto' ? lang : selectedLang;
                const displayLang = activeLang || 'plaintext';
                codeEl.textContent = originalCode;
                codeEl.className = 'hljs';

                if (displayLang !== 'plaintext' && window.hljs && window.hljs.getLanguage(displayLang)) {
                    try {
                        const result = window.hljs.highlight(originalCode, {
                            language: displayLang,
                            ignoreIllegals: true
                        });
                        codeEl.innerHTML = result.value;
                    } catch (error) {
                        console.warn('[TechBlog] 代码高亮失败，已显示纯文本：' + displayLang, error);
                    }
                }

                labelEl.textContent = LANG_LABELS[displayLang] || (displayLang ? displayLang.toUpperCase() : 'Plain');
            }

            // 语言默认采用 Markdown 中声明的语言，未声明时保持纯文本。
            codeEl.classList.add('hljs');

            // 包装成带头部的容器
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';

            const header = document.createElement('div');
            header.className = 'code-block-header';

            const labelEl = document.createElement('span');
            labelEl.className = 'code-block-lang';
            labelEl.textContent = label;

            const languageSelect = document.createElement('select');
            languageSelect.className = 'code-block-language-select';
            languageSelect.setAttribute('aria-label', '选择代码高亮语言');
            languageSelect.innerHTML = '<option value="auto">自动</option>' + LANG_OPTIONS
                .map(function (option) {
                    return '<option value="' + option[0] + '">' + option[1] + '</option>';
                }).join('');
            languageSelect.value = LANG_OPTIONS.some(function (option) { return option[0] === lang; })
                ? lang
                : 'auto';
            languageSelect.addEventListener('change', function () {
                applyLanguage(languageSelect.value);
            });

            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className = 'code-block-copy';
            copyBtn.innerHTML = '<i class="uil uil-copy"></i><span>复制</span>';
            copyBtn.addEventListener('click', function () {
                const text = codeEl.textContent;
                const done = function () {
                    const span = copyBtn.querySelector('span');
                    if (span) span.textContent = '已复制';
                    setTimeout(function () {
                        if (span) span.textContent = '复制';
                    }, 1500);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(done, function () {
                        fallbackCopy(text, done);
                    });
                } else {
                    fallbackCopy(text, done);
                }
            });

            const actions = document.createElement('div');
            actions.className = 'code-block-actions';
            actions.appendChild(languageSelect);
            actions.appendChild(copyBtn);
            header.appendChild(labelEl);
            header.appendChild(actions);

            preEl.parentNode.insertBefore(wrapper, preEl);
            wrapper.appendChild(header);
            wrapper.appendChild(preEl);
            preEl.dataset.decorated = '1';
            applyLanguage(languageSelect.value);
        });
    }

    function fallbackCopy(text, done) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done && done(); }
        catch (e) { /* ignore */ }
        document.body.removeChild(ta);
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
            .map(t => `<span class="blog-detail-tag">#${escapeHTML(t)}</span>`).join('');

        // 「编辑此文」链接：把原始 JSON 路径带给编辑器
        if ($detailEdit) {
            if (post.sourceFile) {
                const editUrl = 'assets/SubPage/Blog/BlogEditor.html?edit=' + encodeURIComponent(post.sourceFile);
                $detailEdit.setAttribute('href', editUrl);
                $detailEdit.style.display = '';
                $detailEdit.title = '在编辑器中打开 ' + post.sourceFile;
            } else {
                // 旧格式（直接内联在分类索引里）暂不支持回写到原位置，先隐藏入口
                $detailEdit.removeAttribute('href');
                $detailEdit.style.display = 'none';
            }
        }

        const $content = document.getElementById('detailContent');
        $content.innerHTML = '<p style="color:#888;">加载中...</p>';

        loadPostBody(post).then(html => {
            $content.innerHTML = html;
            decorateCodeBlocks($content);
        });
    }

    /* ---------- 视图切换 ---------- */
    function showList() {
        $detailView.style.display = 'none';
        $listView.style.display   = '';
        document.body.classList.remove('blog-detail-open');
        document.title = '技术博客';
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    function showDetail(post) {
        renderDetail(post);
        $listView.style.display   = 'none';
        $detailView.style.display = '';
        document.body.classList.add('blog-detail-open');
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
    $list.addEventListener('click', e => {
        const target = e.target;
        if (!(target instanceof Element) || target.closest('.blog-card-link')) return;

        const card = target.closest('.blog-card');
        const id = card && card.getAttribute('data-id');
        if (id) location.hash = '#post=' + encodeURIComponent(id);
    });

    if ($search) {
        $search.addEventListener('input', e => {
            currentKeyword = e.target.value || '';
            renderList();
        });
    }
    const searchButton = document.querySelector('.blog-search-submit');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            currentKeyword = $search ? $search.value || '' : '';
            renderList();
            if ($search) $search.focus();
        });
    }

    const filterMenu = document.getElementById('blogFilterMenu');
    const filterToggle = document.getElementById('blogFilterToggle');
    if (filterToggle && filterMenu) {
        filterToggle.addEventListener('click', () => {
            const isOpen = filterMenu.classList.toggle('open');
            filterToggle.setAttribute('aria-expanded', String(isOpen));
        });
        filterMenu.addEventListener('click', event => {
            const chip = event.target.closest('.blog-filter-chip');
            if (!chip) return;
            const group = chip.closest('[data-facet-group]');
            const key = group && group.dataset.facetGroup;
            if (!key || !selectedFacets[key]) return;
            const value = chip.dataset.facet;
            if (selectedFacets[key].has(value)) selectedFacets[key].delete(value);
            else selectedFacets[key].add(value);
            chip.classList.toggle('active', selectedFacets[key].has(value));
            updateFilterCount();
            renderList();
        });
        const clearButton = document.getElementById('blogFilterClear');
        if (clearButton) clearButton.addEventListener('click', clearFacets);
        document.addEventListener('click', event => {
            if (!filterMenu.contains(event.target) && !filterToggle.contains(event.target)) {
                filterMenu.classList.remove('open');
                filterToggle.setAttribute('aria-expanded', 'false');
            }
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                filterMenu.classList.remove('open');
                filterToggle.setAttribute('aria-expanded', 'false');
            }
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
    // 把分类元数据回填到每篇文章上，渲染层无需关心从哪个文件来
    function decoratePost(post, cat) {
        return Object.assign({}, post, {
            category: cat.key,
            categoryLabel: cat.label
        });
    }

    // 加载单篇文章 JSON（支持 { file: "..." } 这种引用条目）
    function loadPostFile(path, cat) {
        return fetch(path, { cache: 'no-cache' })
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(post => {
                if (!post || typeof post !== 'object') return null;
                const decorated = decoratePost(post, cat);
                // 记录原始 JSON 文件路径，方便从详情页跳转到编辑器时直接定位文件
                decorated.sourceFile = path;
                return decorated;
            })
            .catch(err => {
                console.error('[TechBlog] 加载文章 "' + path + '" 失败:', err);
                return null;
            });
    }

    function loadCategoryPosts(cat) {
        if (!cat.file) return Promise.resolve([]);
        return fetch(cat.file, { cache: 'no-cache' })
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(arr => {
                if (!Array.isArray(arr)) return [];
                // 数组里每一项可以是：
                //   1. { file: "assets/data/blog/xxx/yyy.json" } —— 单篇文章独立文件（新格式）
                //   2. 直接内联的文章对象（旧格式，向后兼容）
                return Promise.all(arr.map(item => {
                    if (item && typeof item === 'object' && typeof item.file === 'string') {
                        return loadPostFile(item.file, cat);
                    }
                    return Promise.resolve(decoratePost(item, cat));
                })).then(list => list.filter(Boolean));
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

            // 并行加载每个分类的文章
            return Promise.all(list.map(loadCategoryPosts));
        })
        .then(groups => {
            if (!groups) return; // 上一步已处理错误
            posts = groups.reduce((acc, arr) => acc.concat(arr), []);
            // 默认按日期倒序，方便阅读
            posts.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
            renderFacetOptions();
            updateFilterCount();
            renderList();
            syncViewByHash();
        })
        .catch(err => {
            console.error('[TechBlog] 加载文章清单失败:', err);
            showLoadError('加载文章数据失败，请确认通过 HTTP 服务器访问页面（直接双击打开本地 file:// 会被浏览器拦截 fetch）。');
        });
})();
