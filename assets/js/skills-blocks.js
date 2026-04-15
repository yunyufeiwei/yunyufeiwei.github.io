/**
 * 技能方格进度条
 * 正方形方格，数量根据容器宽度自动计算，彩虹色渐变
 */
(function () {
    var GAP = 4;
    var BLOCK_SIZE = 14; // 每个正方形的边长(px)

    // HSL 彩虹色：hue 从 0(红) 到 270(紫)
    function rainbowColor(ratio) {
        var hue = Math.round(ratio * 270);
        return 'hsl(' + hue + ', 90%, 55%)';
    }

    function buildBlocks() {
        document.querySelectorAll('.skills__data').forEach(function (data) {
            var numberEl = data.querySelector('.skills__number');
            var barEl = data.querySelector('.skills__bar');
            if (!numberEl || !barEl) return;

            var percent = parseInt(numberEl.textContent) || 0;
            var barWidth = barEl.clientWidth;
            var count = Math.max(1, Math.floor((barWidth + GAP) / (BLOCK_SIZE + GAP)));
            var activeCount = Math.round(percent / 100 * count);

            barEl.innerHTML = '';
            for (var i = 0; i < count; i++) {
                var block = document.createElement('div');
                block.className = 'skills__block';
                if (i < activeCount) {
                    block.classList.add('active');
                    block.style.backgroundColor = rainbowColor(i / (count - 1));
                }
                barEl.appendChild(block);
            }
        });
    }

    // 初始化 + 窗口缩放时重新计算
    document.addEventListener('DOMContentLoaded', buildBlocks);
    window.addEventListener('resize', buildBlocks);
})();
