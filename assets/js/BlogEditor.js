/* ==================== 博客编辑器逻辑 ====================
 * 功能：
 * 1. 初始化 Quill 富文本编辑器（所见即所得）
 * 2. 支持图片粘贴 / 拖拽插入（转为 Base64 内嵌或提示保存路径）
 * 3. 导出为 JSON（兼容现有 blog 数据格式）
 * 4. 导出为 Markdown 文件内容
 * 5. 自动保存到 localStorage，防止意外丢失
 * ============================================================ */
(function () {
    'use strict';

    /* ---------- 初始化 Quill 编辑器 ---------- */
    // 工具栏按钮支持的语言列表（与阅读端 highlight.js 已注册语言保持一致）
    const CODE_LANGS = [
        { value: 'cpp',        label: 'C++' },
        { value: 'csharp',     label: 'C#' },
        { value: 'hlsl',       label: 'HLSL' },
        { value: 'glsl',       label: 'GLSL' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python',     label: 'Python' },
        { value: 'json',       label: 'JSON' },
        { value: 'xml',        label: 'XML / HTML' },
        { value: 'css',        label: 'CSS' },
        { value: 'bash',       label: 'Bash' },
        { value: 'plaintext',  label: '纯文本' }
    ];

    // 让 Quill 的 syntax 模块知道有 hljs 可用
    const hasHljs = typeof window.hljs !== 'undefined';

    const quill = new Quill('#quillEditor', {
        theme: 'snow',
        placeholder: '在这里开始写作...\n\n可以直接粘贴图片（Ctrl+V），或从文件夹拖入图片。\n插入代码请先点击工具栏的「代码块」按钮，再选择语言。',
        modules: {
            syntax: hasHljs ? {
                hljs: window.hljs,
                languages: CODE_LANGS.map(function (l) {
                    return { key: l.value, label: l.label };
                })
            } : false,
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                [{ color: [] }, { background: [] }],
                ['clean']
            ]
        }
    });

    /* ---------- 给「代码块」按钮挂一个语言下拉 ---------- */
    setupCodeBlockLangPicker();
    overrideCodeBlockToolbarHandler();
    suppressDataUrlImagesFromClipboardHtml();
    setupImageAlignPopover();

    /**
     * Quill 在粘贴时会同时解析剪贴板里的 HTML，遇到 <img src="data:..."> 也会被它当成
     * 一张图插入，这会和我们 paste 监听器插入的图重复，出现"粘一张变两张"。
     * 这里用 clipboard matcher 把 HTML 路径里的 base64 图直接丢弃，只保留我们自己处理的那一张。
     */
    function suppressDataUrlImagesFromClipboardHtml() {
        const clipboard = quill.getModule('clipboard');
        if (!clipboard || typeof clipboard.addMatcher !== 'function') return;
        clipboard.addMatcher('img', function (node, delta) {
            const Delta = Quill.import('delta');
            const src = node.getAttribute && node.getAttribute('src');
            if (src && src.startsWith('data:')) {
                // 返回空 Delta：HTML 里这张 base64 图被忽略
                return new Delta();
            }
            return delta;
        });
    }

    /* ---------- 图片对齐浮窗 ---------- */
    function setupImageAlignPopover() {
        const editorEl = quill.root;
        const popover = document.createElement('div');
        popover.className = 'img-align-popover';
        popover.style.display = 'none';
        popover.innerHTML =
            '<button type="button" data-align="" title="左对齐">' +
                '<i class="uil uil-align-left"></i></button>' +
            '<button type="button" data-align="center" title="居中对齐">' +
                '<i class="uil uil-align-center-alt"></i></button>' +
            '<button type="button" data-align="right" title="右对齐">' +
                '<i class="uil uil-align-right"></i></button>';
        document.body.appendChild(popover);

        let activeImg = null;

        function hide() {
            popover.style.display = 'none';
            activeImg = null;
        }

        function showFor(img) {
            activeImg = img;
            // 先把弹层放到 DOM 里以测量尺寸，再定位
            popover.style.display = 'inline-flex';
            const r = img.getBoundingClientRect();
            const top = window.scrollY + r.top - popover.offsetHeight - 8;
            const left = window.scrollX + r.left + (r.width - popover.offsetWidth) / 2;
            popover.style.top  = Math.max(window.scrollY + 4, top) + 'px';
            popover.style.left = Math.max(8, left) + 'px';

            // 高亮当前对齐
            const pBlot = img.closest('p, li, div');
            const align = pBlot ? (pBlot.classList.contains('ql-align-center') ? 'center'
                            : pBlot.classList.contains('ql-align-right')  ? 'right'
                            : pBlot.classList.contains('ql-align-justify') ? 'justify'
                            : '') : '';
            popover.querySelectorAll('button').forEach(function (b) {
                b.classList.toggle('active', (b.getAttribute('data-align') || '') === align);
            });
        }

        // 点编辑器内的图片：弹起浮窗
        editorEl.addEventListener('click', function (e) {
            const target = e.target;
            if (target && target.tagName === 'IMG' && editorEl.contains(target)) {
                // 让 Quill 把光标定位到这张图上，便于 format() 作用到该行
                const blot = Quill.find(target);
                if (blot && typeof blot.offset === 'function') {
                    const idx = blot.offset(quill.scroll);
                    quill.setSelection(idx, 1, 'user');
                }
                showFor(target);
                e.stopPropagation();
            } else if (!popover.contains(target)) {
                hide();
            }
        });

        // 文档其它位置点击：关闭
        document.addEventListener('mousedown', function (e) {
            if (popover.contains(e.target)) return;
            if (e.target && e.target.tagName === 'IMG' && editorEl.contains(e.target)) return;
            hide();
        });

        // 选区或文本变化时跟随关闭，避免错位
        quill.on('text-change', hide);
        quill.on('selection-change', function (range) {
            if (!range) hide();
        });
        window.addEventListener('resize', hide);
        window.addEventListener('scroll', hide, true);

        // 点对齐按钮：作用到当前图片所在行
        popover.addEventListener('click', function (e) {
            const btn = e.target.closest('button');
            if (!btn || !activeImg) return;
            e.preventDefault();
            const align = btn.getAttribute('data-align') || '';

            // 选中图片所在行后调用 format
            const blot = Quill.find(activeImg);
            if (blot && typeof blot.offset === 'function') {
                const idx = blot.offset(quill.scroll);
                quill.setSelection(idx, 1, 'user');
                quill.format('align', align || false, 'user');
            } else {
                // 兜底：直接给最近的块元素加/去 class
                const block = activeImg.closest('p, li, div');
                if (block) {
                    block.classList.remove('ql-align-center', 'ql-align-right', 'ql-align-justify');
                    if (align) block.classList.add('ql-align-' + align);
                }
            }
            // 重新计算高亮 & 位置
            showFor(activeImg);
        });
    }

    /**
     * 在指定位置确保有一个代码块行，并在其后追加一个空的普通段落行（如果不存在）。
     * 返回值：{ codeBlockIndex } —— 代码块行起点，便于把光标定位进去。
     */
    function ensureCodeBlockWithTrailingLine(index, lang) {
        const safeLang = lang || 'plaintext';

        // 1. 确保 index 处于一行的起点。如果光标当前不在行首，先补一个换行把当前行断开，
        //    避免把代码块格式套到已有内容上。
        if (index > 0) {
            const prevChar = quill.getText(index - 1, 1);
            if (prevChar !== '\n') {
                quill.insertText(index, '\n', 'user');
                index += 1;
            }
        }

        // 2. 一次性插入两个换行：
        //    - 第一个 \n 终结「代码块行」（这里就是空的代码块）
        //    - 第二个 \n 终结「代码块下方的空段落」，给用户留一行视觉与点击空间
        //    Quill 自身还有一个隐式的尾部 \n，所以最终代码块下方会有一行真实可见的空段落。
        quill.insertText(index, '\n\n', 'user');

        // 3. 把 [index, index+1) 这行（第一个 \n 所在行）格式化为 code-block
        quill.formatLine(index, 1, 'code-block', safeLang, 'user');

        // 4. 紧接的下一行（第二个 \n 所在行）显式去掉 code-block 格式，作为空白缓冲段落
        quill.formatLine(index + 1, 1, 'code-block', false, 'user');

        return { codeBlockIndex: index };
    }

    function overrideCodeBlockToolbarHandler() {
        const toolbar = quill.getModule('toolbar');
        if (!toolbar) return;
        toolbar.addHandler('code-block', function (value) {
            const range = quill.getSelection(true);
            if (!range) return;

            // 当前行已经是代码块 → 取消代码块格式（恢复 Quill 默认的 toggle 行为）
            const currentFormats = quill.getFormat(range);
            if (currentFormats && currentFormats['code-block']) {
                quill.format('code-block', false, 'user');
                return;
            }

            // 取语言下拉当前值作为默认语言（没有就用 plaintext）
            const sel = document.querySelector('.ql-code-lang-select');
            const lang = (sel && sel.value) || 'plaintext';

            const { codeBlockIndex } = ensureCodeBlockWithTrailingLine(range.index, lang);
            // 光标停在代码块行内，方便直接开始敲代码
            quill.setSelection(codeBlockIndex, 0, 'user');
        });
    }

    function setupCodeBlockLangPicker() {
        const toolbarEl = document.querySelector('.ql-toolbar');
        if (!toolbarEl) return;

        // Quill 2.x 在启用 syntax 模块时本身有 ql-code-block-container 的语言选择器，
        // 但它的样式不够直观；我们用一个独立的下拉，效果更明显。
        const wrapper = document.createElement('span');
        wrapper.className = 'ql-formats ql-code-lang-formats';

        const select = document.createElement('select');
        select.className = 'ql-code-lang-select';
        select.title = '选择代码块语言';
        CODE_LANGS.forEach(function (l) {
            const opt = document.createElement('option');
            opt.value = l.value;
            opt.textContent = l.label;
            select.appendChild(opt);
        });
        wrapper.appendChild(select);
        toolbarEl.appendChild(wrapper);

        // 切换下拉时：
        // 1. 如果光标在代码块内，直接换语言
        // 2. 否则插入一个新的代码块，并在其后留一个空白段落，方便继续输入
        select.addEventListener('change', function () {
            const lang = select.value;
            const range = quill.getSelection(true);
            if (!range) return;

            // 找到当前位置的代码块（如果存在）
            const [block] = quill.scroll.descendant(function (b) {
                return b && b.statics && b.statics.blotName === 'code-block';
            }, range.index) || [];

            if (block) {
                // 已经在代码块内，更新语言
                quill.formatLine(range.index, 1, 'code-block', lang, 'user');
            } else {
                const { codeBlockIndex } = ensureCodeBlockWithTrailingLine(range.index, lang);
                quill.setSelection(codeBlockIndex, 0, 'user');
            }
            // 触发一次重新高亮
            if (quill.options.modules.syntax && typeof quill.getModule === 'function') {
                const syntaxModule = quill.getModule('syntax');
                if (syntaxModule && typeof syntaxModule.highlight === 'function') {
                    syntaxModule.highlight();
                }
            }
        });

        // 当光标进入代码块时，自动把下拉同步到该代码块的语言
        quill.on('selection-change', function (range) {
            if (!range) return;
            const [block] = quill.scroll.descendant(function (b) {
                return b && b.statics && b.statics.blotName === 'code-block';
            }, range.index) || [];
            if (block && block.format) {
                const fmt = block.formats && block.formats();
                const lang = (fmt && fmt['code-block']) || 'plaintext';
                if (typeof lang === 'string') select.value = lang;
            }
        });
    }

    /* ---------- DOM 引用 ---------- */
    const $title    = document.getElementById('postTitle');
    const $id       = document.getElementById('postId');
    const $category = document.getElementById('postCategory');
    const $date     = document.getElementById('postDate');
    const $tags     = document.getElementById('postTags');
    const $summary  = document.getElementById('postSummary');
    const $output   = document.getElementById('outputSection');
    const $outputPre = document.getElementById('outputContent');

    /* ---------- 设置默认日期为今天 ---------- */
    const today = new Date().toISOString().slice(0, 10);
    $date.value = today;

    /* ---------- 自动生成 ID ---------- */
    $title.addEventListener('input', function () {
        // 只在 ID 为空或之前是自动生成的情况下才自动填充
        const currentId = $id.value;
        if (!currentId || $id.dataset.auto === 'true') {
            const generated = generateId($title.value);
            $id.value = generated;
            $id.dataset.auto = 'true';
        }
    });

    $id.addEventListener('input', function () {
        // 用户手动修改后不再自动生成
        $id.dataset.auto = 'false';
    });

    function generateId(title) {
        return title
            .toLowerCase()
            .replace(/[\u4e00-\u9fff]+/g, function (match) {
                // 中文保留拼音首字母的简单方案：直接用短横线替代
                return '-';
            })
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 40) || 'untitled';
    }

    /* ---------- 图片处理：粘贴和拖拽 ---------- */
    // 自定义图片上传处理器
    function imageHandler() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = function () {
            const file = input.files[0];
            if (file) {
                insertImageFile(file);
            }
        };
    }

    // 覆盖工具栏的图片按钮行为
    quill.getModule('toolbar').addHandler('image', imageHandler);

    // 监听粘贴事件（capture 阶段：在 Quill 自己的 paste 处理之前拦下来）
    quill.root.addEventListener('paste', function (e) {
        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        // 1) 优先看 files：截图工具粘贴出来的就是这种
        const files = clipboardData.files;
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                if (files[i].type.indexOf('image') === 0) {
                    e.preventDefault();
                    e.stopImmediatePropagation();   // 阻止 Quill 再次处理同一份剪贴板
                    insertImageFile(files[i]);
                    return;
                }
            }
        }

        // 2) 退而其次：items 里查 image 类型（Firefox 等老路径）
        const items = clipboardData.items;
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].kind === 'file' && items[i].type.indexOf('image') === 0) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const file = items[i].getAsFile();
                    if (file) insertImageFile(file);
                    return;
                }
            }
        }
        // 没有图片则不干预，让 Quill 走默认的文本/HTML 粘贴
    }, true);

    // 监听拖拽事件（同样使用 capture，避免被 Quill 的 drop 处理重复插入）
    quill.root.addEventListener('drop', function (e) {
        const files = e.dataTransfer && e.dataTransfer.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            if (files[i].type.indexOf('image') === 0) {
                e.preventDefault();
                e.stopImmediatePropagation();
                insertImageFile(files[i]);
                return;
            }
        }
    }, true);

    // 将图片文件转为 Base64 并插入编辑器
    function insertImageFile(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', e.target.result);
            quill.setSelection(range.index + 1);
        };
        reader.readAsDataURL(file);
    }

    /* ---------- 自动保存到 localStorage ---------- */
    const STORAGE_KEY = 'blogEditor_draft';

    /* ---------- 编辑模式状态 ----------
     * 当 currentEditPath 非空时，编辑器处于「修改已有文章」模式：
     *   - 主操作按钮文案变为「保存修改」
     *   - 保存时直接写回原文件，不再询问保存路径，也不重复注册分类索引
     *   - 顶部会显示一个编辑模式横幅，附带退出按钮
     */
    let currentEditPath   = '';   // 文章 JSON 在仓库里的相对路径（仅显示用）
    let currentEditHandle = null; // FileSystemFileHandle，写回时复用
    let currentEditCategory = ''; // 文章所属分类（用于在保存逻辑里判断索引）

    function saveDraft() {
        const draft = {
            title: $title.value,
            id: $id.value,
            category: $category.value,
            date: $date.value,
            tags: $tags.value,
            summary: $summary.value,
            content: quill.root.innerHTML,
            delta: quill.getContents(),
            // 把"编辑模式"也持久化下来，刷新后能继续修改同一篇文章
            // （文件 handle 没法序列化，所以只存路径；下次保存会再弹一次保存对话框）
            editPath: currentEditPath || ''
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        } catch (err) {
            // localStorage 满了就忽略
        }
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const draft = JSON.parse(raw);
            if (draft.title) $title.value = draft.title;
            if (draft.id) { $id.value = draft.id; $id.dataset.auto = 'false'; }
            if (draft.category) $category.value = draft.category;
            if (draft.date) $date.value = draft.date;
            if (draft.tags) $tags.value = draft.tags;
            if (draft.summary) $summary.value = draft.summary;
            if (draft.delta) {
                quill.setContents(draft.delta);
            } else if (draft.content) {
                quill.root.innerHTML = draft.content;
            }
            // 恢复编辑模式（文件 handle 不能持久化，下次保存仍需选一次文件）
            if (draft.editPath) {
                currentEditPath = draft.editPath;
                currentEditHandle = null;
            }
        } catch (err) {
            // 解析失败就忽略
        }
    }

    // 加载草稿
    loadDraft();

    // 定时保存（每 3 秒）
    setInterval(saveDraft, 3000);

    // 编辑器内容变化时也保存
    quill.on('text-change', function () {
        clearTimeout(quill._saveTimer);
        quill._saveTimer = setTimeout(saveDraft, 1000);
    });

    /* ---------- HTML 转 Markdown ---------- */
    // 从 ql-align-center / ql-align-right / ql-align-justify 中拿出对齐方式
    function pickAlignFromClass(el) {
        if (!el || !el.classList) return '';
        if (el.classList.contains('ql-align-center'))  return 'center';
        if (el.classList.contains('ql-align-right'))   return 'right';
        if (el.classList.contains('ql-align-justify')) return 'justify';
        return '';
    }

    // 段落里如果只有一张图（外加纯空白文本节点），返回这个 img；否则返回 null
    function findSoleImageInBlock(blockEl) {
        let img = null;
        for (let i = 0; i < blockEl.childNodes.length; i++) {
            const n = blockEl.childNodes[i];
            if (n.nodeType === Node.TEXT_NODE) {
                if (n.textContent.trim() !== '') return null;
                continue;
            }
            if (n.nodeType !== Node.ELEMENT_NODE) continue;
            const t = n.tagName && n.tagName.toLowerCase();
            if (t === 'br') continue;
            if (t === 'img') {
                if (img) return null; // 多于一张
                img = n;
                continue;
            }
            // 出现其它元素，就不是"纯图片段落"
            return null;
        }
        return img;
    }

    function escapeAttr(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // 生成可以放到 markdown 里的图片 HTML（用 class 标记对齐，正文样式由阅读端 CSS 控制）
    function imgHtmlMarkdown(img, align) {
        const alt = img.getAttribute('alt') || '图片';
        const src = img.getAttribute('src') || '';
        // base64 图：保持占位提示，提醒手动落盘
        const finalSrc = src.startsWith('data:')
            ? '【请将图片保存到 assets/ImageWork/Blog/ 目录并替换此路径】'
            : src;
        const cls = 'blog-img blog-img-align-' + (align || 'left');
        return '<img class="' + escapeAttr(cls) + '" src="' + escapeAttr(finalSrc) + '" alt="' + escapeAttr(alt) + '">';
    }

    function htmlToMarkdown(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return nodeToMd(div).trim();
    }

    function nodeToMd(node) {
        let result = '';

        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];

            if (child.nodeType === Node.TEXT_NODE) {
                result += child.textContent;
                continue;
            }

            if (child.nodeType !== Node.ELEMENT_NODE) continue;

            const tag = child.tagName.toLowerCase();

            // Quill 2 启用 syntax 模块时，代码块渲染为：
            //   <div class="ql-code-block-container">
            //     <div class="ql-code-block" data-language="cpp">line1</div>
            //     <div class="ql-code-block" data-language="cpp">line2</div>
            //   </div>
            if (tag === 'div' && child.classList && child.classList.contains('ql-code-block-container')) {
                const lines = child.querySelectorAll('.ql-code-block');
                let lang = '';
                if (lines.length > 0) {
                    lang = lines[0].getAttribute('data-language') || '';
                }
                if (lang === 'plaintext') lang = '';
                const codeText = Array.prototype.map.call(lines, function (l) {
                    return l.textContent;
                }).join('\n');
                result += '\n```' + lang + '\n' + codeText + '\n```\n\n';
                continue;
            }

            switch (tag) {
                case 'h1':
                    result += '\n# ' + child.textContent.trim() + '\n\n';
                    break;
                case 'h2':
                    result += '\n## ' + child.textContent.trim() + '\n\n';
                    break;
                case 'h3':
                    result += '\n### ' + child.textContent.trim() + '\n\n';
                    break;
                case 'p':
                    {
                        const align = pickAlignFromClass(child);
                        // 段落里"只有一张图（外加纯空白文本）"时输出 HTML img，保留对齐
                        const onlyImg = findSoleImageInBlock(child);
                        if (onlyImg && align) {
                            result += imgHtmlMarkdown(onlyImg, align) + '\n\n';
                            break;
                        }
                        // 段落整体居中/右对齐时，用 HTML 包裹
                        const inline = processInline(child);
                        if (align && inline.trim()) {
                            result += '<p class="blog-align-' + align + '">' + inline + '</p>\n\n';
                        } else {
                            result += inline + '\n\n';
                        }
                    }
                    break;
                case 'strong':
                case 'b':
                    result += '**' + child.textContent + '**';
                    break;
                case 'em':
                case 'i':
                    result += '*' + child.textContent + '*';
                    break;
                case 'u':
                    result += child.textContent;
                    break;
                case 's':
                case 'del':
                    result += '~~' + child.textContent + '~~';
                    break;
                case 'a':
                    result += '[' + child.textContent + '](' + (child.getAttribute('href') || '') + ')';
                    break;
                case 'img':
                    var alt = child.getAttribute('alt') || '图片';
                    var src = child.getAttribute('src') || '';
                    // 如果是 base64 图片，提示用户需要手动保存并替换路径
                    if (src.startsWith('data:')) {
                        result += '![' + alt + '](【请将图片保存到 assets/ImageWork/Blog/ 目录并替换此路径】)\n\n';
                    } else {
                        result += '![' + alt + '](' + src + ')\n\n';
                    }
                    break;
                case 'blockquote':
                    var lines = child.textContent.trim().split('\n');
                    result += lines.map(function (l) { return '> ' + l; }).join('\n') + '\n\n';
                    break;
                case 'pre':
                    var code = child.querySelector('code') || child;
                    var lang = '';
                    if (code.className) {
                        var m = code.className.match(/language-(\w+)/);
                        if (m) lang = m[1];
                    }
                    // pre.ql-syntax 上有 data-language 属性也兼容下
                    if (!lang && child.getAttribute) {
                        lang = child.getAttribute('data-language') || '';
                    }
                    if (lang === 'plaintext') lang = '';
                    result += '```' + lang + '\n' + code.textContent + '\n```\n\n';
                    break;
                case 'code':
                    result += '`' + child.textContent + '`';
                    break;
                case 'ul':
                    for (var j = 0; j < child.children.length; j++) {
                        result += '- ' + processInline(child.children[j]) + '\n';
                    }
                    result += '\n';
                    break;
                case 'ol':
                    for (var k = 0; k < child.children.length; k++) {
                        result += (k + 1) + '. ' + processInline(child.children[k]) + '\n';
                    }
                    result += '\n';
                    break;
                case 'br':
                    result += '\n';
                    break;
                default:
                    result += nodeToMd(child);
            }
        }

        return result;
    }

    function processInline(el) {
        let text = '';
        for (let i = 0; i < el.childNodes.length; i++) {
            const child = el.childNodes[i];
            if (child.nodeType === Node.TEXT_NODE) {
                text += child.textContent;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const tag = child.tagName.toLowerCase();
                switch (tag) {
                    case 'strong':
                    case 'b':
                        text += '**' + child.textContent + '**';
                        break;
                    case 'em':
                    case 'i':
                        text += '*' + child.textContent + '*';
                        break;
                    case 's':
                    case 'del':
                        text += '~~' + child.textContent + '~~';
                        break;
                    case 'a':
                        text += '[' + child.textContent + '](' + (child.getAttribute('href') || '') + ')';
                        break;
                    case 'code':
                        text += '`' + child.textContent + '`';
                        break;
                    case 'img':
                        var src = child.getAttribute('src') || '';
                        var alt = child.getAttribute('alt') || '图片';
                        if (src.startsWith('data:')) {
                            text += '![' + alt + '](【请将图片保存到 assets/ImageWork/Blog/ 目录并替换此路径】)';
                        } else {
                            text += '![' + alt + '](' + src + ')';
                        }
                        break;
                    case 'br':
                        text += '\n';
                        break;
                    default:
                        text += child.textContent;
                }
            }
        }
        return text;
    }

    /* ---------- 导出 JSON：每次导出时由用户选择保存路径 ---------- */
    // 清掉历史版本可能写入 IndexedDB 的项目根目录 handle，保持干净
    if (typeof indexedDB !== 'undefined') {
        try { indexedDB.deleteDatabase('blogEditor'); } catch (e) { /* ignore */ }
    }

    document.getElementById('btnExportJson').addEventListener('click', function () {
        if (!validateMeta()) return;

        const markdown = htmlToMarkdown(quill.root.innerHTML);
        const lines = markdown.split('\n');
        const id = $id.value.trim();
        const category = $category.value;

        const post = {
            id: id,
            title: $title.value.trim(),
            date: $date.value,
            summary: $summary.value.trim(),
            tags: parseTags($tags.value),
            content: lines
        };

        if (currentEditPath) {
            // 编辑模式：直接写回原文件
            saveExistingArticle(post).catch(function (err) {
                if (err && err.name === 'AbortError') return;
                console.error('[BlogEditor] 保存修改失败:', err);
                alert('保存修改失败：' + (err && err.message ? err.message : err));
            });
        } else {
            savePostJsonFile(post, category);
        }
    });

    /* ---------- 编辑已有文章：加载 / 写回 ---------- */
    setupEditMode();

    /**
     * 把 article.content（markdown 字符串数组）转换成 Quill 可接受的 HTML，
     * 并尽量还原我们站点自定义的：
     *   - 段落对齐（<p class="blog-align-X"> -> <p class="ql-align-X">）
     *   - 图片对齐（<img class="blog-img blog-img-align-X"> 包到对齐 <p>）
     *   - 代码块（<pre><code class="language-XXX"> -> Quill 2 syntax 模块的容器）
     */
    function articleMarkdownToEditorHtml(content) {
        let md = Array.isArray(content) ? content.join('\n') : String(content || '');
        if (typeof marked === 'undefined') {
            return '<pre>' + escapeHTML(md) + '</pre>';
        }
        if (marked.setOptions) {
            marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });
        }

        // 预处理：把站点自定义的 <img class="blog-img blog-img-align-X" ...> 直接包成
        // Quill 用的 <p class="ql-align-X"><img></p>。这样 marked 不需要再考虑这些 raw HTML。
        md = md.replace(/<img\b[^>]*class="[^"]*blog-img-align-(\w+)[^"]*"[^>]*>/g,
            function (imgTag, align) {
                // 去掉自定义 class，避免阅读端 CSS 在编辑器里"双重对齐"
                const cleaned = imgTag.replace(/\s*class="[^"]*"/, '');
                if (align === 'left' || !align) return '<p>' + cleaned + '</p>';
                return '<p class="ql-align-' + align + '">' + cleaned + '</p>';
            });

        // 把 <p class="blog-align-X"> 也改成 Quill 的对齐 class
        md = md.replace(/<p class="blog-align-(\w+)">/g, '<p class="ql-align-$1">');

        let html = (typeof marked.parse === 'function') ? marked.parse(md) : marked(md);

        // <pre><code class="language-XX">...</code></pre>  ->  Quill 2 syntax 模块的容器
        html = html.replace(/<pre><code(?:\s+class="language-([\w+#-]+)")?>([\s\S]*?)<\/code><\/pre>/g,
            function (_m, lang, body) {
                const language = lang || 'plaintext';
                // marked 输出的 code body 已被 HTML 转义，这正是 Quill 代码块行所需的形态
                const stripped = body.replace(/\n$/, '');
                const codeLines = stripped.split('\n');
                const inner = codeLines.map(function (line) {
                    const safe = line.length ? line : '<br>';
                    return '<div class="ql-code-block" data-language="' +
                           escapeAttr(language) + '">' + safe + '</div>';
                }).join('');
                return '<div class="ql-code-block-container">' + inner + '</div>';
            });

        return html;
    }

    function setupEditMode() {
        const $btnLoad   = document.getElementById('btnLoadArticle');
        const $banner    = document.getElementById('editModeBanner');
        const $bannerPth = document.getElementById('editModePath');
        const $btnExit   = document.getElementById('btnExitEdit');
        const $primary   = document.getElementById('btnExportJson');
        const $primaryLbl = $primary ? $primary.querySelector('span[data-label-default]') : null;

        function refreshUi() {
            if (currentEditPath) {
                if ($banner)    $banner.style.display = 'inline-flex';
                if ($bannerPth) $bannerPth.textContent = currentEditPath;
                if ($primaryLbl) $primaryLbl.textContent = $primaryLbl.getAttribute('data-label-edit') || '保存修改';
            } else {
                if ($banner)    $banner.style.display = 'none';
                if ($bannerPth) $bannerPth.textContent = '';
                if ($primaryLbl) $primaryLbl.textContent = $primaryLbl.getAttribute('data-label-default') || '导出 JSON';
            }
        }

        // 暴露给保存逻辑使用
        window.__blogEditorRefreshEditUi = refreshUi;

        if ($btnLoad) {
            $btnLoad.addEventListener('click', function () {
                pickAndLoadArticle().catch(function (err) {
                    if (err && err.name === 'AbortError') return;
                    console.error('[BlogEditor] 加载文章失败:', err);
                    alert('加载文章失败：' + (err && err.message ? err.message : err));
                });
            });
        }

        if ($btnExit) {
            $btnExit.addEventListener('click', function () {
                exitEditMode();
            });
        }

        // 通过 URL ?edit=<path> 自动加载（一般是从博客详情页跳过来）
        const params = new URLSearchParams(window.location.search);
        const editPath = params.get('edit');
        if (editPath) {
            loadArticleByUrl(editPath).catch(function (err) {
                console.error('[BlogEditor] 通过 URL 加载文章失败:', err);
                alert('加载文章失败：' + (err && err.message ? err.message : err) +
                    '\n\n你也可以点击「加载已有文章」手动选择 JSON 文件。');
            });
        }

        refreshUi();
    }

    async function pickAndLoadArticle() {
        if (!window.showOpenFilePicker) {
            alert('当前浏览器不支持选择本地文件，请使用 Chrome / Edge 等 Chromium 内核浏览器，' +
                  '并通过 https 或 http://localhost 打开本页面。');
            return;
        }
        const [handle] = await window.showOpenFilePicker({
            multiple: false,
            types: [{
                description: '博客文章 JSON',
                accept: { 'application/json': ['.json'] }
            }]
        });
        const file = await handle.getFile();
        const text = await file.text();
        let post;
        try {
            post = JSON.parse(text);
        } catch (e) {
            alert('JSON 解析失败：' + e.message);
            return;
        }
        applyArticleToEditor(post, file.name);
        currentEditHandle = handle;
        currentEditPath   = file.name; // 浏览器只暴露文件名，不会暴露完整路径
        if (window.__blogEditorRefreshEditUi) window.__blogEditorRefreshEditUi();
    }

    async function loadArticleByUrl(path) {
        const res = await fetch(path, { cache: 'no-cache' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const post = await res.json();
        applyArticleToEditor(post, path);
        currentEditHandle = null;        // fetch 路径拿不到 FileSystemFileHandle
        currentEditPath   = path;        // 仅用于显示与默认文件名
        if (window.__blogEditorRefreshEditUi) window.__blogEditorRefreshEditUi();
    }

    function applyArticleToEditor(post, hintName) {
        if (!post || typeof post !== 'object') {
            alert('文章数据格式不正确。');
            return;
        }

        $title.value    = post.title    || '';
        $id.value       = post.id       || '';
        $id.dataset.auto = 'false';
        $date.value     = post.date     || today;
        $summary.value  = post.summary  || '';
        $tags.value     = Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '');

        // 通过文件路径推断分类；如果无法推断，保留下拉框现值
        const m = /assets\/data\/blog\/([^/]+)\//.exec(hintName || '');
        if (m && $category.querySelector('option[value="' + m[1] + '"]')) {
            $category.value = m[1];
            currentEditCategory = m[1];
        } else if (post.category && $category.querySelector('option[value="' + post.category + '"]')) {
            $category.value = post.category;
            currentEditCategory = post.category;
        }

        // 正文：优先 inline content；contentFile 暂不支持回写编辑
        if (post.content !== undefined && post.content !== null) {
            const html = articleMarkdownToEditorHtml(post.content);
            const delta = quill.clipboard.convert({ html: html });
            quill.setContents(delta, 'silent');
        } else if (post.contentFile) {
            quill.setContents([], 'silent');
            alert('该文章正文存放在外部 Markdown 文件（' + post.contentFile +
                '）。请直接编辑该 .md 文件；本编辑器目前仅支持回写正文内联在 JSON 中的文章。');
        } else {
            quill.setContents([], 'silent');
        }

        // 立即保存一次草稿，确保意外刷新也能恢复
        try { saveDraft(); } catch (e) { /* ignore */ }
    }

    function exitEditMode() {
        currentEditPath     = '';
        currentEditHandle   = null;
        currentEditCategory = '';
        if (window.__blogEditorRefreshEditUi) window.__blogEditorRefreshEditUi();
    }

    /**
     * 编辑模式下的保存：直接写回原文件。如果还没拿到 handle（通过 URL 加载的情况），
     * 弹一次保存对话框，建议名为原始文件名，由用户确认覆盖。
     */
    async function saveExistingArticle(post) {
        const json = JSON.stringify(post, null, 2);
        const filename = (currentEditPath.split('/').pop()) || (post.id + '.json');

        if (!currentEditHandle) {
            if (!window.showSaveFilePicker) {
                fallbackDownload(filename, json);
                showOutput(json,
                    '当前浏览器不支持直接写回文件，已触发下载。\n请用下载的 ' +
                    filename + ' 覆盖 ' + currentEditPath);
                return;
            }
            try {
                currentEditHandle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: '博客文章 JSON',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
            } catch (err) {
                if (err && err.name === 'AbortError') return;
                console.error('[BlogEditor] 选择文件失败:', err);
                alert('选择文件失败：' + (err && err.message ? err.message : err));
                return;
            }
        } else if (typeof currentEditHandle.requestPermission === 'function') {
            const perm = await currentEditHandle.requestPermission({ mode: 'readwrite' });
            if (perm !== 'granted') {
                alert('未获得文件写入权限，无法保存。');
                return;
            }
        }

        try {
            await writeHandle(currentEditHandle, json);
            showOutput(json, '✓ 已保存修改：' + (currentEditHandle.name || filename));
        } catch (err) {
            console.error('[BlogEditor] 写回文件失败:', err);
            alert('写回文件失败：' + (err && err.message ? err.message : err));
        }
    }

    /* ---------- File System Access 工具 ---------- */
    async function writeHandle(handle, content) {
        const writable = await handle.createWritable();
        try { await writable.write(content); }
        finally { await writable.close(); }
    }

    /**
     * 保存文章 JSON：弹系统保存对话框让用户每次自由选择路径，
     * 默认建议文件名为 `<id>.json`。保存成功后再询问是否同时更新分类索引文件。
     * 浏览器不支持 File System Access 时退化为下载。
     */
    async function savePostJsonFile(post, category) {
        const filename = post.id + '.json';
        const json = JSON.stringify(post, null, 2);
        const relPath = 'assets/data/blog/' + category + '/' + filename;
        const indexRelPath = 'assets/data/blog/' + category + '.json';
        const indexEntry = { file: relPath };

        // ----- 兜底：浏览器没有 File System Access API -----
        if (!window.showSaveFilePicker) {
            fallbackDownload(filename, json);
            showOutput(json,
                '当前浏览器不支持直接选择保存路径（需要 Chromium 内核 + https/localhost）。\n' +
                '已触发下载，请把 ' + filename + ' 移动到 ' + relPath + '，\n' +
                '并在 ' + indexRelPath + ' 中追加：\n  ' + JSON.stringify(indexEntry));
            return;
        }

        // 1. 弹系统保存对话框，让用户选择文章 JSON 的保存位置
        let articleHandle;
        try {
            articleHandle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: '博客文章 JSON',
                    accept: { 'application/json': ['.json'] }
                }]
            });
        } catch (err) {
            if (err && err.name === 'AbortError') return; // 用户取消
            console.error('[BlogEditor] 选择保存位置失败:', err);
            fallbackDownload(filename, json);
            showOutput(json, '⚠ 选择保存位置失败，已退化为下载。建议手动放入 ' + relPath);
            return;
        }

        // 2. 写入文章文件
        try {
            await writeHandle(articleHandle, json);
        } catch (err) {
            console.error('[BlogEditor] 写入文章 JSON 失败:', err);
            alert('写入文件失败：' + (err && err.message ? err.message : err));
            return;
        }

        // 3. 询问是否同步更新分类索引（让用户自己挑索引文件即可，不做持久化）
        const wantUpdate = confirm(
            '✓ 文章已保存为：' + articleHandle.name + '\n\n' +
            '是否同时把这篇文章注册到分类索引 ' + category + '.json？\n' +
            '点击「确定」会再弹一次文件选择对话框，请选中对应的 ' + indexRelPath + '；\n' +
            '点击「取消」则需要你手动在索引中追加条目。'
        );
        if (!wantUpdate) {
            showOutput(json,
                '✓ 已保存：' + articleHandle.name + '\n\n' +
                '如需手动注册到分类索引，添加：\n  ' + JSON.stringify(indexEntry));
            return;
        }

        try {
            const result = await updateCategoryIndex(indexEntry);
            showOutput(json,
                '✓ 已保存：' + articleHandle.name + '\n' +
                (result.exists
                    ? '✓ 索引已包含该条目，未重复添加：' + result.indexName
                    : '✓ 已追加索引条目至：' + result.indexName));
        } catch (err) {
            if (err && err.name === 'AbortError') {
                showOutput(json,
                    '✓ 已保存：' + articleHandle.name + '\n' +
                    '索引文件未更新（已取消）。手动追加条目：\n  ' + JSON.stringify(indexEntry));
                return;
            }
            console.error('[BlogEditor] 更新分类索引失败:', err);
            alert('更新索引失败：' + (err && err.message ? err.message : err) +
                '\n请手动在 ' + indexRelPath + ' 中追加：\n' + JSON.stringify(indexEntry));
        }
    }

    /**
     * 让用户挑一个分类索引 JSON 并把条目追加进去（已存在则跳过）。
     * 返回 { exists, indexName }，AbortError 表示用户取消。
     */
    async function updateCategoryIndex(indexEntry) {
        const [indexHandle] = await window.showOpenFilePicker({
            multiple: false,
            types: [{
                description: '分类索引 JSON',
                accept: { 'application/json': ['.json'] }
            }]
        });

        if (typeof indexHandle.requestPermission === 'function') {
            const perm = await indexHandle.requestPermission({ mode: 'readwrite' });
            if (perm !== 'granted') {
                throw new Error('未获得索引文件的写入权限');
            }
        }

        const file = await indexHandle.getFile();
        const text = await file.text();
        let arr = [];
        if (text.trim()) {
            try {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) arr = parsed;
                else throw new Error('not an array');
            } catch (e) {
                if (!confirm('索引文件 ' + indexHandle.name + ' 不是合法 JSON 数组，是否重置为只包含本文章的索引？')) {
                    throw new Error('索引文件解析失败');
                }
                arr = [];
            }
        }

        const exists = arr.some(function (item) {
            return item && typeof item === 'object' && item.file === indexEntry.file;
        });
        if (!exists) {
            arr.push(indexEntry);
            await writeHandle(indexHandle, JSON.stringify(arr, null, 2) + '\n');
        }
        return { exists: exists, indexName: indexHandle.name };
    }

    function fallbackDownload(filename, content) {
        const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    /* ---------- 导出 Markdown ---------- */
    document.getElementById('btnExportMd').addEventListener('click', function () {
        if (!validateMeta()) return;

        const markdown = htmlToMarkdown(quill.root.innerHTML);
        const filename = $id.value.trim() + '.md';

        // 生成带 front-matter 风格的说明头
        const header = '<!-- \n' +
            '  文章ID: ' + $id.value.trim() + '\n' +
            '  标题: ' + $title.value.trim() + '\n' +
            '  分类: ' + $category.value + '\n' +
            '  日期: ' + $date.value + '\n' +
            '  标签: ' + $tags.value + '\n' +
            '  摘要: ' + $summary.value.trim() + '\n' +
            '-->\n\n';

        showOutput(header + markdown,
            '将以上内容保存为 assets/data/posts/' + filename +
            '，然后在分类 JSON 中添加条目并设置 "contentFile": "assets/data/posts/' + filename + '"');
    });

    /* ---------- 预览 ---------- */
    document.getElementById('btnPreview').addEventListener('click', function () {
        const html = quill.root.innerHTML;
        const win = window.open('', '_blank');
        win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8">' +
            '<title>预览 - ' + ($title.value || '未命名') + '</title>' +
            '<style>body{max-width:800px;margin:2rem auto;padding:0 1.5rem;font-family:sans-serif;line-height:1.8;color:#333;}' +
            'img{max-width:100%;border-radius:8px;}pre{background:#f5f5f5;padding:1rem;border-radius:8px;overflow-x:auto;}' +
            'code{background:#f0f0f0;padding:2px 5px;border-radius:3px;}blockquote{border-left:3px solid #6c63ff;padding-left:1rem;color:#666;}</style>' +
            '</head><body>' +
            '<h1>' + escapeHTML($title.value || '未命名文章') + '</h1>' +
            '<p style="color:#888;">' + $date.value + ' · ' + parseTags($tags.value).map(function (t) { return '#' + t; }).join(' ') + '</p>' +
            '<p><em>' + escapeHTML($summary.value) + '</em></p><hr>' +
            html +
            '</body></html>');
        win.document.close();
    });

    /* ---------- 清空 ---------- */
    document.getElementById('btnClear').addEventListener('click', function () {
        if (!confirm('确定要清空所有内容吗？此操作不可撤销。')) return;
        $title.value = '';
        $id.value = '';
        $id.dataset.auto = 'true';
        $category.value = '';
        $date.value = today;
        $tags.value = '';
        $summary.value = '';
        quill.setContents([]);
        $output.classList.remove('visible');
        localStorage.removeItem(STORAGE_KEY);
        // 清空也意味着退出编辑模式
        currentEditPath     = '';
        currentEditHandle   = null;
        currentEditCategory = '';
        if (window.__blogEditorRefreshEditUi) window.__blogEditorRefreshEditUi();
    });

    /* ---------- 复制按钮 ---------- */
    document.getElementById('btnCopy').addEventListener('click', function () {
        const text = $outputPre.textContent;
        navigator.clipboard.writeText(text).then(function () {
            var btn = document.getElementById('btnCopy');
            btn.textContent = '已复制 ✓';
            setTimeout(function () { btn.textContent = '复制'; }, 2000);
        });
    });

    /* ---------- 工具函数 ---------- */
    function validateMeta() {
        if (!$title.value.trim()) {
            alert('请填写文章标题');
            $title.focus();
            return false;
        }
        if (!$id.value.trim()) {
            alert('请填写文章 ID');
            $id.focus();
            return false;
        }
        if (!$category.value) {
            alert('请选择文章分类');
            $category.focus();
            return false;
        }
        return true;
    }

    function parseTags(str) {
        return (str || '').split(/[,，、]/)
            .map(function (t) { return t.trim(); })
            .filter(function (t) { return t.length > 0; });
    }

    function showOutput(content, hint) {
        $outputPre.textContent = content;
        if (hint) {
            $outputPre.textContent += '\n\n/* ' + hint + ' */';
        }
        $output.classList.add('visible');
        $output.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

})();
