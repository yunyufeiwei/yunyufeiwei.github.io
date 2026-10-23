(function() {
    const nav = document.querySelector('.top-nav');
    const pageTitle = {
        'ThreeRenderingTwo.html': '三渲二场景作品展示库',
        'SceneArtist.html': '场景美术作品展示库',
        'TechnicalArtist.html': '技术美术作品展示库'
    }[window.location.pathname.split('/').pop()] || '游戏作品展示库';

    if (nav) {
        nav.innerHTML = '<div class="nav-brand"><span class="nav-mark" aria-hidden="true"></span><div class="nav-brand-copy"><strong>我的作品</strong><span class="nav-divider" aria-hidden="true"></span><span>' + pageTitle + '</span></div></div>';
    }

    const categoryNames = {
        role: '角色',
        scene: '场景',
        effect: '特效',
        ui: 'UI',
        post: '后期',
        pcg: 'PCG'
    };

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
    panel.innerHTML = '<div class="detail-heading"><h2>作品信息</h2><button class="detail-close" type="button" aria-label="关闭作品信息" data-close-detail>×</button></div><img class="detail-preview" src="" alt=""><h3 class="detail-name" id="detailName"></h3><span class="detail-type"></span><div class="detail-specs" aria-label="模型参数"><div class="detail-spec-row"><span>模型名称</span><span class="detail-model-name"></span></div><div class="detail-spec-row"><span>模型面数</span><span class="detail-face-count">未提供</span></div></div><p class="detail-description"></p><hr class="detail-divider"><p class="detail-note">当前展示页未提供更多网格参数；模型面数以原始工程数据为准。</p>';
    document.body.append(backdrop, panel);

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
        view.addEventListener('click', function(event) {
            event.stopPropagation();
            const image = card.querySelector('.image-container img');
            const video = card.querySelector('.image-container video');
            const preview = panel.querySelector('.detail-preview');
            preview.src = image ? image.src : '';
            preview.alt = image ? image.alt : name;
            preview.hidden = !image;
            nameNode.textContent = name;
            typeNode.textContent = type;
            modelNameNode.textContent = name;
            descriptionNode.textContent = card.dataset.description || (video ? '场景视频展示作品，点击卡片画面可播放。' : '游戏美术作品展示，提供作品名称与所属分类信息。');
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
    const modelNameNode = panel.querySelector('.detail-model-name');
    const descriptionNode = panel.querySelector('.detail-description');

    document.addEventListener('click', function(event) {
        if (event.target.closest('[data-close-detail]')) {
            closeDetails();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && document.body.classList.contains('detail-open')) {
            closeDetails();
        }
    });
})();
