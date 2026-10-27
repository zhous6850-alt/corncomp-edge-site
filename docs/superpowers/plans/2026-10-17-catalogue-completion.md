# Catalogue Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 按产品册补齐分类、产品系列与规格，以六语言预览交付，不发布正式站。

**Architecture:** 沿用 Astro 静态站、records 与 locale 数据及现有分类/详情模板。产品册覆盖清单记录来源和缺口；原有 canonical 路由被冻结，新分类可引用原有产品地址，不强制迁移。用同一份英文规格事实生成六语言表格。

**Tech Stack:** Astro 5.18.2、Node 原生测试、现有 Python/PDF 渲染工具、Wrangler 预览部署；不增加框架或数据库。

**Spec:** `docs/superpowers/specs/2026-10-17-catalogue-completion-design.md`

## Global Constraints

- 仅做预览，不发布正式站。
- 现有产品、分类和六语言 URL 保持不变。
- 六种语言共享同一份型号与数值事实；仅翻译名称、说明和界面文本。
- 同一结构和材质的多尺寸归入一个产品页规格表；型号不拆成重复页面。
- AI 场景图不能充当新增产品的真实规格图。
- 不得从产品册推断当前价格、库存、最低订量、交期或认证有效性。
- 当前工作树含大量既有修改；只提交本任务自己明确拥有的文件差异，不提交认证目录、构建缓存或其他用户改动。

## Review Focus

- 跨页 PDF：物理页与印刷页不一致时，来源仍应定位到正确表格；Task 1 检查双页来源字段。
- 旧分类迁移：新增分类不能使原有商品 URL 改变；Task 2 比较完整路由基线。
- 同名异材质：纸盘与甘蔗渣盘、沙拉碗与圆底食品盒不能合并；Task 3 检查系列分类与材料。
- 翻译参数漂移：任何语言漏型号或改尺寸都应失败；Task 4 对比结构化规格。
- 长菜单：法语/德语长词及阿拉伯语 RTL 不应溢出或遮住关闭操作；Task 5 桌面和手机实测。

## Task 1: 冻结基线并建立产品册覆盖清单

**Files:** Create `docs/qa/catalogue-route-baseline.json`, `site/src/data/catalogue-coverage.json`, `docs/qa/catalogue-unresolved.md`; Test `site/src/lib/catalogue-coverage.test.mjs`.

**Interfaces:** coverage 为数组，每项 `{seriesKey, sourceName, pdfPage, printedPages, categorySlug, productSlug, status, specificationRows, imageSource, unresolved}`。`status` 仅为 `existing`, `new`, `unresolved`；`specificationRows` 是已人工核对的行数，不是估算值。基线保存现有六语言实际构建路径列表。

- [ ] 保存当前 dist 中所有 HTML 路由及现有产品键；验明基线没有重复路径，不改旧页面。
- [ ] 逐页读取 PDF 物理 2–25 页，必要时提高渲染分辨率；逐个命名系列填写 coverage，不能只抄目录。数值模糊项写入 unresolved。
- [ ] 写测试 `catalogue series retain traceable unique identities`：系列键唯一、pdfPage 在 2..25、printedPages 非空、产品或待核实说明存在；人为重复键和空来源须被拒绝。
- [ ] 运行 `node --test site/src/lib/catalogue-coverage.test.mjs` 看失败；完成清单和最小验证后重跑通过。人工比对每页系列数与清单数，记录不一致。
- [ ] 仅检查并提交本任务新建文件。

## Task 2: 补齐分类并保护原有路由

**Files:** Modify `site/src/lib/site-architecture.mjs`, `site/src/lib/localization.mjs`, `site/src/lib/content-routes.mjs` only if needed; Test `site/src/lib/site-architecture.test.mjs`, `site/src/lib/content-routes.test.mjs`, `site/src/lib/catalogue-coverage.test.mjs`.

**Interfaces:** 保留 `PRODUCT_GROUPS`, `PRODUCT_CATEGORIES`, `PRODUCT_CATEGORY_BY_SLUG`, `canonicalProductRoute(slug)` 现有导出；新导出 `PRODUCT_ROUTE_OVERRIDES` 为旧产品 slug 到冻结 canonical 地址的映射，在分类归属改变时优先读取它。不得通过新增分类重新计算旧产品地址。

- [ ] 先加测试：新类别 `paper-trays`, `square-food-boxes`, `round-food-boxes`, `menu-boxes`, `paper-bags`, `compostable-waste-bags`, `bagasse-plates`, `bagasse-bowls`, `bagasse-trays`, `bagasse-clamshells` 都可解析；保留现有纸杯、汤杯、沙拉碗、冰淇淋杯和所有食品盒分类。
- [ ] 加测试：现有每个 productSlug 的 canonical 地址等于基线，旧六语言路径均仍构建；测试须在重分类会改变旧地址时失败。
- [ ] 实现四个浏览分组：cups-bowls、food-boxes-containers、foodservice-supplies、bagasse；配件和袋类在第三组。新增类别生成真实非空列表，不删除旧泛食品盒汇总页。
- [ ] 运行上述三个测试文件；若 localization 的完整性门禁需要同步新条目，则将这一步与 Task 4 一起验收，不能绕过验证。
- [ ] 检查 diff，仅提交本任务差异。

## Task 3: 产品数据与原图补齐

**Files:** Modify `site/src/data/records.json`, `site/src/data/media.json`, `site/src/data/visual-media.mjs` as consumed by existing templates; Create images under `site/public/media/catalogue/`; Update coverage; Test `site/src/lib/catalogue-coverage.test.mjs`, `site/src/lib/product-facts.test.mjs`.

**Interfaces:** 沿用现有 record 的 type、slug、language、route、title、body、featuredMedia 等字段；新增产品使用稳定唯一 ID 和英文键。`extractProductFacts(record)` 继续输出 `{tables, itemCodes}`；不引入另一套商品渲染器。

- [ ] 先加测试 `each resolved catalogue series has a real product and matching specification rows`：coverage 对应 record 必须存在、type=product、表格行数与人工清单一致；缺一系列应失败。
- [ ] 先加测试 `paper and bagasse plate series remain distinct`：不同材料和分类分别有记录；新增商品不得只含空表或占位图片。
- [ ] 按 coverage 分批补齐原有系列缺失规格及新增系列。杯盖/碗盖保留关联入口；吸管颜色为系列选项，包装方式为说明或规格，不为单个颜色生成独立页。
- [ ] 抽取 PDF 产品原图或高质量裁切；每个文件对应 coverage 中的页与裁切来源。人工检查外形、裁边、型号归属，不把整页截图当单品图。
- [ ] 运行两组测试；逐页复核型号、单位、尺寸顺序和装箱量。无法确认的单元格不得编造，明确列出待核实事项。
- [ ] 检查 diff，仅提交本任务差异。

## Task 4: 六语言与详情/分类内容接入

**Files:** Modify `site/src/data/locales/{fr,es,ar,zh,de}.json`, `site/src/lib/localization.mjs`, `site/src/data/visual-media.mjs`; modify `site/src/components/ArchitecturePage.astro` only if existing templates cannot render new groups; Test `site/src/lib/localization.test.mjs`, `site/src/lib/product-facts.test.mjs`, `site/src/lib/link-output.test.mjs`.

**Interfaces:** 沿用 `routeFor(language, contentKey)`, `localizedEntry(language, contentKey)` 和共享 `extractProductFacts(record)`；新增页面必须有本地化名称、说明、SEO 与图片描述，参数来自英文事实表。

- [ ] 加失败测试：所有 resolved coverage 项在 en/fr/es/ar/zh/de 都有对应产品页；`extractProductFacts` 逐表 headers/rows 对比时数值与型号一致，不能只检查数字集合。
- [ ] 补译产品与分类内容，新增规格表头映射；不把整页英文作为翻译回退。法语/德语及阿拉伯语保留单位和型号格式。
- [ ] 构建后验证 canonical/hreflang、面包屑、分类列表、相关产品与图片路径。旧 URL 基线全数保留。
- [ ] 验证带产品信息询盘入口到现有联系页，productName/productSku/category 对应所选产品；不修改发送 API、防垃圾或成功提示。
- [ ] 跑以上测试及 `npm test`，记录缺口，不用删除测试来规避失败。
- [ ] 检查 diff，仅提交本任务差异。

## Task 5: 菜单布局与预览验收

**Files:** Modify `site/src/components/Header.astro`, `site/src/components/HomeProductCatalogue.astro` only for necessary links; Test `site/src/lib/build-output.test.mjs`; Create `docs/qa/2026-10-17-catalogue-completion.md`.

**Interfaces:** Header 消费 Task 2 的四分组；全部产品链接独占首行。首页仍为六张快捷卡；不新增卡数或替换场景图。预览仅部署 `wrangler.preview.jsonc`。

- [ ] 添加构建测试：菜单中四个分组和 coverage 分类入口均可达，分类页至少有一个产品；原首页六卡数量保持 6。
- [ ] 实现桌面四列、顶行全产品入口，菜单宽度受 viewport 限制；手机纵向可滚动。保持固定导航和原有键盘/Escape 行为。
- [ ] 串行运行 `npm run build`、`npm test`（site 目录），再运行 `node --test worker/inquiry.test.mjs`（仓库根）。每一步退出 0 后才继续，禁止并发构建同一个 dist。
- [ ] 浏览器检查英文、中文与阿拉伯语：桌面 1280 和手机 390 宽度，菜单开启/关闭、长词换行、RTL、链接目标及询盘预填；至少检查所有新增大类和两种材质相似产品。保存可复核截图。
- [ ] 自查 coverage：报告系列总数、已存在/新增/待核实数、规格行总数，人工确认 PDF 每个系列在清单内；有未解决缺口时不得称“全部补齐”。
- [ ] 部署预览并验证实际 URL、静态图片、六语言代表页与旧路径；交付预览链接、截图和待核实清单。不得部署正式配置。
- [ ] 检查 diff，仅提交本任务差异；正式发布由用户另行授权。

## 执行方式待选

推荐 Native：由当前会话按以上顺序实施，逐任务自检并在最终阶段独立复核（只有获得用户授权时才启用子代理）。这些任务依赖同一份逐页产品清单和共享本地化数据，串行可避免冲突。用户也可选择 Subagent-driven，在任务间加入独立实现/审查。
