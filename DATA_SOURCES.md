# 数据源与外部 API 清单

记录 France Business Development OS 当前使用的所有外部数据接口、AI 提供方，
标注**是否免费 / 是否需密钥 / 速率限制 / 许可证 / 商用限制**及代码位置。

> ⚠️ 重要：以下许可证与商用条款为编写时的整理，**正式商用上线前请逐一核实各方最新条款**
> （尤其标 🔴 的两项）。法律/合规结论请以官方文本及法律意见为准。

---

## 一、当前已接入（免密钥 / 实时）

### 1. recherche-entreprises（法国企业注册库）✅ 免费
- **用途**：企业情报(M3)、信用「财务健康」(M12)、机会发现的公司解析
- **端点**：`https://recherche-entreprises.api.gouv.fr/search`
- **代码**：[src/lib/sources/recherche-entreprises.ts](src/lib/sources/recherche-entreprises.ts)
- **认证**：无需密钥
- **费用**：免费（法国政府 DINUM/api.gouv.fr 公共服务）
- **速率限制**：约 **7 请求/秒/IP**（官方建议；超限返回 429）
- **数据来源/许可证**：聚合 INSEE SIRENE + RNE(INPI) 等，主体为 **Licence Ouverte / Etalab 2.0**
- **商用限制**：✅ **允许商用**，需署名（Open Licence 要求注明来源）。
  注意 `statut_diffusion`：部分自然人/非公示企业数据受限，不应公开展示被标为非公示的记录。

### 2. BOAMP（法国公共采购公告）✅ 免费
- **用途**：招标情报(M5) — France
- **端点**：`https://boamp-datadila.opendatasoft.com/api/explore/v2.1`
- **代码**：[src/lib/sources/boamp.ts](src/lib/sources/boamp.ts)
- **认证**：无需密钥
- **费用**：免费（DILA 开放数据，Opendatasoft 平台）
- **速率限制**：Opendatasoft 匿名调用有配额（按 IP 限流，建议缓存）
- **许可证**：**Licence Ouverte 2.0**
- **商用限制**：✅ 允许商用，需署名。

### 3. TED — Tenders Electronic Daily（欧盟招标）✅ 免费
- **用途**：招标情报(M5) — EU（招标页可切换 BOAMP/TED）
- **端点**：`https://api.ted.europa.eu/v3/notices/search`
- **代码**：[src/lib/sources/ted.ts](src/lib/sources/ted.ts)
- **认证**：无需密钥
- **费用**：免费（欧盟出版局 Publications Office）
- **速率限制**：有限流（建议缓存；大批量需用 bulk packages）
- **许可证**：欧盟数据再利用政策，允许复用
- **商用限制**：✅ 允许商用，需署名（注明来源 TED）。

### 3b. PLACE — 国家采购平台 marches-publics.gouv.fr ✅ 免费（HTML 解析）
- **用途**：招标情报(M5) — 法国国家（État）在线招标（招标页第 3 个 tab）
- **端点**：`https://www.marches-publics.gouv.fr/espace-entreprise/search?keyWord=...`（关键词）/ `/?page=Entreprise.EntrepriseAdvancedSearch&AllCons`（全部在线）
- **代码**：[src/lib/sources/place.ts](src/lib/sources/place.ts)
- **认证**：无需密钥；无 JSON API，解析服务端渲染的 HTML（robots.txt 全放行）
- **限制**：每次仅返回第一页 10 条（翻页需模拟 PRADO postback，未实现）；HTML 结构变更会导致解析失败（ATEXO MPE 平台，结构较稳定）
- **详情链接**：`/entreprise/consultation/{id}`

### 3c. FranceMarches（商业聚合平台）🔴 仅外链
- **用途**：招标页第 4 个 tab —— 站内不展示结果，仅生成带关键词的外链跳转 `https://www.francemarches.com/recherche?q=...`
- **原因**：站点启用 DataDome 反爬（服务端请求一律 403），且为商业聚合站（数据源本就是 BOAMP/JOUE），不做绕过。

### 4. BODACC（法定民商事公告）✅ 免费 / 🔴 商用有重要限制
- **用途**：信用「法律风险」(M12) — 破产/重整程序、法律事件
- **端点**：`https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/.../annonces-commerciales`
- **代码**：[src/lib/sources/bodacc.ts](src/lib/sources/bodacc.ts)
- **认证**：无需密钥
- **费用**：免费（DILA 开放数据）
- **许可证**：Licence Ouverte 2.0
- **商用限制**：🔴 **重点**：BODACC 含**个人数据**。DILA/CNIL 规定**禁止将 BODACC 数据用于对相关人员的商业招揽/直销（prospection commerciale）**。
  本项目仅用于**风险评分与合规背调**（合规用途），**不得**反向用于向公告中的自然人做营销触达。

### 5. Google News RSS（法国商业新闻）⚠️ 免费但非官方 / 🔴 商用存疑
- **用途**：新闻雷达(M15)
- **端点**：`https://news.google.com/rss/search?q=...&hl=fr&gl=FR`
- **代码**：[src/lib/sources/news.ts](src/lib/sources/news.ts)
- **认证**：无需密钥
- **费用**：免费
- **速率限制**：无官方文档；Google 可能不定期限流/封禁
- **许可证 / 商用限制**：🔴 **这是非官方接口**，无 SLA，**Google 服务条款不鼓励抓取/商业再分发**。
  仅展示标题+链接（不转载正文）风险较低，但**正式商用建议替换为有授权的新闻 API**：
  例如 NewsAPI.org、GNews、Bing News Search，或直接采购 Les Echos / AFP 等授权源。
  代码已做容错：抓取失败自动回退内置示例数据。

> 备注：曾尝试 **GDELT**（学术开放新闻库，CC-BY），但本机 IP 被其持续限速(429)，故改用 Google News RSS。
> GDELT 商用友好（署名即可），若部署在限流宽松的服务器可优先考虑。

---

## 二、已实现客户端但需密钥（未启用时回退）

| 源 | 用途 | 端点 | 费用模式 | 商用限制 | 代码 |
|----|------|------|----------|----------|------|
| **Pappers** | 企业深度财务 | `api.pappers.fr/v2` | 🔑 Freemium，免费额度有限，更多需**付费订阅** | 按订阅条款商用 | [pappers.ts](src/lib/sources/pappers.ts) |
| **INPI RNE** | 企业法定信息 | `registre-national-entreprises.inpi.fr/api` | 🔑 免费账号(登录取 token) | RNE 数据再利用允许，注意个人数据限制 | [inpi.ts](src/lib/sources/inpi.ts) |
| **EUIPO** | 欧盟商标(M4) | `api.euipo.europa.eu/trademark-search` | 🔑 免费开发者账号(OAuth2) | 商标数据复用允许，需遵守 EUIPO 条款 | [euipo.ts](src/lib/sources/euipo.ts) |

| **Aides-territoires** | 补贴/扶持资金匹配 | `aides-territoires.beta.gouv.fr/api/aids/` | 🔑 免费 token(注册申请，`X-AUTH-TOKEN`) | 政府公共服务，开放数据，允许复用需署名 | [aides.ts](src/lib/sources/aides.ts) |

> 启用方式：在 `.env` 填入对应密钥即可自动切换为真实数据；未配置时品牌(M4)走 mock、企业财务以 recherche-entreprises 为准。
> **补贴匹配**：未配 `AIDES_API_TOKEN` 时用内置真实国家级项目库(`src/lib/data/subsidies.ts`，France 2030 / Bpifrance / CIR / CII / JEI / ADEME / CCI 等公开稳定事实)按用户画像打分匹配；配 token 后叠加 Aides-territoires 实时地方性补贴。

---

## 三、AI / 大模型提供方

通过 `AI_PROVIDER` 选择，详见 [src/lib/ai.ts](src/lib/ai.ts)。

| Provider | 部署 | 费用 | 商用 | 备注 |
|----------|------|------|------|------|
| **Ollama**（默认） | 本地 | 免费（自托管） | 取决于**模型许可证** | 当前模型 `qwen2.5`（Qwen 许可，多数允许商用，需核实条款）；`llama3.1` 受 Meta 社区许可限制 |
| DeepSeek | 在线 API | 🔑 付费（按 token） | ✅ | `DEEPSEEK_API_KEY` |
| OpenAI | 在线 API | 🔑 付费 | ✅ | `OPENAI_API_KEY` |
| 通义千问 Qwen | 在线 API(DashScope) | 🔑 付费/有免费额度 | ✅ | `QWEN_API_KEY` |
| Claude | 在线 API | 🔑 付费 | ✅ | `ANTHROPIC_API_KEY` |

> 本地 Ollama 不产生 API 费用，但**模型权重各有许可证**，商用前请确认所选模型（如 Qwen/Llama）的具体商用条款。

---

## 四、尚未接真实源（占位 / 示意数据）

| 模块 | 现状 | 可选真实源 |
|------|------|-----------|
| 信用：付款风险 / 供应商可靠性 / 成长(M12) | ❌ 占位评分 | Pappers 评分、多年财务趋势、付款行为数据(需商业源) |

> 已真实化（迭代 8）：
> - **机会发现(M2)** → `lib/sources/discovery.ts`：按类别用调优法语查询打 recherche-entreprises，返回真实企业（失败按类回退 mock）。
> - **买家意向(M9)** → `lib/sources/intent.ts`：聚合 BOAMP 实时招标的采购方（正在采购=最强购买信号）。
> - **Dashboard 首页** → 实时新闻流(Google News) + 招标数(BOAMP) + 高意向买家(BOAMP 采购方)，KPI 带 `live` 圆点标记。
>
> 已真实化（迭代 9）：
> - **市场情报(M1)** → `lib/sources/market-stats.ts`：**Eurostat**(免密钥)`nama_10_a64` 法国分行业真实增加值(€) + 真实同比增长，按 NACE 映射 11 个行业；市场规模/增长来自官方统计，估算值仅作回退。
> - **关系网络(M8/11)** → `lib/sources/recherche-entreprises.ts` 的 `dirigeants`：搜公司→**真实高管**(姓名+职务)+ 法人股东(母公司)+ 下属机构数；API `/api/network/search` 优先选有高管的匹配。
> - **事件(M10)** → `lib/sources/events.ts`：展会本身是真实法国展会，叠加 **Google News 实时动态**(错峰请求，~4/6 命中最新报道，免费但非官方，受限流)。

### 新增免密钥真实源
| 源 | 模块 | 端点 | 商用 |
|----|------|------|------|
| **Eurostat** | 市场(M1) | `ec.europa.eu/eurostat/api/.../nama_10_a64` | ✅ 欧盟开放数据，允许商用，需署名 |

---

## 五、合规与商用 Checklist（上线前）

- [ ] 🔴 **BODACC**：确认仅用于风险/合规，**禁止**用于对自然人的商业招揽。
- [ ] 🔴 **Google News**：商用替换为有授权的新闻 API（NewsAPI / GNews / AFP / GDELT 等）。
- [ ] 各开放数据源**署名**（Licence Ouverte / TED / EUIPO 要求注明来源）。
- [ ] 尊重 `statut_diffusion`，不公开展示非公示的自然人/企业数据。
- [ ] 对所有外部 API 做**服务端缓存**（已用 Next `revalidate`）与限流，避免触发对方封禁。
- [ ] 确认所选**本地模型权重的商用许可**。
- [ ] 隐私合规（GDPR）：对企业/个人数据的存储、留存、删除流程。
