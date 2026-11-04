(() => {
    const categories = window.unityShaderReferenceData;
    const tabList = document.querySelector('.shader-reference-tabs');
    const content = document.querySelector('.shader-reference-content');

    if (!Array.isArray(categories) || !tabList || !content) {
        console.error('UnityShaderReference content or page elements are missing.');
        return;
    }

    function createEntry(entry) {
        if (entry.image) {
            const figure = document.createElement('figure');
            figure.className = 'shader-reference-image';
            const image = document.createElement('img');
            image.src = entry.image;
            image.alt = entry.title;
            image.loading = 'lazy';
            figure.append(image);
            return figure;
        }

        const article = document.createElement('article');
        article.className = 'shader-reference-entry';
        if (entry.title) {
            const title = document.createElement('h3');
            title.textContent = entry.title;
            article.append(title);
        }

        if (entry.url) {
            const link = document.createElement('a');
            link.className = 'shader-reference-entry-link';
            link.href = entry.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = entry.url;
            article.append(link);
        } else if (entry.body) {
            const body = document.createElement('p');
            body.className = 'shader-reference-entry-body';
            body.textContent = entry.body;
            article.append(body);
        }
        return article;
    }

    function createPanel(category, index) {
        const panel = document.createElement('section');
        panel.className = 'shader-reference-panel';
        panel.id = `panel-${category.id}`;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', `tab-${category.id}`);
        panel.tabIndex = 0;
        panel.hidden = index !== 0;

        category.groups.forEach((group) => {
            const section = document.createElement('section');
            section.className = 'shader-reference-section';
            const heading = document.createElement('h2');
            heading.textContent = group.title;
            section.append(heading);
            group.entries.forEach((entry) => section.append(createEntry(entry)));
            panel.append(section);
        });
        return panel;
    }

    categories.forEach((category, index) => {
        const tab = document.createElement('button');
        tab.className = 'shader-reference-tab';
        tab.type = 'button';
        tab.id = `tab-${category.id}`;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', `panel-${category.id}`);
        tab.setAttribute('aria-selected', String(index === 0));
        tab.tabIndex = index === 0 ? 0 : -1;
        tab.dataset.tab = category.id;
        tab.textContent = category.label;
        tabList.append(tab);
        content.append(createPanel(category, index));
    });

    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
    const panels = Array.from(content.querySelectorAll('[role="tabpanel"]'));

    function activate(tab, moveFocus = false, addHistory = false) {
        tabs.forEach((item) => {
            const selected = item === tab;
            item.setAttribute('aria-selected', String(selected));
            item.tabIndex = selected ? 0 : -1;
        });
        panels.forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
        if (moveFocus) tab.focus();
        const hash = `#${tab.dataset.tab}`;
        if (location.hash !== hash) {
            const method = addHistory ? 'pushState' : 'replaceState';
            history[method](null, '', hash);
        }
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activate(tab, false, true));
        tab.addEventListener('keydown', (event) => {
            let nextIndex;
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
            else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
            else if (event.key === 'Home') nextIndex = 0;
            else if (event.key === 'End') nextIndex = tabs.length - 1;
            if (nextIndex !== undefined) {
                event.preventDefault();
                activate(tabs[nextIndex], true, true);
            }
        });
    });

    function activateFromHash() {
        const id = location.hash.slice(1);
        const tab = tabs.find((item) => item.dataset.tab === id) || tabs[0];
        activate(tab);
    }

    window.addEventListener('popstate', activateFromHash);
    window.addEventListener('hashchange', activateFromHash);
    activateFromHash();
})();
