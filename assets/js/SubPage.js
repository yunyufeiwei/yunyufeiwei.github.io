// 获取DOM元素
const mainContainer = document.getElementById("mainContainer");
const enlargedContainer = document.getElementById("enlargedContainer");
const enlargedImage = document.getElementById("enlargedImage");
const galleryImages = document.querySelectorAll('.gallery-image');

// 为所有图片添加点击事件
galleryImages.forEach(image => {
    image.addEventListener('click', function(e) {
        // 阻止事件冒泡，防止触发父元素的点击事件
        e.stopPropagation();

        // 设置放大图片的src和alt
        enlargedImage.src = this.src;
        enlargedImage.alt = this.alt;

        // 显示放大图片容器
        enlargedContainer.classList.add('active');

        // 给页面内容添加模糊效果并禁用滚动
        mainContainer.classList.add('blurred');
        document.body.style.overflow = 'hidden';
    });
});

// 点击放大图片时还原
enlargedContainer.addEventListener('click', function(e) {
    // 只有当点击的是容器本身或图片时才关闭
    if (e.target === enlargedContainer || e.target === enlargedImage) {
        closeEnlargedImage();
    }
});

// ESC键也可以关闭放大图片
document.addEventListener('keydown', function(e) {
    if (e.key === "Escape" && enlargedContainer.classList.contains('active')) {
        closeEnlargedImage();
    }
});

// 关闭放大图片的函数
function closeEnlargedImage() {
    // 隐藏放大图片容器
    enlargedContainer.classList.remove('active');

    // 移除页面内容的模糊效果并恢复滚动
    mainContainer.classList.remove('blurred');
    document.body.style.overflow = '';
}