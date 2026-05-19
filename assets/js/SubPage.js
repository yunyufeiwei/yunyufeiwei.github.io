// 获取DOM元素
const mainContainer = document.getElementById("mainContainer");
const enlargedContainer = document.getElementById("enlargedContainer");
const enlargedImage = document.getElementById("enlargedImage");
const galleryImages = document.querySelectorAll('.gallery-image');
const categoryBtns = document.querySelectorAll('.category-btn');
const subBtns = document.querySelectorAll('.sub-btn');
const subNavs = document.querySelectorAll('.sub-nav');

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

// 分类导航交互逻辑
// 切换分类按钮的展开/收起
categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // 检查是否是窄窗口模式
        const isNarrowWindow = window.innerWidth <= 1200;
        
        if (isNarrowWindow) {
            // 窄窗口模式：点击大分类展开子分类
            const subNav = this.nextElementSibling;
            if (subNav && subNav.classList.contains('sub-nav')) {
                const isActive = subNav.classList.contains('active');
                
                // 关闭所有其他分类的子菜单
                categoryBtns.forEach(otherBtn => {
                    if (otherBtn !== this) {
                        const otherSubNav = otherBtn.nextElementSibling;
                        if (otherSubNav && otherSubNav.classList.contains('sub-nav')) {
                            otherSubNav.classList.remove('active');
                            otherBtn.classList.remove('active');
                        }
                    }
                });
                
                // 切换当前分类的子菜单
                if (!isActive) {
                    subNav.classList.add('active');
                    this.classList.add('active');
                } else {
                    subNav.classList.remove('active');
                    this.classList.remove('active');
                }
            }
        } else {
            // 宽窗口模式：保持原有逻辑
            // 关闭所有其他分类的子菜单
            categoryBtns.forEach(otherBtn => {
                if (otherBtn !== this) {
                    const otherSubNav = otherBtn.nextElementSibling;
                    if (otherSubNav && otherSubNav.classList.contains('sub-nav')) {
                        otherSubNav.classList.remove('active');
                        otherBtn.classList.remove('active');
                    }
                }
            });
            
            // 切换当前分类的子菜单
            const subNav = this.nextElementSibling;
            if (subNav && subNav.classList.contains('sub-nav')) {
                const isActive = subNav.classList.contains('active');
                
                // 如果当前子菜单未激活，则切换到激活状态
                if (!isActive) {
                    subNav.classList.add('active');
                    this.classList.add('active');
                } else {
                    // 如果当前子菜单已激活，则关闭它
                    subNav.classList.remove('active');
                    this.classList.remove('active');
                }
            }
        }
    });
});

// 子分类按钮点击滚动到对应位置
subBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        // 阻止事件冒泡，防止触发父元素的点击事件
        e.stopPropagation();
        
        const targetId = this.getAttribute('data-target');
        scrollToSection(targetId);
        
        // 在窄窗口模式下，点击子分类后收起父级菜单
        const isNarrowWindow = window.innerWidth <= 1200;
        if (isNarrowWindow) {
            const parentSubNav = this.closest('.sub-nav');
            const parentCategoryBtn = parentSubNav ? parentSubNav.previousElementSibling : null;
            
            if (parentSubNav && parentCategoryBtn) {
                parentSubNav.classList.remove('active');
                parentCategoryBtn.classList.remove('active');
            }
        }
    });
});

// 三级分类按钮展开/收起
const subSubBtns = document.querySelectorAll('.sub-sub-btn');
const subSubNavs = document.querySelectorAll('.sub-sub-nav');

subSubBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        // 阻止事件冒泡，防止触发父元素的点击事件
        e.stopPropagation();
        
        const isNarrowWindow = window.innerWidth <= 1200;
        const subSubNav = this.nextElementSibling;
        
        if (subSubNav && subSubNav.classList.contains('sub-sub-nav')) {
            const isActive = subSubNav.classList.contains('active');
            
            // 切换当前三级分类
            if (!isActive) {
                subSubNav.classList.add('active');
            } else {
                subSubNav.classList.remove('active');
            }
            
            // 在窄窗口模式下，点击三级分类后滚动到对应位置
            if (isNarrowWindow) {
                const targetId = this.getAttribute('data-target');
                scrollToSection(targetId);
                
                // 收起所有菜单
                const parentSubNav = this.closest('.sub-nav');
                const parentCategoryBtn = parentSubNav ? parentSubNav.previousElementSibling : null;
                
                if (parentSubNav && parentCategoryBtn) {
                    parentSubNav.classList.remove('active');
                    parentCategoryBtn.classList.remove('active');
                }
            }
        }
    });
});

// 点击页面其他区域时收起所有菜单（窄窗口模式）
document.addEventListener('click', function(e) {
    const isNarrowWindow = window.innerWidth <= 1200;
    
    if (isNarrowWindow) {
        // 检查点击的是否是导航相关元素
        const isNavElement = e.target.closest('.nav-category') || 
                            e.target.closest('.sub-nav') || 
                            e.target.closest('.sub-sub-nav');
        
        if (!isNavElement) {
            // 收起所有展开的菜单
            categoryBtns.forEach(btn => {
                btn.classList.remove('active');
            });
            
            subNavs.forEach(nav => {
                nav.classList.remove('active');
            });
            
            subSubNavs.forEach(nav => {
                nav.classList.remove('active');
            });
        }
    }
});

// 窗口大小改变时重置菜单状态
window.addEventListener('resize', function() {
    const isNarrowWindow = window.innerWidth <= 1200;
    
    if (!isNarrowWindow) {
        // 从窄窗口切换到宽窗口时，收起所有菜单
        categoryBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        subNavs.forEach(nav => {
            nav.classList.remove('active');
        });
        
        subSubNavs.forEach(nav => {
            nav.classList.remove('active');
        });
    }
});

// 滚动到指定分类区域的函数
function scrollToSection(targetId) {
    // 查找包含目标ID的gallery-item或gallery-category-section
    const galleryItems = document.querySelectorAll('.gallery-item');
    const gallerySections = document.querySelectorAll('.gallery-category-section');
    let targetElement = null;
    
    // 先查找gallery-category-section
    gallerySections.forEach(section => {
        const id = section.getAttribute('id');
        if (id && id.includes(targetId)) {
            targetElement = section;
        }
    });
    
    // 如果没有找到，再查找gallery-item
    if (!targetElement) {
        galleryItems.forEach(item => {
            const id = item.getAttribute('id');
            if (id && id.includes(targetId)) {
                targetElement = item;
            }
        });
    }
    
    if (targetElement) {
        targetElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}