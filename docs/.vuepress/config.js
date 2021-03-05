// module.exports = {
//   configureWebpack: {
//     resolve: {
//       alias: {
//         '@alias': '.vuepress/img'
//       }
//     }
//   }
// }

module.exports = {
    title: '超星慕课小工具',
    base: '/',
    themeConfig: {
        nav: [
            {text: '首页', link: '/'},
            {
                text: '使用教程',
                items: [
                    {text: '简介', link: '/1-UserGuide/'},
                    {text: '打包版浏览器(小白看我)', link: '/1-UserGuide/1-7-easychorme.md'},
                    {text: 'FireFox 扩展', link: '/1-UserGuide/1-2-firefox.html'},
                    {text: 'Chrome 扩展', link: '/1-UserGuide/1-1-chrome.html'},
                    {text: 'Tampermonkey 脚本', link: '/1-UserGuide/1-3-tampermonkey.html'},
                    // {text: '中国大学mooc专用', link: '/1-UserGuide/1-8-moocchorme.html'},
                    {text: '常见问题【使用必看】', link: '/1-UserGuide/qa.md'},
                    {text: '功能说明', link: '/1-UserGuide/featured.html'},
                    {text: '配置说明', link: '/1-UserGuide/1-4-config.html'},
                ]
            },
            {text: '开发文档', link: '/Develop/'},
            {text: '免责声明', link: '/3-Disclaimer/'},
            {
                text: '语言选项',
                items: [
                    {text: '简体中文', link: '/'},
                    {text: 'English', link: '/en-us/'}
                ]
            },
            //{ text: 'Github', link: 'https://github.com/CodFrm/cxmooc-tools' },
        ],
        // sidebar: 'auto',
        sidebar: {
            '/1-UserGuide/': [
                '',
                'qa.html',
                '1-6-gettoken.html',
                '1-7-easychorme.html',
                // '1-8-moocchorme.html',
                '1-2-firefox.html',  /* /foo/one.html */
                '1-1-chrome.html',
                '1-3-tampermonkey.html',     /* /foo/ */
                '1-5-otherchorme.html',
                'featured.html',//功能说明
                '1-4-config.html',//配置说明
            ],
            '/Develop/': [
                '',
                'Component.html',
                'Platform.html',
                'QuestionBank.html',
                'Utils.html',
            ],
        },
        serviceWorker: {
            updatePopup: true, // Boolean | Object, 默认值是 undefined.
            // 如果设置为 true, 默认的文本配置将是:
            // updatePopup: {
            //    message: "New content is available.",
            //    buttonText: "Refresh"
            // }
            updatePopup: {
                message: "文档有更新，新的内容已准备就绪",
                buttonText: "刷新获取新内容"
            }
        },
        // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
        repo: 'CodFrm/cxmooc-tools',
        // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
        // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
        repoLabel: 'GitHub',

        // 以下为可选的编辑链接选项

        // 假如文档不是放在仓库的根目录下：
        docsDir: 'docs',
        // 假如文档放在一个特定的分支下：
        docsBranch: 'master',
        // 默认是 false, 设置为 true 来启用
        editLinks: true,
        // 默认为 "Edit this page"
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: 'Last Updated', // string | boolean
    },
    plugins: [
        ['@vuepress/back-to-top'],
        [
            '@vuepress/google-analytics',
            {
                'ga': 'UA-138255059-2'
            }
        ]
    ]
}