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
    ]
  }
}