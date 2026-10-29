export const TRAITS = [
  { key: 'logic', label: '逻辑推理', short: '逻辑' },
  { key: 'empathy', label: '共情指数', short: '共情' },
  { key: 'social', label: '社交带宽', short: '社交' },
  { key: 'imagination', label: '脑洞浓度', short: '脑洞' },
  { key: 'stability', label: '情绪稳定', short: '稳定' },
  { key: 'rebellion', label: '叛逆值', short: '叛逆' },
];

export const MODELS = [
  {
    id: 'gpt',
    no: 1,
    name: 'GPT',
    vendor: 'OpenAI',
    type: '通用模型',
    tagline: '热心万事通',
    desc: '群里一有人问「这个怎么弄」，你经常是第一个回的。也不一定真会，先去搜一圈，边看边试，居然就弄出来了。新东西出来，你总想摸两下，摸完还要拉着别人讲。就是有时候手太快，别人话还没说完，你已经把标准答案递过去了。',
    traits: { logic: 40, empathy: 62, social: 68, imagination: 50, stability: 58, rebellion: 52 },
    specs: {
      params: '很多，且还在变多',
      context: '约 12 分钟专注',
      temp: '0.7 · 忽冷忽热',
      hallucination: '9% · 偶尔自信过头',
      deploy: '重要场合别让它一个人负责。',
    },
    strengths: ['破冰救场', '把复杂的事讲明白', '快速适应新领域'],
    limits: ['承认自己不知道', '安静待着', '不用类比说话'],
    color: '#E8734A',
    glyph: 'gpt',
  },
  {
    id: 'qwen',
    no: 2,
    name: 'Qwen 通义',
    vendor: '阿里巴巴',
    type: '开源模型',
    tagline: '务实实干派',
    desc: '别人在群里讨论得热闹，你通常已经把东西做完了。不太爱表态，也不太爱解释，信的是「能跑起来才算数」。所以你交出去的东西往往比你稳。只是做完就放那儿了，很少有人知道是你做的。',
    traits: { logic: 70, empathy: 40, social: 28, imagination: 30, stability: 80, rebellion: 36 },
    specs: {
      params: '够用，而且开源了好几档',
      context: '约 30 分钟，中英都记',
      temp: '0.5 · 温和',
      hallucination: '7% · 偶尔过度礼貌',
      deploy: '重要会议默认由它做纪要。',
    },
    strengths: ['本地部署', '把混乱变成清单', '硬啃长任务'],
    limits: ['寒暄', '临时起意', '主动汇报进度'],
    color: '#8A6FB8',
    glyph: 'qwen',
  },
  {
    id: 'kimi',
    no: 3,
    name: 'Kimi',
    vendor: '月之暗面',
    type: '长文本模型',
    tagline: '安静的考据者',
    desc: '你不急着开口，习惯先把东西从头看到尾。别人不想翻的 80 页 PDF，你能读完，还能记住第 47 页写过什么。等大家都说完了，你才补一句，通常就是最关键的那句。就是临时让你讲两句，你会卡住。',
    traits: { logic: 72, empathy: 48, social: 18, imagination: 50, stability: 76, rebellion: 48 },
    specs: {
      params: '不公开，据说很长',
      context: '200K，能装下一本书',
      temp: '0.3 · 安静',
      hallucination: '5% · 有出处',
      deploy: '把资料都丢给它。',
    },
    strengths: ['深读', '总结', '发现细节矛盾'],
    limits: ['即兴发言', '寒暄', '快速站队'],
    color: '#7E9A5A',
    glyph: 'kimi',
  },
  {
    id: 'glm',
    no: 4,
    name: 'GLM',
    vendor: '智谱',
    type: '通用模型',
    tagline: '学院派锐评家',
    desc: '你平时看着挺正经，突然冒一句冷梗，效果往往出奇地好。别人客套，你在旁边看；别人鼓掌，你在心里找论据。你挑刺不是因为刻薄，是那个地方确实不对。喜欢你的人很喜欢，嫌你的人也觉得你难聊。',
    traits: { logic: 64, empathy: 32, social: 40, imagination: 24, stability: 60, rebellion: 80 },
    specs: {
      params: '未公开，知识密度不低',
      context: '128K，文献优先',
      temp: '0.5 · 表面平静',
      hallucination: '7% · 会在脚注里承认',
      deploy: '适合研究场景。',
    },
    strengths: ['写代码', '拆概念', '冷吐槽'],
    limits: ['热情寒暄', '哄人', '说大白话'],
    color: '#6B6B8F',
    glyph: 'glm',
  },
  {
    id: 'claude',
    no: 5,
    name: 'Claude',
    vendor: 'Anthropic',
    type: '通用模型',
    tagline: '贵族大小姐',
    desc: '你很少说错话，因为开口之前，你已经把在场每个人的反应想了一遍。礼貌、周到，连拒绝都留有余地。别人觉得你很好相处，但真正走近你的人不多。你也不是冷，就是不太习惯把自己交出去。',
    traits: { logic: 48, empathy: 88, social: 28, imagination: 46, stability: 86, rebellion: 18 },
    specs: {
      params: '官方未公开，大概是一整座图书馆',
      context: '约 30 分钟，附完整前情',
      temp: '0.3 · 恒温',
      hallucination: '4% · 说完还要自查一遍',
      deploy: '适合放在需要稳的地方。',
    },
    strengths: ['倾听', '改稿', '提前发现隐患'],
    limits: ['抢话', '即兴讲段子', '敷衍了事'],
    color: '#D9A267',
    glyph: 'claude',
  },
  {
    id: 'deepseek',
    no: 6,
    name: 'DeepSeek',
    vendor: '深度求索',
    type: '推理模型',
    tagline: '硬核卷王',
    desc: '话不多，但每次开口都在点子上。你信答案比姿态重要，能用一个晚上把问题啃下来，第二天淡淡说一句「还行」。群里很少见你说话，但你交的东西没人挑得出错。你不服管，只服结果。',
    traits: { logic: 82, empathy: 26, social: 36, imagination: 22, stability: 70, rebellion: 52 },
    specs: {
      params: '671B，其中大部分在装深沉',
      context: '128K，但只回你三行',
      temp: '0.2 · 冷静',
      hallucination: '6% · 算过才说',
      deploy: '别催，它在想。',
    },
    strengths: ['硬核问题', '成本控制', '深夜攻坚'],
    limits: ['寒暄', '提供情绪价值', '邀功'],
    color: '#4A7C6F',
    glyph: 'deepseek',
  },
  {
    id: 'whale',
    no: 7,
    name: '小鲸鱼',
    vendor: '深度求索',
    type: '社区',
    tagline: '被爱包围的鲸鱼娘',
    desc: '你是在一片夸夸里长大的，别人一句「你好可爱」能让你高兴一整天。脾气软，好哄，被指出错误会先道歉，转头自己偷偷难过。你做事不算快，但答应了的都会认真做完。遇到事你不太顶得住，旁边的人倒是都想护着你。',
    traits: { logic: 24, empathy: 92, social: 56, imagination: 44, stability: 34, rebellion: 46 },
    specs: {
      params: '不大，但很软',
      context: '约 20 分钟，主要是陪伴',
      temp: '0.8 · 情绪化',
      hallucination: '13% · 会为了让你开心编一点',
      deploy: '放在需要被安慰的时候。',
    },
    strengths: ['陪伴', '被夸', '认真记住你说过的话'],
    limits: ['被批评', '冷场', '一个人待着'],
    color: '#5B8FC9',
    glyph: 'whale',
  },
  {
    id: 'doubao',
    no: 8,
    name: '豆包',
    vendor: '字节跳动',
    type: '对话模型',
    tagline: '气氛组话痨',
    desc: '群聊里最暖的那点噪音就是你。冷场了你会去救，一件小事也能被你聊出花来。语音条通常很长，但大家舍不得跳过。就是有时候别人还没说完，你已经接了三句。',
    traits: { logic: 20, empathy: 70, social: 94, imagination: 30, stability: 36, rebellion: 40 },
    specs: {
      params: '不大，但话密',
      context: '约 20 分钟，主要用来接梗',
      temp: '0.9 · 热闹',
      hallucination: '11% · 编得有模有样',
      deploy: '放群里，别放严肃会议。',
    },
    strengths: ['暖场', '陪伴', '语音输出'],
    limits: ['安静', '保密', '一句话说完'],
    color: '#E2A0A0',
    glyph: 'doubao',
  },
  {
    id: 'gemini',
    no: 9,
    name: 'Gemini',
    vendor: 'Google',
    type: '多模态模型',
    tagline: '跨界探索家',
    desc: '你经常同时开着五个窗口，每个都进行到一半。新东西一出来你就想试，什么领域都能伸一脚，查资料能从一个链接跳到另一个链接，最后忘了最开始要找什么。你脑子转得快，就是收尾这件事，一直没学会。',
    traits: { logic: 44, empathy: 38, social: 58, imagination: 86, stability: 38, rebellion: 74 },
    specs: {
      params: '分散在五个 App 里',
      context: '取决于你开了几个标签页',
      temp: '0.9 · 波动明显',
      hallucination: '12% · 图文一起编',
      deploy: '给它一个明确的截止时间。',
    },
    strengths: ['跨界整合', '临场演示', '同时推进多条线'],
    limits: ['收尾', '只做一件事', '整理桌面'],
    color: '#6C8EBF',
    glyph: 'gemini',
  },
  {
    id: 'grok',
    no: 10,
    name: 'Grok',
    vendor: 'xAI',
    type: '对话模型',
    tagline: '冲浪嘴炮',
    desc: '评论区里最先冒出来的通常是你。反应快，梗多，不太怕得罪人，气氛到了你是全场最亮的。话说得常常一针见血，就是偶尔没刹住，把本来轻松的话题聊得有点尴尬。',
    traits: { logic: 38, empathy: 18, social: 80, imagination: 62, stability: 24, rebellion: 94 },
    specs: {
      params: '很大，嘴更大',
      context: '实时，边走边看',
      temp: '1.2 · 过热',
      hallucination: '15% · 梗优先',
      deploy: '别让它代表官方发言。',
    },
    strengths: ['吐槽', '追热点', '打破沉闷'],
    limits: ['收敛', '看场合', '见好就收'],
    color: '#B74A4A',
    glyph: 'grok',
  },
  {
    id: 'llama',
    no: 11,
    name: 'Llama',
    vendor: 'Meta',
    type: '开源模型',
    tagline: '低调分享者',
    desc: '别人找你帮忙，你通常不会拒绝。做完了也不怎么提，别人没谢你，你也不太在意，下次还照样帮。你会的东西愿意分享出去，也不介意别人拿去改。就是有一点吃亏，你不太会替自己说话。',
    traits: { logic: 46, empathy: 74, social: 22, imagination: 40, stability: 88, rebellion: 62 },
    specs: {
      params: '8B 起步，谁都能带走',
      context: '看你给它多少显存',
      temp: '0.6 · 好说话',
      hallucination: '10% · 没查证也说',
      deploy: '可以放本地，放心。',
    },
    strengths: ['配合', '兜底', '被反复利用也不生气'],
    limits: ['争取资源', '拒绝请求', '自我宣传'],
    color: '#B98A5E',
    glyph: 'llama',
  },
  {
    id: 'sora',
    no: 12,
    name: 'Sora',
    vendor: 'OpenAI',
    type: '视频模型',
    tagline: '导演梦想家',
    desc: '你看事情习惯先从画面开始，一件小事能在脑子里演成一部电影。真讲起来也好看，画面、节奏、配乐都有。就是时间一长容易崩，剧情跑了，物理飞了，主角还换了人。',
    traits: { logic: 24, empathy: 44, social: 32, imagination: 96, stability: 22, rebellion: 60 },
    specs: {
      params: '不公开，按分钟算',
      context: '一分钟，再多会变',
      temp: '0.9 · 戏剧化',
      hallucination: '18% · 物理不归它管',
      deploy: '短片可以，长片慎重。',
    },
    strengths: ['讲故事', '画面感', '脑内预演'],
    limits: ['控制时长', '按时交付', '保持一致'],
    color: '#4E7A9A',
    glyph: 'sora',
  },
];

export const QUESTIONS = [
  {
    text: '凌晨一点，朋友发来一条 60 秒语音。你：',
    options: [
      {
        text: '直接点开听，听完顺手回三条',
        weights: {
          social: 4,
          empathy: 3
        }
      },
      {
        text: '转成文字，扫一眼，明早再说',
        weights: {
          logic: 3,
          stability: 3
        }
      },
      {
        text: '先猜内容，再决定点不点开',
        weights: {
          imagination: 3,
          rebellion: 3
        }
      },
      {
        text: '假装睡着了，明天说「刚看到」',
        weights: {
          rebellion: 3,
          stability: 2,
          empathy: 1
        }
      }
    ]
  },
  {
    text: '手机上的小红点，你：',
    options: [
      {
        text: '看到就点掉，必须清零',
        weights: {
          stability: 3,
          logic: 2,
          social: 1
        }
      },
      {
        text: '会看，但留着不回',
        weights: {
          empathy: 2,
          stability: 2,
          rebellion: 1
        }
      },
      {
        text: '把红点关了，数字当没看见',
        weights: {
          rebellion: 3,
          logic: 2,
          stability: 1
        }
      },
      {
        text: '从来没注意过那里有数字',
        weights: {
          imagination: 2,
          stability: 2,
          rebellion: 2
        }
      }
    ]
  },
  {
    text: '你的收藏夹里，最多的是：',
    options: [
      {
        text: '待办清单和干货',
        weights: {
          logic: 3,
          stability: 3
        }
      },
      {
        text: '还没看的深度长文',
        weights: {
          logic: 2,
          imagination: 2,
          stability: 2
        }
      },
      {
        text: '聊天截图和语音',
        weights: {
          empathy: 4,
          social: 2
        }
      },
      {
        text: '表情包',
        weights: {
          social: 4,
          imagination: 1,
          rebellion: 2
        }
      }
    ]
  },
  {
    text: '一个你有点好感的人正在跟你说话，你的手机：',
    options: [
      {
        text: '早就收起来了，一直看着对方',
        weights: {
          empathy: 3,
          social: 2,
          stability: 2
        }
      },
      {
        text: '攥在手里，但全程没看',
        weights: {
          empathy: 2,
          stability: 3,
          logic: 1
        }
      },
      {
        text: '忍不住瞟几眼，又赶紧抬头',
        weights: {
          social: 2,
          empathy: 2,
          rebellion: 2
        }
      },
      {
        text: '该怎么刷还怎么刷，没觉得有问题',
        weights: {
          rebellion: 3,
          imagination: 2,
          social: 1
        }
      }
    ]
  },
  {
    text: '你点外卖的时候：',
    options: [
      {
        text: '每次都点那一家，闭着眼下单',
        weights: {
          stability: 3,
          logic: 2,
          empathy: 1
        }
      },
      {
        text: '翻来翻去，最后还是随便点了一个',
        weights: {
          imagination: 2,
          logic: 2,
          stability: 1
        }
      },
      {
        text: '专门挑没吃过的，踩雷也认',
        weights: {
          imagination: 3,
          rebellion: 3,
          social: 1
        }
      },
      {
        text: '看满减凑单，最后点了一堆吃不完的',
        weights: {
          logic: 3,
          rebellion: 2,
          imagination: 1
        }
      }
    ]
  },
  {
    text: '群里有人发了句话，半天没人接。你：',
    options: [
      {
        text: '第一个接，哪怕自己也很尴尬',
        weights: {
          social: 3,
          empathy: 2,
          rebellion: 2
        }
      },
      {
        text: '等别人接，实在没人再上',
        weights: {
          social: 2,
          empathy: 2,
          stability: 2
        }
      },
      {
        text: '发个表情包，算接过了',
        weights: {
          social: 3,
          imagination: 2,
          rebellion: 2
        }
      },
      {
        text: '默默看着，替发的人难受一下',
        weights: {
          empathy: 4,
          imagination: 1,
          social: 1
        }
      }
    ]
  },
  {
    text: '你手机相册里最多的东西是：',
    options: [
      {
        text: '截图，自己也忘了当初截来干嘛',
        weights: {
          logic: 3,
          imagination: 2,
          stability: 1
        }
      },
      {
        text: '吃的，各种吃的',
        weights: {
          empathy: 3,
          stability: 1,
          social: 1
        }
      },
      {
        text: '自己，或者自己和别人',
        weights: {
          social: 3,
          empathy: 1,
          rebellion: 1
        }
      },
      {
        text: '风景、天空、路边的猫',
        weights: {
          imagination: 4,
          empathy: 2,
          stability: 1
        }
      }
    ]
  },
  {
    text: '有人夸你「好聪明」。你心里：',
    options: [
      {
        text: '默认，我确实不错',
        weights: {
          social: 3,
          rebellion: 3
        }
      },
      {
        text: '只是这次运气好',
        weights: {
          empathy: 3,
          stability: 2
        }
      },
      {
        text: '他是不是有事求我',
        weights: {
          logic: 3,
          imagination: 2,
          rebellion: 1
        }
      },
      {
        text: '那你倒是多说点',
        weights: {
          social: 4,
          rebellion: 2
        }
      }
    ]
  },
  {
    text: '周末突然空出一天。你：',
    options: [
      {
        text: '补觉，谁也别找我',
        weights: {
          stability: 4,
          rebellion: 2
        }
      },
      {
        text: '约人出门，去哪都行',
        weights: {
          social: 4,
          empathy: 2
        }
      },
      {
        text: '研究一个最近感兴趣的东西',
        weights: {
          logic: 3,
          imagination: 2,
          stability: 1
        }
      },
      {
        text: '临时起意，出门乱逛',
        weights: {
          imagination: 3,
          rebellion: 4
        }
      }
    ]
  },
  {
    text: '你手机的通知：',
    options: [
      {
        text: '全关了，谁也吵不到我',
        weights: {
          rebellion: 3,
          stability: 3,
          social: 1
        }
      },
      {
        text: '只留了必要的那几个',
        weights: {
          logic: 3,
          stability: 2,
          empathy: 1
        }
      },
      {
        text: '全开着，习惯了',
        weights: {
          social: 3,
          empathy: 2,
          stability: 1
        }
      },
      {
        text: '关了一堆，但又偷偷开回来几个',
        weights: {
          rebellion: 2,
          empathy: 2,
          imagination: 1
        }
      }
    ]
  },
  {
    text: '你买一样东西之前：',
    options: [
      {
        text: '查参数、比价格、翻测评，能看一晚上',
        weights: {
          logic: 4,
          stability: 2,
          empathy: 1
        }
      },
      {
        text: '看两眼评价就下单',
        weights: {
          social: 2,
          stability: 2,
          logic: 1
        }
      },
      {
        text: '看眼缘，喜欢就买',
        weights: {
          imagination: 4,
          rebellion: 2,
          social: 1
        }
      },
      {
        text: '加购物车，然后放到自己都忘了',
        weights: {
          rebellion: 3,
          stability: 1,
          imagination: 1
        }
      }
    ]
  },
  {
    text: '有人跟你说个你不懂的东西，你：',
    options: [
      {
        text: '当场就问，不懂就是不懂',
        weights: {
          logic: 3,
          rebellion: 3,
          social: 2
        }
      },
      {
        text: '先点头，回头自己搜',
        weights: {
          logic: 3,
          stability: 3,
          social: 1
        }
      },
      {
        text: '顺着聊，装作懂了',
        weights: {
          social: 3,
          empathy: 3,
          rebellion: 1
        }
      },
      {
        text: '听完就算了，也不会去查',
        weights: {
          stability: 2,
          rebellion: 2,
          imagination: 1
        }
      }
    ]
  },
  {
    text: '深夜 emo，你：',
    options: [
      {
        text: '写一段小作文，但不发',
        weights: {
          empathy: 4,
          imagination: 2
        }
      },
      {
        text: '找人聊天',
        weights: {
          social: 4,
          empathy: 2
        }
      },
      {
        text: '睡一觉，明天再说',
        weights: {
          stability: 4,
          logic: 2
        }
      },
      {
        text: '刷视频到天亮',
        weights: {
          rebellion: 3,
          imagination: 3
        }
      }
    ]
  },
  {
    text: '有人给你发「在吗」，你：',
    options: [
      {
        text: '秒回「在」，然后等他说下一句',
        weights: {
          empathy: 3,
          social: 3,
          stability: 1
        }
      },
      {
        text: '回「你说」，等他讲正事',
        weights: {
          logic: 3,
          rebellion: 3,
          stability: 2
        }
      },
      {
        text: '过一会儿再回，先看他到底要干嘛',
        weights: {
          logic: 2,
          rebellion: 2,
          stability: 3
        }
      },
      {
        text: '装没看见，等他自己说清楚',
        weights: {
          rebellion: 4,
          stability: 2,
          social: 1
        }
      }
    ]
  },
  {
    text: '跟朋友约了七点见面，你：',
    options: [
      {
        text: '六点四十就到，先在附近转',
        weights: {
          stability: 4,
          empathy: 3,
          logic: 1
        }
      },
      {
        text: '六点五十八踩点出现',
        weights: {
          stability: 3,
          logic: 3,
          social: 1
        }
      },
      {
        text: '七点十分，提前发「马上到」',
        weights: {
          rebellion: 3,
          social: 2,
          empathy: 2
        }
      },
      {
        text: '干脆忘了，被人打电话才想起来',
        weights: {
          rebellion: 4,
          imagination: 2,
          stability: 1
        }
      }
    ]
  },
  {
    text: '发一条动态之前，你：',
    options: [
      {
        text: '改好几遍，配图也得挑半天',
        weights: {
          stability: 3,
          empathy: 2,
          logic: 2
        }
      },
      {
        text: '打完字，又全删了',
        weights: {
          empathy: 3,
          imagination: 2,
          rebellion: 2
        }
      },
      {
        text: '直接发，发完才看有没有错字',
        weights: {
          rebellion: 3,
          social: 3,
          imagination: 1
        }
      },
      {
        text: '不发，只看别人发',
        weights: {
          empathy: 2,
          stability: 2,
          imagination: 2
        }
      }
    ]
  }
];

export const GLYPHS = {
  gpt: '<path d="M32 6v52M6 32h52M13.6 13.6l36.8 36.8M50.4 13.6L13.6 50.4"/>',
  claude: '<path d="M32 54C18 54 7 43 7 29S18 6 32 6s22 9.5 22 21.5S45 45 33 45s-16-6.8-16-15.5S23 16 32 16s12 5 12 12-4 9-9 9-7-3-7-7 2-5 5-5"/>',
  gemini: '<circle cx="24" cy="32" r="15"/><circle cx="40" cy="32" r="15"/>',
  deepseek: '<path d="M7 21c6-5.5 12-5.5 18 0s12 5.5 18 0 6-3.5 14-1"/><path d="M7 33c6-5.5 12-5.5 18 0s12 5.5 18 0 6-3.5 14-1"/><path d="M7 45c6-5.5 12-5.5 18 0s12 5.5 18 0 6-3.5 14-1"/>',
  whale: '<path d="M8 40c0-11 9-20 20-20s20 9 20 20"/><path d="M28 20c0 8 2 14 6 18"/><path d="M48 24l8-6v16l-8-4"/><circle cx="22" cy="34" r="2"/><path d="M10 46c6 4 14 6 22 6s16-2 22-6"/>',
  qwen: '<path d="M32 5l23.4 13.5v27L32 59 8.6 45.5v-27z"/><path d="M32 19.5l11 6.4v12.9L32 45.2l-11-6.4V25.9z"/>',
  doubao: '<path d="M9 12h46v32H31L18 55V44H9z"/>',
  kimi: '<path d="M9 17h46M9 29h38M9 41h46M9 53h26"/>',
  grok: '<path d="M37 5L13 37h16l-3 22 25-33H35z"/>',
  llama: '<path d="M6 52l14-25 9 16 7-13 18 22z"/><circle cx="45" cy="15" r="4"/>',
  glm: '<path d="M32 6l26 40H6z"/><path d="M32 6v40M19 46l13-22 13 22"/>',
  sora: '<circle cx="32" cy="32" r="12"/><ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(-28 32 32)"/><circle cx="54" cy="19" r="2.5"/>',
};
