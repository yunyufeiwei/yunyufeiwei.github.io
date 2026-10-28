(function () {
    if (!document.querySelector('.texture-tile')) return;

    var dialog = document.createElement('div');
    dialog.className = 'lightbox';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', '图片放大预览');
    dialog.setAttribute('aria-hidden', 'true');
    dialog.innerHTML =
        '<div class="lightbox-bar">' +
        '<span class="lightbox-name"></span>' +
        '<span class="lightbox-zoom"></span>' +
        '<span class="lightbox-hint">滚轮缩放 · 点击切换 100%</span>' +
        '<a class="lightbox-download" download>下载原图 ↓</a>' +
        '<button class="lightbox-close" type="button" aria-label="关闭预览">×</button>' +
        '</div>' +
        '<div class="lightbox-stage"><img alt=""></div>';
    document.body.appendChild(dialog);

    var stage = dialog.querySelector('.lightbox-stage');
    var preview = stage.querySelector('img');
    var nameEl = dialog.querySelector('.lightbox-name');
    var zoomEl = dialog.querySelector('.lightbox-zoom');
    var downloadEl = dialog.querySelector('.lightbox-download');
    var closeBtn = dialog.querySelector('.lightbox-close');

    var naturalWidth = 0;
    var fitZoom = 1;
    var zoom = 1;

    function stageInset() {
        var style = getComputedStyle(stage);
        return parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    }

    function stageInsetY() {
        var style = getComputedStyle(stage);
        return parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    }

    function setZoom(next) {
        if (!naturalWidth) return;
        zoom = Math.min(Math.max(next, fitZoom * 0.5), 3);
        preview.style.width = Math.round(naturalWidth * zoom) + 'px';
        zoomEl.textContent = Math.round(zoom * 100) + '%';
    }

    function centerAnchor() {
        return {
            x: (stage.scrollLeft + stage.clientWidth / 2) / Math.max(stage.scrollWidth, 1),
            y: (stage.scrollTop + stage.clientHeight / 2) / Math.max(stage.scrollHeight, 1),
        };
    }

    function restoreAnchor(anchor) {
        stage.scrollLeft = anchor.x * stage.scrollWidth - stage.clientWidth / 2;
        stage.scrollTop = anchor.y * stage.scrollHeight - stage.clientHeight / 2;
    }

    function open(tile) {
        var img = tile.querySelector('.texture-figure img');
        var link = tile.querySelector('.texture-download');
        if (!img || !link) return;

        naturalWidth = 0;
        preview.style.width = '';
        preview.style.maxWidth = '';
        preview.style.maxHeight = '';
        preview.style.opacity = '0';
        preview.src = img.getAttribute('data-full') || img.getAttribute('src');
        preview.alt = img.alt || '';

        var fileName = link.getAttribute('download') || '';
        nameEl.textContent = fileName;
        downloadEl.setAttribute('href', link.getAttribute('href'));
        downloadEl.setAttribute('download', fileName);

        dialog.classList.add('is-open');
        dialog.setAttribute('aria-hidden', 'false');
        document.body.classList.add('is-locked');
        stage.scrollTop = 0;
        stage.scrollLeft = 0;
        closeBtn.focus();
    }

    preview.addEventListener('load', function () {
        if (!dialog.classList.contains('is-open')) return;
        naturalWidth = preview.naturalWidth;
        if (!naturalWidth) return;
        fitZoom = Math.min(
            1,
            (stage.clientWidth - stageInset()) / naturalWidth,
            (stage.clientHeight - stageInsetY()) / preview.naturalHeight
        );
        preview.style.maxWidth = 'none';
        preview.style.maxHeight = 'none';
        preview.style.opacity = '1';
        setZoom(fitZoom);
    });

    function close() {
        dialog.classList.remove('is-open');
        dialog.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('is-locked');
        preview.removeAttribute('src');
        naturalWidth = 0;
    }

    stage.addEventListener('wheel', function (event) {
        if (!dialog.classList.contains('is-open') || !naturalWidth) return;
        event.preventDefault();
        var anchor = centerAnchor();
        setZoom(zoom * (event.deltaY < 0 ? 1.15 : 1 / 1.15));
        restoreAnchor(anchor);
    }, { passive: false });

    var dragging = false;
    var dragMoved = false;
    var dragStart = { x: 0, y: 0, scrollLeft: 0, scrollTop: 0 };

    preview.draggable = false;
    preview.addEventListener('mousedown', function (event) {
        if (event.button !== 0) return;
        dragging = true;
        dragMoved = false;
        dragStart = {
            x: event.clientX,
            y: event.clientY,
            scrollLeft: stage.scrollLeft,
            scrollTop: stage.scrollTop,
        };
        dialog.classList.add('is-dragging');
        event.preventDefault();
    });
    document.addEventListener('mousemove', function (event) {
        if (!dragging) return;
        var dx = event.clientX - dragStart.x;
        var dy = event.clientY - dragStart.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;
        stage.scrollLeft = dragStart.scrollLeft - dx;
        stage.scrollTop = dragStart.scrollTop - dy;
    });
    document.addEventListener('mouseup', function () {
        if (!dragging) return;
        dragging = false;
        dialog.classList.remove('is-dragging');
    });

    document.addEventListener('click', function (event) {
        var figure = event.target.closest('.texture-figure');
        if (figure && !dialog.classList.contains('is-open')) {
            var tile = figure.closest('.texture-tile');
            if (tile) open(tile);
            return;
        }
        if (event.target === preview) {
            if (dragMoved) {
                dragMoved = false;
                return;
            }
            setZoom(zoom === 1 ? fitZoom : 1);
            return;
        }
        if (!dialog.classList.contains('is-open')) return;
        if (event.target === stage || event.target === dialog) close();
    });

    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && dialog.classList.contains('is-open')) close();
    });
})();
