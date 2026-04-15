$(document).ready(function () {
    /*默认语言*/
    const lang = localStorage.getItem("lang");
    /* [BUG修正] 原代码: lang ? " lang ": cn
       1. 三目运算符真值分支 " lang " 是一个带空格的字符串字面量，应该是变量 lang
       2. 假值分支 cn 是一个未定义的变量，应该是字符串 "cn"
       修改三目运算符的真假顺序来调整语言默认是中文还是英文 */
    const defaultLang = lang ? lang : "cn";
    $("[i18n]").i18n({
        defaultLang: defaultLang,
        filePath: "assets/i18n/", //路径配置
        filePrefix: "i18n_",
        fileSuffix: "",
        forever: true,
        callback: function () {
            console.log("i18n is ready.");
        },
    });
    /*中英文切换按钮 — 仅图标切换，不显示文字*/
    $("#translate").click(function () {
        const currentLang = localStorage.getItem("lang") || defaultLang;
        const targetLang = currentLang == "cn" ? "en" : "cn";

        $("[i18n]").i18n({
            defaultLang: targetLang,
            filePath: "assets/i18n/",
            callback: function () {
                localStorage.setItem("lang", targetLang);
                console.log(localStorage.getItem("lang"));
            }
        });
    });
});
