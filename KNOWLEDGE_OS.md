# Knowledge OS — 实现路线与可迁移/可扩容架构

把 `Knowledge-OS.md`（愿景规格）落到本项目（Next.js + Postgres + Prisma）的**可执行架构**，并保证将来**无缝迁移 VPS / 平滑扩容**。

---

## 1. 四层架构 → 本项目落地映射

| 规格层 | 现状 | 落地方案（增量） |
|---|---|---|
| **L1 原始数据层**（每日抓取、版本化、不覆盖） | 已有实时源适配器（recherche-entreprises / BOAMP / TED / BODACC / Eurostat / Google News，见 `lib/sources/`） | ✅ **已落地基座**：`RawDocument` 表（source/url/lang/checksum/version/status，**永不覆盖**，url+checksum 去重、内容变更新版本+supersede）+ `lib/raw-ingest.ts`；`GET /api/cron/ingest?key=CRON_SECRET` 定时抓官方源入库。文本内容内嵌入库(随 pg_dump 迁移)，大/二进制走对象存储 `storageKey`(待接 S3) |
| **L2 知识图谱层**（实体+关系，带置信度/来源/版本） | 翻译已有持久缓存（`Translation` 表）证明"DB 即资产"模式可行 | ✅ **已落地**：pgvector(`DocChunk` vector(1536)+HNSW)+ `KnowledgeNode`/`KnowledgeEdge`(confidence/sourceRef/CANDIDATE-APPROVED 状态)。管线：`/api/cron/index`(chunk+embed)、`/api/cron/extract`(LLM 抽实体/关系→候选，**不得凭空造**、可溯源)；admin `/admin/knowledge` 人工审核。`lib/rag.ts` 已接 **语义检索**入 Copilot grounding。embedding 走 `ai.ts#embed`(OpenAI，无 key 时 dev 兜底) |
| **L3 Playbook 库**（结构化工作流，模块化、可版本化） | ✅ **本次已交付**：`/playbooks`，内置"在法国建数据中心" playbook（任务/机构/许可/成本/工期/风险/官方链接），可搜索匹配、PDF 导出、留资 CTA。数据在 `lib/data/playbooks.ts`（git 版本化） | ✅ **已入库 + 版本历史**：`Playbook`/`PlaybookVersion` 表 + `lib/playbooks-db.ts`（按内容哈希幂等 sync、内容变更快照新版本）；页面从 DB 读取、code 兜底；admin `POST /api/playbooks/sync`。任务 `dependsOn` 已具备 DAG 结构，可引用 L2 节点 |
| **L4 项目经验层**（真实执行沉淀、统计） | 已有 `Lead`/`Event` 审计表的沉淀模式 | ✅ **已落地**：`Project`/`ProjectStep` 表（实际工期/成本/审批时长/问题/解决/经验教训，不覆盖历史）+ `lib/projects.ts`；admin `/admin/projects` 录入与管理；`experienceStats()` 聚合(平均工期/成功率/常见问题)，**呈现在 admin 项目页 + playbook 详情页**(L4→L3 闭环) |
| **Copilot RAG**（不直接由 LLM 回答，先检索知识） | ✅ **已改 RAG + 语义检索**：`lib/rag.ts` 融合 L3 playbook + L4 经验 + **L2 pgvector 语义召回**，`/api/copilot` 先检索再答、附**官方来源** | 后续：把已审核的图谱事实(APPROVED 节点/边)也并入 grounding |

> **本次已落地 L3 的第一块**：Playbook 是"知识资产"的最小可用形态——客户问"如何在法国建数据中心"，`matchPlaybook()` 直接返回结构化 playbook。新增 playbook 只是往 `PLAYBOOKS`（或将来 `Playbook` 表）加一条。

### 渐进式抽取管线（L1→L2，可重复、增量）
```
每日新文档 → 分块 → embedding(pgvector) → LLM 抽取实体/关系
→ 候选知识(带 confidence+sourceRef) → 人工审核(可选) → 入图谱(版本化)
```
全部走"幂等 upsert + 版本号"，跑多少次都安全。

---

## 2. 无缝迁移 VPS / 平滑扩容的架构原则

核心思想：**应用无状态，状态全在可移植的后端（Postgres + 对象存储）。** 迁移 = 搬数据；扩容 = 加无状态实例。本项目已基本符合，下面是要守住和补齐的点。

### 2.1 单一事实来源 = PostgreSQL
- 会话、用户、`Lead`/`Event`/`SavedItem`/`Translation`、将来的知识图谱/项目经验**全在 Postgres**（已如此）。
- **迁移 VPS** = `pg_dump`/`pg_restore`（或直接换成**托管 Postgres**：Neon / RDS / Scaleway）。换库只改 `DATABASE_URL` 一个环境变量。
- **扩容** = Postgres 加只读副本（读多写少的检索/统计走副本）；再大上 Citus/分区。`schema` 用 `prisma db push`，迁移可控。

### 2.2 应用层无状态（可水平扩容）
- 应用不依赖本地内存/本地磁盘存业务状态（会话在 DB）。**唯一例外**：`lib/rate-limit.ts` 是单进程内存滑窗——**多实例前要换成 Redis**（项目已有 Redis 容器，接上即可），否则限流不跨实例。
- 扩容 = 起多个 `pm2`/容器实例 + 前面挂负载均衡（或直接上 Docker/K8s）。无需改代码。

### 2.3 原始文档/大文件 → 对象存储（不要落 VPS 本地盘）
- L1 的 PDF/原始网页**不要存本地文件系统**（否则迁移要搬盘、扩容多实例不共享）。用 **S3 兼容对象存储**（Scaleway Object Storage / Cloudflare R2 / MinIO 自托管），DB 只存 URL+checksum。
- 这是当前唯一需要"提前定规矩"的点——一旦开始抓原始文档，直接写对象存储。

### 2.4 向量检索 → pgvector（留在 Postgres 里）
- embedding 用 **pgvector 扩展**存在同一个 Postgres，**不引入第二个有状态数据库**（迁移/备份仍只有一个 PG）。规模再大再考虑独立向量库。

### 2.5 配置全在环境变量（已如此）
- 所有密钥/端点/域名走 `.env`（`DATABASE_URL`/`REDIS_URL`/`RESEND_*`/`STRIPE_*`/`AI_*`/`NEXT_PUBLIC_APP_URL` …）。迁移新机 = 复制 `.env` + 改少数几个值。**代码里不写死环境相关值**（域名兜底已抽成默认值）。

### 2.6 容器化（推荐下一步，让迁移=拉镜像）
- 给应用加 `Dockerfile`（multi-stage：build → `next start`）。迁移/扩容 = `docker run` 同一镜像 + 不同 env。比"VPS 上 git pull + build"更可复现。
- 编排：先 `docker compose`（app + Postgres + Redis），将来上 K8s 水平扩。

### 2.7 数据可移植 + 备份
- 定时 `pg_dump` → 对象存储（异地）。迁移就是在新机 restore。
- 知识资产（L1–L4）天然是行数据，`pg_dump` 一并带走——**"软件可重写、知识资产不可"，所以知识必须在可导出的 Postgres 里，而非散落在代码/本地盘**。

---

## 3. 迁移/扩容 Checklist（按此顺序补齐）

1. ☑ 应用无状态、状态在 Postgres（已具备）。
2. ☑ **限流换 Redis**（已完成：`lib/rate-limit.ts` 配 `REDIS_URL` 时用 Redis 固定窗口，否则内存兜底；Redis 故障放行）。
3. ☐ **对象存储**接入（开始抓原始文档前定好；存 PDF/原网页）。
4. ☑ **pgvector** 扩展 + embedding(`DocChunk` vector(1536)+HNSW)；`embed()` 走 OpenAI/dev 兜底。
5. ☑ **Dockerfile + compose**（已完成并实测：`Dockerfile`(Next standalone)+ `docker-compose.prod.yml`(app+pg+redis+migrate)；镜像 477MB，容器启动/渲染/Prisma 引擎均 OK）。
6. ☐ **定时 pg_dump 异地备份**。
7. ☑ L1 `RawDocument` + L2 `DocChunk`/`KnowledgeNode`/`KnowledgeEdge` + L4 `Project`/`ProjectStep` 均已建。

> 当前生产（CloudPanel + pm2 + 本地 Postgres）已能跑；要"无缝迁移/扩容"，**第 2、3、5 步**是关键转折点。在引入原始文档抓取（L1）之前先把"对象存储 + Redis 限流"定下来，后面就不会被本地状态绑死。

---

## 4. 已交付 vs 待建

- ✅ **L3 Playbook 库**（`/playbooks` + 数据中心 playbook + 搜索匹配 + PDF + 留资）。
- ✅ 知识资产"在 Postgres"的范式验证（`Translation`/`Lead`/`Event`）。
- ◐ L1 RawDocument 抓取+版本化（已落地基座 + cron 抓取；对象存储 storageKey 待接 S3）。
- ☑ L2：pgvector 语义检索(已接 Copilot) + 知识图谱抽取(`/api/cron/extract`)+ admin 审核(`/admin/knowledge`)。
- ☑ L4 项目经验表 + Experience Intelligence 统计（`/admin/projects`，回灌 playbook 详情）。
- ☑ Copilot RAG：L3/L4/**L2 语义检索**均已接，带来源。
- ☑ 容器化（Dockerfile+compose，实测可跑）+ Redis 限流（扩容前置）。
