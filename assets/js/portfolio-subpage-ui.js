(function() {
    const nav = document.querySelector('.top-nav');
    const fileName = window.location.pathname.split('/').pop();
    const pageTitle = {
        'ThreeRenderingTwo.html': '三渲二场景作品展示库',
        'SceneArtist.html': '场景美术作品展示库',
        'TechnicalArtist.html': '技术美术作品展示库'
    }[fileName] || '游戏作品展示库';

    if (nav) {
        nav.innerHTML = '<div class="nav-brand"><span class="nav-mark" aria-hidden="true"></span><div class="nav-brand-copy"><strong>我的作品</strong><span class="nav-divider" aria-hidden="true"></span><span>' + pageTitle + '</span></div></div>';
        const linkItems = {
            'SceneArtist.html': [{ label: '更多关卡地编 ↗', href: 'https://my.feishu.cn/wiki/RMz3waM1jiYyLvkB24kccMdpnGh?fromScene=spaceOverview' }],
            'TechnicalArtist.html': [
                { label: 'Unity更多作品 ↗', href: 'https://my.feishu.cn/wiki/OvUFwFGnSi5LA2kvERcccy93n6S?fromScene=spaceOverview' },
                { label: 'Unreal更多作品 ↗', href: 'https://my.feishu.cn/wiki/TCXrwTJWdi1SIOkenIacKxyQnNU?fromScene=spaceOverview' }
            ]
        }[fileName] || [];
        if (linkItems.length) {
            const links = document.createElement('div');
            links.className = 'nav-links';
            linkItems.forEach(function(item) {
                const link = document.createElement('a');
                link.className = 'nav-link-btn';
                link.href = item.href;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = item.label;
                links.append(link);
            });
            nav.append(links);
        }
    }

    const categoryNames = {
        role: '角色',
        scene: '场景',
        effect: '特效',
        ui: 'UI',
        post: '后期',
        pcg: 'PCG'
    };

    // 页面可通过 window.PORTFOLIO_WORK_DETAILS（以作品标题为 key）提供项目信息：
    // 项目类型 / 项目时间 / 使用引擎 / 技术方案 / 作品说明。数据可能由页面异步加载，
    // 因此每次打开面板时再读取；未提供时沿用原有的模型参数展示，其他作品集页面不受影响。
    function getWorkDetail(name) {
        return (window.PORTFOLIO_WORK_DETAILS || {})[name];
    }

    // 页面内编辑的结果按页面维度保存在 localStorage，键可由页面指定
    function getStorageKey() {
        return window.PORTFOLIO_WORK_DETAILS_STORAGE_KEY || 'portfolioWorkDetails:' + window.location.pathname;
    }

    function readOverrides() {
        try {
            const raw = localStorage.getItem(getStorageKey());
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            return {};
        }
    }

    function saveOverride(name, values) {
        const overrides = readOverrides();
        overrides[name] = values;
        try {
            localStorage.setItem(getStorageKey(), JSON.stringify(overrides));
        } catch (error) {
            console.warn('[WorkDetails] 本地保存失败:', error);
        }
    }

    // 浏览器文件选择器写入：首次选择项目里的 JSON 文件，之后记住句柄即可直接覆盖
    const FILE_HANDLE_DB = 'portfolioWorkDetails';
    const FILE_HANDLE_STORE = 'fileHandles';

    function openHandleDb() {
        return new Promise(function(resolve) {
            if (!('indexedDB' in window)) {
                resolve(null);
                return;
            }
            const request = indexedDB.open(FILE_HANDLE_DB, 1);
            request.onupgradeneeded = function() {
                request.result.createObjectStore(FILE_HANDLE_STORE);
            };
            request.onsuccess = function() {
                resolve(request.result);
            };
            request.onerror = function() {
                resolve(null);
            };
        });
    }

    function readStoredHandle(key) {
        return openHandleDb().then(function(db) {
            if (!db) return null;
            return new Promise(function(resolve) {
                const request = db.transaction(FILE_HANDLE_STORE, 'readonly').objectStore(FILE_HANDLE_STORE).get(key);
                request.onsuccess = function() {
                    db.close();
                    resolve(request.result || null);
                };
                request.onerror = function() {
                    db.close();
                    resolve(null);
                };
            });
        });
    }

    function storeFileHandle(key, handle) {
        return openHandleDb().then(function(db) {
            if (!db) return handle;
            return new Promise(function(resolve) {
                const transaction = db.transaction(FILE_HANDLE_STORE, 'readwrite');
                transaction.objectStore(FILE_HANDLE_STORE).put(handle, key);
                transaction.oncomplete = function() {
                    db.close();
                    resolve(handle);
                };
                transaction.onerror = function() {
                    db.close();
                    resolve(handle);
                };
            });
        });
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'detail-backdrop';
    backdrop.dataset.closeDetail = '';
    backdrop.setAttribute('aria-hidden', 'true');

    const panel = document.createElement('aside');
    panel.className = 'detail-panel';
    panel.id = 'detailPanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'detailName');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = '<div class="detail-heading"><h2>作品信息</h2><div class="detail-heading-actions"><button class="detail-edit-btn" type="button" hidden>编辑</button><button class="detail-close" type="button" aria-label="关闭作品信息" data-close-detail>×</button></div></div><img class="detail-preview" src="" alt=""><h3 class="detail-name" id="detailName"></h3><span class="detail-type"></span><div class="detail-specs" aria-label="作品信息"></div><p class="detail-description"></p><form class="detail-edit" hidden><label>项目类型<input type="text" name="projectType"></label><label>项目时间<input type="text" name="projectTime"></label><label>使用引擎<input type="text" name="engine"></label><label>技术方案<textarea name="tech" rows="3"></textarea></label><label>作品说明<textarea name="description" rows="4"></textarea></label><div class="detail-edit-actions"><button type="submit">保存</button><button type="button" data-cancel-edit>取消</button><button type="button" data-save-file>保存到文件</button><button type="button" data-export-details>导出 JSON</button></div><p class="detail-edit-status" aria-live="polite"></p><p class="detail-edit-hint">「保存到文件」会在系统文件选择器中打开，首次选中项目里的 JSON 文件后记住该路径，之后可直接覆盖；「导出 JSON」为普通下载。</p></form><hr class="detail-divider"><p class="detail-note">当前展示页未提供更多网格参数；模型面数以原始工程数据为准。</p>';
    document.body.append(backdrop, panel);

    // 作品信息行：有项目信息时展示项目类型/时间/引擎/技术方案，否则回退到模型名称与面数
    function fillSpecs(detail, name) {
        const rows = detail
            ? [
                ['项目类型', detail.projectType],
                ['项目时间', detail.projectTime],
                ['使用引擎', detail.engine],
                ['技术方案', detail.tech]
            ]
            : [
                ['模型名称', name],
                ['模型面数', '未提供']
            ];
        specsNode.replaceChildren();
        rows.forEach(function (row) {
            if (!row[1]) return;
            const rowNode = document.createElement('div');
            rowNode.className = 'detail-spec-row';
            const label = document.createElement('span');
            label.textContent = row[0];
            const value = document.createElement('span');
            value.textContent = row[1];
            rowNode.append(label, value);
            specsNode.appendChild(rowNode);
        });
    }

    function closeDetails() {
        document.body.classList.remove('detail-open');
        panel.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.card').forEach(function(card) {
        const title = card.querySelector('.card-title');
        const heading = card.querySelector('.category-title');
        const name = title ? title.textContent.trim() : (card.querySelector('img') || card.querySelector('video'))?.alt || '未命名作品';
        const section = card.closest('.category-section');
        const type = (section && (categoryNames[section.dataset.category] || (heading && heading.textContent.trim()))) ||
            (window.location.pathname.endsWith('ThreeRenderingTwo.html') ? '场景' : '场景');
        card.dataset.detailTitle = name;
        card.dataset.detailType = type;

        const actions = document.createElement('div');
        actions.className = 'card-actions';
        const tag = document.createElement('span');
        tag.className = 'card-type';
        tag.textContent = type;
        const view = document.createElement('button');
        view.className = 'card-view';
        view.type = 'button';
        view.textContent = '查看';
        view.addEventListener('click', async function(event) {
            event.stopPropagation();
            // 作品信息可能由页面异步加载（JSON），先等数据就绪再展示
            if (window.PORTFOLIO_WORK_DETAILS_PROMISE) {
                try {
                    await window.PORTFOLIO_WORK_DETAILS_PROMISE;
                } catch (error) {
                    console.warn('[WorkDetails] 作品信息加载失败:', error);
                }
            }
            const image = card.querySelector('.image-container img');
            const video = card.querySelector('.image-container video');
            const preview = panel.querySelector('.detail-preview');
            preview.src = image ? image.src : '';
            preview.alt = image ? image.alt : name;
            preview.hidden = !image;
            nameNode.textContent = name;
            typeNode.textContent = type;
            const detail = getWorkDetail(name);
            activeWork = detail ? { name: name, detail: detail } : null;
            fillSpecs(detail, name);
            descriptionNode.textContent = (detail && detail.description) || card.dataset.description || (video ? '场景视频展示作品，点击卡片画面可播放。' : '游戏美术作品展示，提供作品名称与所属分类信息。');
            // 已提供项目信息的作品不再展示网格参数说明，并提供页面内编辑
            dividerNode.hidden = Boolean(detail);
            noteNode.hidden = Boolean(detail);
            setEditing(false);
            editBtn.hidden = !detail;
            document.body.classList.add('detail-open');
            panel.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            panel.querySelector('.detail-close').focus();
        });
        actions.append(tag, view);
        card.append(actions);
    });

    const nameNode = panel.querySelector('.detail-name');
    const typeNode = panel.querySelector('.detail-type');
    const specsNode = panel.querySelector('.detail-specs');
    const descriptionNode = panel.querySelector('.detail-description');
    const dividerNode = panel.querySelector('.detail-divider');
    const noteNode = panel.querySelector('.detail-note');
    const editBtn = panel.querySelector('.detail-edit-btn');
    const editForm = panel.querySelector('.detail-edit');
    const statusNode = panel.querySelector('.detail-edit-status');

    // 当前打开的作品信息，供编辑与导出使用
    let activeWork = null;
    const editFields = ['projectType', 'projectTime', 'engine', 'tech', 'description'];

    function fillEditForm(detail) {
        editFields.forEach(function (field) {
            editForm.elements[field].value = (detail && detail[field]) || '';
        });
    }

    function setEditing(editing) {
        editForm.hidden = !editing;
        specsNode.hidden = editing;
        descriptionNode.hidden = editing;
        editBtn.hidden = editing || !activeWork;
        if (editing && activeWork) {
            fillEditForm(activeWork.detail);
            setStatus('');
        }
    }

    function setStatus(message, isError) {
        statusNode.textContent = message;
        statusNode.classList.toggle('is-error', Boolean(isError));
    }

    editBtn.addEventListener('click', function() {
        if (!activeWork) return;
        setEditing(true);
        editForm.elements.projectType.focus();
    });

    editForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!activeWork) return;
        const values = {};
        editFields.forEach(function(field) {
            values[field] = editForm.elements[field].value.trim();
        });
        Object.assign(activeWork.detail, values);
        saveOverride(activeWork.name, values);
        fillSpecs(activeWork.detail, activeWork.name);
        descriptionNode.textContent = activeWork.detail.description || '';
        setEditing(false);
    });

    // 汇总当前合并后的作品信息（按页面卡片顺序），生成数据文件内容
    function buildExportJson() {
        const details = window.PORTFOLIO_WORK_DETAILS || {};
        const works = Array.prototype.map.call(document.querySelectorAll('.card'), function(card) {
            const title = card.querySelector('.card-title');
            return title ? title.textContent.trim() : '';
        }).filter(function(title) {
            return title && details[title];
        }).map(function(title) {
            const detail = details[title];
            return {
                title: title,
                projectType: detail.projectType || '',
                projectTime: detail.projectTime || '',
                engine: detail.engine || '',
                tech: detail.tech || '',
                description: detail.description || ''
            };
        });
        return JSON.stringify({ works: works }, null, 2) + '\n';
    }

    // 普通下载，作为不支持文件选择器时的兜底
    function exportDetails() {
        const blob = new Blob([buildExportJson()], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = window.PORTFOLIO_WORK_DETAILS_EXPORT_NAME || 'work-details.json';
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // 通过系统文件选择器直接覆盖项目里的 JSON：首次选择文件，之后记住句柄一键覆盖
    async function saveDetailsToFile() {
        const json = buildExportJson();
        if (!window.showSaveFilePicker) {
            setStatus('当前浏览器不支持直接写文件，已改为下载。', true);
            exportDetails();
            return;
        }
        try {
            let handle = await readStoredHandle(getStorageKey());
            if (handle) {
                const permission = await handle.queryPermission({ mode: 'readwrite' });
                if (permission !== 'granted') {
                    const granted = await handle.requestPermission({ mode: 'readwrite' });
                    if (granted !== 'granted') handle = null;
                }
            }
            if (!handle) {
                handle = await window.showSaveFilePicker({
                    suggestedName: window.PORTFOLIO_WORK_DETAILS_EXPORT_NAME || 'work-details.json',
                    types: [{ description: 'JSON 文件', accept: { 'application/json': ['.json'] } }]
                });
            }
            const writable = await handle.createWritable();
            await writable.write(json);
            await writable.close();
            await storeFileHandle(getStorageKey(), handle);
            setStatus('已写入 ' + handle.name);
        } catch (error) {
            if (error && error.name === 'AbortError') return;
            console.warn('[WorkDetails] 写入文件失败:', error);
            setStatus('写入失败：' + (error && error.message ? error.message : '未知错误'), true);
        }
    }

    document.addEventListener('click', function(event) {
        if (event.target.closest('[data-close-detail]')) {
            closeDetails();
        }
        if (event.target.closest('[data-cancel-edit]')) {
            setEditing(false);
        }
        if (event.target.closest('[data-export-details]')) {
            exportDetails();
        }
        if (event.target.closest('[data-save-file]')) {
            saveDetailsToFile();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && document.body.classList.contains('detail-open')) {
            closeDetails();
        }
    });
})();
