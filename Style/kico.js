var kico = {};

// 弹框
kico.notice_list = document.createElement("div");
kico.notice_list.classList.add("bk-notice-list");

function bk_notice(content, attr) {
    var notice_item = document.createElement("div");
    notice_item.className = "bk-notice";
    notice_item.innerHTML += "<span class='content'>" + content + "</span>";

    kico.notice_list.appendChild(notice_item);

    if(!document.querySelector("body > .bk-notice-list")){document.body.appendChild(kico.notice_list);}

    if(attr && attr.time){
        setTimeout(notice_remove, attr.time);
    }
    else{
        var close = document.createElement("span");
        close.className = "close";

        close.addEventListener("click", function () {
            notice_remove();
        });

        notice_item.classList.add("dismiss");
        notice_item.appendChild(close);
    }

    if(attr && attr.color){notice_item.classList.add(attr.color);}
    if(attr && attr.time && attr.overlay === true){bk_overlay({time: attr.time});}

    function notice_remove() {
        notice_item.classList.add("remove");

        setTimeout(function () {
            try{
                kico.notice_list.removeChild(notice_item);
                document.querySelector("body > .bk-notice-list").removeChild(notice_item);
            }
            catch(err) {}

            if(document.querySelector("body > .bk-notice-list") && kico.notice_list.childNodes.length === 0){
                document.body.removeChild(kico.notice_list);
            }
        }, 300);
    }
}

// 遮罩
kico.overlay = document.createElement("div");
kico.overlay.classList.add("bk-overlay");

function bk_overlay(attr){
    document.body.appendChild(kico.overlay);

    if(attr && attr.time){
        setTimeout(overlay_remove, attr.time);
    }
    else{
        kico.overlay.addEventListener("click", function () {
            overlay_remove();
        });
    }

    if(attr && attr.code){
        kico.overlay.addEventListener("click", function () {
            attr.code();
        });
    }

    function overlay_remove() {
        kico.overlay.classList.add("remove");

        setTimeout(function () {
            if(document.querySelector("body > .bk-overlay")){
                kico.overlay.classList.remove("remove");
                document.body.removeChild(kico.overlay);
            }
        }, 300);
    }
}

// // 图片放大
// kico.image_box = document.createElement("div");
// kico.image_box.className = "bk-image";
// kico.image_single = document.createElement("img");
// kico.image_box.appendChild(kico.image_single);

// function bk_image(selector) {
//     var get_images = document.querySelectorAll(selector);

//     function item(obj) {
//         obj.setAttribute("bk-image", "active");
//         obj.addEventListener("click", function () {
//             kico.image_single.src = obj.src;
//             if(!document.querySelector("body > .bk-image")){
//                 document.body.appendChild(kico.image_box);
//             }
//         });
//     }

//     for(var i = 0; i < get_images.length; i++){
//         //item(get_images[i]);
//     }

//     kico.image_box.addEventListener("click", function () {
//         kico.image_box.classList.add("remove");
//         setTimeout(function () {
//             try{
//                 document.body.removeChild(kico.image_box);
//                 kico.image_box.classList.remove("remove");
//             }
//             catch (err){}
//         }, 300);
//     });
// }



/* 弹出图片查看窗口事件逻辑 */
// Global gallery state
    const galleryState = {
        currentIndex: 0,
        images: [],
        window: null,
        content: null
    };

    // Open gallery in a new window
    function openGalleryWindow(galleryId) {
        // Create the gallery window elements
        const galleryWindow = document.createElement('div');
        galleryWindow.className = 'gallery-window';
        
        const galleryContent = document.createElement('div');
        galleryContent.className = 'gallery-content';
        
        const prevButton = document.createElement('button');
        prevButton.className = 'gallery-nav gallery-prev';
        prevButton.innerHTML = '&lt;';
        prevButton.onclick = (e) => {
            e.stopPropagation();
            navigateGallery(-1);
        };
        
        const nextButton = document.createElement('button');
        nextButton.className = 'gallery-nav gallery-next';
        nextButton.innerHTML = '&gt;';
        nextButton.onclick = (e) => {
            e.stopPropagation();
            navigateGallery(1);
        };
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'gallery-image-container';
        
        const image = document.createElement('img');
        image.className = 'gallery-image';
        image.onclick = () => {
            closeGalleryWindow();
        };
        
        const counter = document.createElement('div');
        counter.className = 'gallery-counter';
        
        // Build the DOM structure
        imageContainer.appendChild(image);
        imageContainer.appendChild(counter);
        galleryContent.appendChild(prevButton);
        galleryContent.appendChild(imageContainer);
        galleryContent.appendChild(nextButton);
        galleryWindow.appendChild(galleryContent);
        
        // Add to document
        document.body.appendChild(galleryWindow);
        
        // Get the images from the gallery
        const gallery = document.getElementById(galleryId);
        galleryState.images = Array.from(gallery.querySelectorAll('img'));
        galleryState.currentIndex = 0;
        galleryState.window = galleryWindow;
        galleryState.content = galleryContent;
        
        // Update the display
        updateGalleryDisplay();
        
        // Add keyboard navigation
        document.addEventListener('keydown', handleGalleryKeydown);
    }

    // Close the gallery window
    function closeGalleryWindow() {
        if (galleryState.window) {
            document.body.removeChild(galleryState.window);
            document.removeEventListener('keydown', handleGalleryKeydown);
            galleryState.window = null;
        }
    }

    // Navigate through gallery images
    function navigateGallery(direction) {
        galleryState.currentIndex = (galleryState.currentIndex + direction + galleryState.images.length) % galleryState.images.length;
        updateGalleryDisplay();
    }

    // Update the gallery display
    function updateGalleryDisplay() {
        if (!galleryState.window) return;
        
        const image = galleryState.content.querySelector('.gallery-image');
        const counter = galleryState.content.querySelector('.gallery-counter');
        
        image.src = galleryState.images[galleryState.currentIndex].src;
        counter.textContent = `${galleryState.currentIndex + 1}/${galleryState.images.length}`;
    }

    // Handle keyboard navigation
    function handleGalleryKeydown(e) {
        if (e.key === 'Escape') {
            closeGalleryWindow();
        } else if (e.key === 'ArrowLeft') {
            navigateGallery(-1);
        } else if (e.key === 'ArrowRight') {
            navigateGallery(1);
        }
    }