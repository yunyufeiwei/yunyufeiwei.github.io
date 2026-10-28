(function () {
    'use strict';

    const MANIFEST_URL = 'assets/data/blog.json';
    const form = document.getElementById('categoryLinksForm');
    const status = document.getElementById('linkEditorStatus');
    const saveButton = document.getElementById('btnSaveLinks');
    let categories = [];

    form.addEventListener('submit', function (event) {
        event.preventDefault();
    });

    function setStatus(message, isError) {
        status.textContent = message;
        status.classList.toggle('error', Boolean(isError));
    }

    function renderCategories() {
        form.replaceChildren();
        categories.forEach(function (category, index) {
            const row = document.createElement('div');
            row.className = 'meta-row';

            const field = document.createElement('div');
            field.className = 'meta-field';

            const label = document.createElement('label');
            label.htmlFor = 'categoryUrl' + index;
            label.textContent = category.label;

            const input = document.createElement('input');
            input.type = 'url';
            input.id = label.htmlFor;
            input.name = category.key;
            input.placeholder = 'https://example.com';
            input.value = category.externalUrl || '';
            input.autocomplete = 'url';

            field.append(label, input);
            row.appendChild(field);
            form.appendChild(row);
        });
    }

    function validateUrl(value) {
        if (!value) return true;
        try {
            const url = new URL(value);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (error) {
            return false;
        }
    }

    function downloadManifest() {
        for (let index = 0; index < categories.length; index++) {
            const input = form.elements[index];
            const value = input.value.trim();
            if (!validateUrl(value)) {
                setStatus('“' + categories[index].label + '”的链接无效，请填写有效的 HTTP 或 HTTPS 地址。', true);
                input.focus();
                return;
            }
            categories[index].externalUrl = value;
        }

        const content = JSON.stringify({ categories: categories }, null, 2) + '\n';
        const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'blog.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setStatus('分类链接配置已下载。请将 blog.json 替换到 assets/data/blog.json。', false);
    }

    fetch(MANIFEST_URL, { cache: 'no-cache' })
        .then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(function (manifest) {
            categories = manifest && Array.isArray(manifest.categories)
                ? manifest.categories
                : [];
            if (categories.length !== 6) {
                throw new Error('分类配置必须恰好包含 6 个分类');
            }
            renderCategories();
            saveButton.addEventListener('click', downloadManifest);
        })
        .catch(function (error) {
            console.error('[BlogLinkEditor] 加载分类配置失败:', error);
            setStatus('加载分类配置失败，请检查 assets/data/blog.json。', true);
            saveButton.disabled = true;
        });
})();
