# 询价页发布与结构化检查

## Decision summary

范围：corn-comp.com 的英文、法文、西文、阿文、中文、德文询价页，2026-10-19。新版已发布；现有全站 GEO-SEO-AUDIT.md 保留不动，本报告只记录本次询价页检查。

生产版本：780455c1-a2d1-4a17-81a6-485d9e2ebe3f；上一版本：1ea1ae3b-86ef-452b-be21-c89f1bde5508。

## Evidence ledger

| ID | Class | Source | Scope/date | Observation |
|---|---|---|---|---|
| E1 | Observed | contact-release-build.log / contact-release-tests.log | 本次构建 | 918 页构建完成；完整测试 194 通过、0 失败。 |
| E2 | Observed | geo-seo-audit-skill/scripts/audit_html.py | 六个本地询价页 | 每页一个 H1；JSON-LD 包含 ContactPage、Organization、BreadcrumbList、WebSite；脚本 issues 为空。 |
| E3 | Observed | Node fetch 正式 URL 与 JSON-LD 解析 | 六个正式语言页 | HTTP 200；无 noindex 响应头、无预览链接；ContactPage 名称匹配可见 H1，URL 匹配规范网址。 |
| E4 | Observed | 正式 JSON-LD 与页面内容对照 | 六个询价页 | 公司邮箱出现在页面；mainEntity/about 指向同一 Organization @id；面包屑 @id 可解析，末项为当前规范网址；inLanguage 对应页面语言。 |
| E5 | Observed | 浏览器正式中文页面 | 2026-10-19 | 新版无工厂插图，五个星号保留，产品及分类可自动带入；联系方式区域仅 WhatsApp 为链接。未发送询盘。 |
| E6 | Observed | Schema.org ContactPage 与 Google structured-data policies | 2026-10-19 | ContactPage 是 WebPage 子类型；结构化内容应与真实页面内容相符。 |

标准参考：[ContactPage](https://schema.org/ContactPage)、[Google 结构化数据政策](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)。

## Findings

### Technical/crawl

- 已检查：原有规范网址、六语言 hreflang 及 x-default 保留；正式 URL 无预览链接或 noindex 响应头（E1、E3）。优先级 P1，投入 S，置信度 high，验证为线上请求及完整路由测试。

### On-page

- 已修复：新版 H1 与旧 WebPage 名称不一致，现 JSON-LD 名称与新版可见标题一致（E1、E3）。原搜索标题仍使用各语言“请求报价”，准确描述页面目的。优先级 P1，投入 S，置信度 high。
- 已增加可见的首页/询价面包屑，对应 BreadcrumbList；保留表单字段名称、顺序、必填规则、接口、Turnstile、toast 和分析事件（E1、E4、E5）。

### Structured data

- 已完成 ContactPage、语言标记、规范 @id、公司主体关联及面包屑引用检查（E2、E3、E4）。没有加入 Product、Offer、Review、AggregateRating 或 FAQPage；不编造价格、评分、认证、回复时效或服务语言承诺。

### Content/citability

- 保留可见的真实邮箱和电话；仅 WhatsApp 为本联系区跳转。流程文案描述需求核对与报价，不承诺固定响应时间（E5）。

## Action plan

本次已完成：构建、回归、部署、六个语言页线上 JSON-LD 对照及中文浏览器检查。后续如需检查 Google 抓取/收录，应在用户授权下使用 Search Console URL 检查；不可由本报告推断收录或排名。

## Limitations

这是源代码、生成页面、本地检查脚本、自有回归和线上响应核查；未声称通过 Google Rich Results Test 或 Schema.org 在线验证器。ContactPage 标记本身不保证富结果、收录或排名。Semrush、关键词/流量/排名和全站竞争研究不在本次范围，均为 not observed。页脚已有公司社交链接未在本次重新核验身份归属。

截图：C:/Users/Sam/Documents/Codex/corncomp-contact-published-20261019.png。
