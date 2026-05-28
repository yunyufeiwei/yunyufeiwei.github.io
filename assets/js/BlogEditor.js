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
    const quill = new Quill('#quillEditor', {
        theme: 'snow',
        placeholder: '在这里开始写作...\n\n可以直接粘贴图片（Ctrl+V），或从文件夹拖入图片。',
        modules: {
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

    // 监听粘贴事件
    quill.root.addEventListener('paste', function (e) {
        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        const items = clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = items[i].getAsFile();
                insertImageFile(file);
                return;
            }
        }
    });

    // 监听拖拽事件
    quill.root.addEventListener('drop', function (e) {
        const files = e.dataTransfer && e.dataTransfer.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            if (files[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                e.stopPropagation();
                insertImageFile(files[i]);
                return;
            }
        }
    });

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

    function saveDraft() {
        const draft = {
            title: $title.value,
            id: $id.value,
            category: $category.value,
            date: $date.value,
            tags: $tags.value,
            summary: $summary.value,
            content: quill.root.innerHTML,
            delta: quill.getContents()
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
                    result += processInline(child) + '\n\n';
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
                    // 如果是 base64 图片，提示用户需要手动保存
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

    /* ---------- 导出 JSON ---------- */
    document.getElementById('btnExportJson').addEventListener('click', function () {
        if (!validateMeta()) return;

        const markdown = htmlToMarkdown(quill.root.innerHTML);
        const lines = markdown.split('\n');

        const post = {
            id: $id.value.trim(),
            title: $title.value.trim(),
            date: $date.value,
            summary: $summary.value.trim(),
            tags: parseTags($tags.value),
            content: lines
        };

        const json = JSON.stringify([post], null, 2);
        showOutput(json, '将以上 JSON 内容粘贴到对应分类文件（assets/data/blog/' + $category.value + '.json）的数组中即可。');
    });

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
