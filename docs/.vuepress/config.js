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
      { text: 'Home', link: '/' },
      { text: '浏览器插件', link: '/1-Browser extension/' },
      { text: '油猴脚本', link: '/2-Tampermonkey/' },
      { text: '免责声明', link: '/3-Disclaimer/' },
      {
        text: 'Languages',
        items: [
          { text: '简体中文', link: '/language/chinese/' },
          { text: 'English', link: '/language/english/' }
        ]
      },
      { text: 'Github', link: 'https://github.com/CodFrm/cxmooc-tools' },
    ],
    serviceWorker: {
      updatePopup: true // Boolean | Object, 默认值是 undefined.
      // 如果设置为 true, 默认的文本配置将是: 
      // updatePopup: { 
      //    message: "New content is available.", 
      //    buttonText: "Refresh" 
      // }
    },
    // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
    repo: 'CodFrm/cxmooc-tools',
    // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
    // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
    repoLabel: '查看源码',

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
  
  plugins: ['@vuepress/back-to-top'] 
}