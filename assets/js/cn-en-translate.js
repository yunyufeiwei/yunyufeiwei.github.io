$(document).ready(function () {
    /*固定使用中文*/
    const defaultLang = "cn";
    
    $("[i18n]").i18n({
        defaultLang: defaultLang,
        filePath: "assets/i18n/", //路径配置
        filePrefix: "i18n_",
        fileSuffix: "",
        forever: true,
        callback: function () {
            console.log("i18n is ready. Language: Chinese");
        },
    });
    
    // 移除了中英文切换功能，只保留中文显示
});
