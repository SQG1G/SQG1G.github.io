export const SITE = {
  name: 'SQG1G',
  title: 'SQG1G · 代码与日常',
  description: 'SQG1G 的个人博客与技术笔记。记录代码、系统设计、工具，以及那些值得慢慢想清楚的事。',
  url: 'https://sqg1g.github.io',
  locale: 'zh-CN',
  author: {
    name: 'SQG1G',
    intro: '写代码，也写点别的。把复杂的事，尽量写清楚。',
  },
  repo: 'https://github.com/SQG1G/SQG1G.github.io',
  github: 'https://github.com/SQG1G',
  nav: [
    { label: '文章', href: '/posts/' },
    { label: '笔记', href: '/notes/' },
    { label: '标签', href: '/tags/' },
    { label: '关于', href: '/about/' },
  ],
  hero: {
    eyebrow: 'SQG1G 的个人博客',
    titleBefore: '把复杂的事，',
    titleEmphasis: '写清楚',
    titleAfter: '。',
    intro: '记录代码、系统与工具，也收藏那些值得慢慢想清楚的事。',
  },
  now: {
    label: 'NOW',
    title: '最近的重心',
    items: ['维护这座小小的数字花园', '把零散笔记养成可以复用的知识', '折腾让写作更顺手的工具链'],
  },
  about: {
    lead: '一个喜欢把事情拆开看、再重新拼起来的人。',
    paragraphs: [
      '我是 SQG1G。白天写代码，晚上也常常在写代码，偶尔把脑子里打结的想法写成文章。这个网站是我的公开笔记本，也是我留给未来自己的路标。',
      '我关心 Web 工程、开发工具和学习方法。比起「看起来聪明」，我更在意一件事能不能被讲清楚、被复用、被下一次的自己看懂。',
      '这里没有固定的更新频率。有想写的东西时就写，没想清楚时就先记一则短笔记。欢迎随便逛逛，也欢迎去 GitHub 找我。',
    ],
    principles: [
      {
        title: '先跑通，再跑好',
        text: '先让想法落地，再慢慢打磨。能工作的粗糙版本，胜过永远停在草稿里的完美设计。',
      },
      {
        title: '写作是思考的显影液',
        text: '很多问题只有在试着解释给别人听的时候，才会真正暴露出来。',
      },
      {
        title: '让系统可以被继承',
        text: '代码、笔记和习惯都一样：好的系统应该让未来的自己少猜一点。',
      },
    ],
  },
  social: [
    { label: 'GitHub', href: 'https://github.com/SQG1G' },
    { label: 'RSS', href: '/rss.xml' },
  ],
  ogImage: '/og-default.png',
} as const;
