(function () {
    'use strict';

    const MANIFEST_URL = 'assets/data/blog.json';
    const $blogList = document.getElementById('blogList');
    const $journalGrid = document.getElementById('journalCategoryGrid');
    const $empty = document.getElementById('blogEmpty');

    function safeExternalUrl(value) {
        if (!value) return '';
        try {
            const url = new URL(value);
            return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
        } catch (error) {
            return '';
        }
    }

    function createVisual(category, className) {
        const visual = document.createElement('span');
        visual.className = className;
        if (category.iconImage && category.iconImage.indexOf('assets/') === 0) {
            const image = document.createElement('img');
            image.src = category.iconImage;
            image.alt = '';
            image.loading = 'lazy';
            visual.appendChild(image);
        } else {
            const icon = document.createElement('i');
            icon.className = 'uil ' + (category.icon || 'uil-bookmark');
            icon.setAttribute('aria-hidden', 'true');
            visual.appendChild(icon);
        }
        return visual;
    }

    function renderBlogCard(category) {
        const url = safeExternalUrl(category.externalUrl);
        const card = document.createElement(url ? 'a' : 'article');
        card.className = 'blog-card blog-category-card';
        if (url) {
            card.href = url;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
        }
        card.appendChild(createVisual(category, 'blog-category-visual'));
        const name = document.createElement('span');
        name.className = 'blog-category-name';
        name.textContent = category.label || '';
        card.appendChild(name);
        const action = document.createElement('span');
        action.className = 'blog-category-action';
        action.textContent = url ? '打开外部链接 ↗' : '外部链接待添加';
        card.appendChild(action);
        return card;
    }

    function renderHomeCard(category) {
        const url = safeExternalUrl(category.externalUrl);
        const card = document.createElement(url ? 'a' : 'article');
        card.className = 'journal-card journal-category-card';
        if (url) {
            card.href = url;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
        }
        const image = document.createElement('div');
        image.className = 'journal-image';
        image.appendChild(createVisual(category, 'journal-category-visual'));
        card.appendChild(image);
        const content = document.createElement('div');
        content.className = 'journal-content';
        const title = document.createElement('h3');
        title.textContent = category.label || '';
        const action = document.createElement('span');
        action.className = 'journal-read';
        action.textContent = url ? '打开外部链接 ↗' : '外部链接待添加';
        content.append(title, action);
        card.appendChild(content);
        return card;
    }

    function appendCards(container, categories, renderCard) {
        container.replaceChildren();
        categories.forEach(function (category) {
            container.appendChild(renderCard(category));
        });
    }

    function showLoadError() {
        if ($empty) $empty.style.display = 'block';
        if ($blogList) $blogList.replaceChildren();
        if ($journalGrid) {
            const message = document.createElement('p');
            message.className = 'journal-category-loading';
            message.textContent = '分类加载失败，请稍后重试。';
            $journalGrid.replaceChildren(message);
        }
    }

    fetch(MANIFEST_URL, { cache: 'no-cache' })
        .then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(function (manifest) {
            const categories = manifest && Array.isArray(manifest.categories)
                ? manifest.categories
                : [];
            if (categories.length !== 6) {
                throw new Error('博客分类配置必须恰好包含 6 个分类');
            }

            if ($blogList) {
                appendCards($blogList, categories, renderBlogCard);
            }
            if ($journalGrid) {
                appendCards($journalGrid, categories, renderHomeCard);
            }
            if ($empty) $empty.style.display = 'none';
        })
        .catch(function (error) {
            console.error('[BlogCategories] 加载分类失败:', error);
            showLoadError();
        });
})();
