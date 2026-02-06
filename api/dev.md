

# Dify后端架构设计与开发规范

## 1. 整体架构设计理念

### 1.1 分层架构模式

Dify后端架构采用经典的分层架构模式，通过职责分离将复杂系统分解为四个相互协作的层次。这种设计的核心在于**依赖方向的内向性**——外层依赖内层，内层对外层一无所知，从而确保领域核心的独立性和可测试性。分层不是简单的代码组织方式，而是对业务复杂度进行系统性控制的架构策略，每一层的边界和契约都经过精心设计，以支持系统的长期演进。

#### 1.1.1 表现层（Presentation Layer）

表现层作为系统与外部交互的边界，承担**协议适配**与**输入输出转换**的核心职责，严格遵循"薄层"设计原则。该层不包含任何业务逻辑，仅负责将HTTP请求转换为应用层可理解的命令对象，并将应用层返回的结果格式化为标准响应。在Dify的实践中，表现层需要处理RESTful端点映射、请求体验证与序列化、响应信封封装、内容协商以及异常到HTTP状态码的转换等技术关注点。

表现层的核心设计决策包括**资源导向的URL设计**——每个端点对应明确的业务资源，而非操作动词；**请求DTO的严格分离**——输入数据通过Pydantic等库进行运行时验证，失败时返回422 Unprocessable Entity；**异步响应的原生支持**——针对LLM流式输出场景，通过SSE（Server-Sent Events）实现长连接推送，表现层负责连接生命周期管理与背压控制。此外，表现层集成认证中间件提取JWT令牌或API Key，构建安全上下文，但本身不执行权限决策，仅将凭证传递给应用层。

#### 1.1.2 应用层（Application Layer）

应用层是**用例编排**的中心，负责将用户意图转换为领域操作序列，管理事务边界，协调多个领域对象完成复杂业务流程。该层的关键特征是**无领域规则**——所有业务决策委托给领域层，应用服务仅关注"做什么"而非"怎么做"。Dify中的应用服务如`CreateConversationService`、`ExecuteWorkflowService`等，每个对应一个完整的业务用例，接口设计直接反映用户价值而非技术实现。

应用层的职责边界需要精确把握：它负责**事务的显式控制**，通过Unit of Work模式确保聚合修改的原子性；**安全上下文的传递**，将租户ID、用户权限等上下文注入领域操作；**领域事件的发布协调**，在事务成功后触发异步处理；**跨聚合的查询协调**，当用例需要多个聚合数据时，应用服务负责调用各仓库组装结果。应用服务应当是粗粒度的，避免将领域层的细粒度操作直接暴露，同时保持无状态，所有依赖通过构造函数注入。

#### 1.1.3 领域层（Domain Layer）

领域层是整个架构的**战略核心**，包含业务领域的全部知识和规则，其设计质量直接决定系统的可维护上限。该层必须完全自包含，不依赖任何外部框架或基础设施，这使得领域逻辑可以独立测试、跨技术栈复用。Dify的领域层通过丰富的模型表达LLM应用编排的复杂性，包括工作流定义、对话状态机、知识库检索策略等核心概念。

领域层的构建块包括：**实体（Entity）**——具有唯一标识和生命周期的业务对象，如`Workflow`、`Conversation`；**值对象（Value Object）**——描述特征的无标识对象，如`ModelConfig`、`PromptTemplate`；**聚合（Aggregate）**——一致性边界，如`Knowledge`聚合包含`Document`、`Segment`等对象；**领域服务（Domain Service）**——封装跨对象或不属于任何对象的领域逻辑；**领域事件（Domain Event）**——表达业务事实，驱动最终一致性。这些模式共同构成表达丰富领域模型的语言，使得复杂规则能够以类型安全、可测试的方式实现。

#### 1.1.4 基础设施层（Infrastructure Layer）

基础设施层为上层提供**技术能力支持**，通过抽象接口与上层交互，确保领域层和应用层不依赖具体技术实现。该层的核心模式是**适配器（Adapter）**——将外部系统协议转换为领域层可理解的接口，以及**仓库实现（Repository Implementation）**——将聚合持久化操作转换为具体数据库访问。Dify的基础设施层展现了高度的插件化设计，模型提供商、向量数据库、对象存储等都通过统一接口接入。

基础设施层的设计关键在于**防御性编程**——对外部系统的故障进行隔离和优雅降级。适配器实现需要处理超时、重试、熔断、限流等横切关注点，将这些能力与业务代码解耦。例如，LLM提供商适配器自动附加指数退避重试、Token用量统计、异常分类转换等功能，上层代码以统一方式调用不同提供商，无需感知实现差异。基础设施层还负责连接池管理、监控埋点、日志增强等技术细节，确保生产环境的可观测性和稳定性。

### 1.2 模块化设计原则

#### 1.2.1 垂直切片模块化（Feature-Based Modularity）

垂直切片模块化是与传统水平分层相对的组织哲学，其核心思想是**按业务功能而非技术层次组织代码**。每个垂直切片包含完成该功能所需的全部组件——控制器、应用服务、领域模型、仓库实现、甚至前端组件——使得功能开发高度内聚，修改的影响范围可控。Dify的模块划分清晰体现了这一原则，`app`、`conversation`、`workflow`、`knowledge`、`model_provider`等模块各自独立，拥有完整的内部层次结构。

| 模块 | 核心职责 | 关键子域 |
|:---|:---|:---|
| `app` | 应用生命周期管理 | 创建、配置、发布、版本控制 |
| `conversation` | 对话会话管理 | 消息历史、上下文维护、多轮状态 |
| `workflow` | 工作流引擎 | 节点编排、执行引擎、状态机持久化 |
| `knowledge` | 知识库管理 | 文档处理、分段策略、向量检索、重排序 |
| `model_provider` | 模型提供商集成 | 统一接口、多提供商适配、用量统计 |
| `embedding` | 嵌入向量服务 | 文本向量化、向量存储、相似度计算 |
| `account` | 账户与租户管理 | 用户认证、租户隔离、权限控制 |
| `billing` | 计费与用量 | 配额管理、用量统计、计费规则引擎 |

模块间的依赖关系通过**显式接口定义**进行管理，禁止循环依赖。这种设计使得团队可以围绕功能模块组织，单个模块的复杂度控制在可理解范围内，也支持微服务架构的渐进式演进——当模块规模和复杂度达到阈值时，可相对容易地拆分为独立服务。垂直切片还支撑功能的热插拔，Dify的插件系统正是建立在这一基础之上。

#### 1.2.2 核心域与支撑域分离

领域驱动设计中的**限界上下文（Bounded Context）**概念指导我们将大型领域划分为若干相对独立的子域，每个子域有自己的统一语言和模型。子域按战略重要性分为**核心域（Core Domain）**、**支撑子域（Supporting Subdomain）**和**通用子域（Generic Subdomain）**，投入的设计资源应当与战略重要性匹配。

Dify的**核心域**无疑是"LLM应用编排"——即如何以灵活、可视化的方式将LLM能力组合成满足特定需求的应用。这一领域包含工作流引擎、提示词工程、RAG（检索增强生成）等关键创新点，是产品差异化竞争力的来源，需要投入最优秀的设计资源，追求模型的深度和精度。核心域的代码享有最高的设计自由度，可以采用最符合领域特点的模式，如工作流的状态机实现、节点的事件驱动编排等。

**支撑子域**包括账户管理、计费系统、通知服务等，这些功能对业务运营必不可少，但不直接贡献于核心价值主张。对于这类子域，可以采用成熟的解决方案或外包开发，内部团队聚焦于集成和定制。Dify的实现中，部分通用功能如邮件发送、短信验证等采用第三方SaaS服务，而非自建。**通用子域**如用户认证、日志记录、监控告警等有成熟开源解决方案，应当直接采用而非重复建设，Dify集成了Prometheus、Grafana、ELK等业界标准工具。

#### 1.2.3 插件化扩展机制

插件化是Dify架构的重要特征，也是其能够快速支持多样化模型提供商、向量数据库、工具集成的基础。插件化设计的核心在于定义**清晰的扩展点（Extension Point）和契约（Contract）**，使得第三方实现可以在不修改核心代码的情况下接入系统。

| 插件类型 | 扩展点接口 | 关键契约 | 隔离机制 |
|:---|:---|:---|:---|
| 模型提供商插件 | `ModelProvider` | 模型列表、聊天完成、文本嵌入、Token计数、能力声明 | 进程级隔离，gRPC/HTTP通信 |
| 工具插件 | `Tool` | 输入参数Schema、输出格式、执行逻辑、配置界面 | 沙箱执行，资源限制 |
| 扩展节点插件 | `WorkflowNode` | 节点类型标识、配置Schema、执行逻辑、输入输出定义 | 进程级隔离 |
| 存储扩展插件 | `VectorStore`/`BlobStorage` | CRUD操作、相似度搜索、批量处理 | 适配器封装 |

插件的生命周期管理包括发现、加载、隔离、卸载等环节。Dify采用**进程级隔离**确保插件故障不会影响核心系统，插件与核心通过gRPC或HTTP进行通信，这种设计牺牲了部分性能换取了稳定性和安全性。插件的权限控制也是关键考量，需要限制插件可访问的资源和操作范围，防止恶意插件造成数据泄露或系统破坏。

### 1.3 可扩展性设计

#### 1.3.1 水平扩展支持

水平扩展是云原生应用的基本要求，Dify的后端架构在多个层面为此提供支持。**无状态服务设计**——应用服务器不维护会话状态，所有用户上下文通过Token传递或从共享存储获取，使得任意请求可路由到任意实例，为负载均衡创造条件。**共享存储架构**——会话数据、缓存、任务队列等状态统一存储于外部服务（Redis、PostgreSQL、消息队列等），应用实例本身无状态，可以任意扩缩容。

数据层面的扩展策略包括：**读写分离**——查询密集型操作路由到只读副本，写入操作指向主库；**数据分片**——对于超大规模数据，采用租户ID或用户ID进行分片，将数据分布到多个数据库实例，Dify支持按租户的数据库级隔离；**缓存分层**——本地缓存（进程内）用于极高频、低延迟的数据，分布式缓存（Redis）用于跨实例共享的数据，CDN用于静态资源，形成多级缓存体系。

#### 1.3.2 多租户架构设计

多租户是SaaS平台的核心架构模式，Dify作为支持自托管和云服务的平台，需要提供灵活的多租户方案。多租户的实现策略在**隔离强度**和**资源效率**之间存在权衡：

| 隔离级别 | 实现方式 | 适用场景 | 资源效率 | 隔离强度 |
|:---|:---|:---|:---|:---|
| 行级隔离 | 行级租户ID过滤，RLS策略强制 | 小型租户、成本敏感 | 最高 | 逻辑隔离 |
| Schema级隔离 | PostgreSQL Schema隔离 | 中型租户、合规要求 | 中等 | 较强 |
| 数据库级隔离 | 每个租户独立数据库实例 | 大型租户、严格合规 | 较低 | 最强 |

Dify的实现支持多种模式的配置，代码层通过**租户上下文（Tenant Context）**统一处理，确保数据访问自动附加租户过滤条件。租户上下文通过请求拦截器提取（从JWT声明或请求头），存储于异步上下文变量，仓库层自动应用过滤。对于需要跨租户操作的管理功能，通过显式的权限提升机制控制，并记录审计日志。

#### 1.3.3 工作流引擎的可编排性

工作流引擎是Dify最具技术复杂度的组件，其可编排性设计直接决定平台能够支持的应用场景广度。**节点类型的可扩展**——系统预置丰富节点类型（LLM调用、知识检索、条件分支、循环迭代、HTTP请求、代码执行等），同时支持自定义节点插件。**连接的可配置**——节点间数据流通过可视化连线定义，支持条件分支（基于上游输出的动态路由）、并行分支（Map-Reduce模式）、循环迭代等复杂控制流。

**执行模式的选择**——工作流支持同步执行（阻塞等待完成）和异步执行（提交后通过回调或轮询获取结果），长时工作流支持断点续传和状态持久化。**版本与发布**——工作流定义支持版本管理，可以草稿、测试、发布，已发布的应用可以绑定特定版本，确保稳定性。工作流引擎的实现采用**状态机模式**，每个执行实例维护当前状态、执行历史、变量上下文，状态持久化采用**事件溯源（Event Sourcing）**模式，完整记录执行过程中的所有事件，支持精确的重放和调试。

## 2. 项目目录结构规范

### 2.1 顶层组织

#### 2.1.1 按业务域划分的一级目录

顶层目录按业务域（限界上下文）进行划分，每个目录对应一个相对独立的业务模块。这种组织方式使得开发者能够快速定位相关代码，也支持团队按模块进行分工。

```
dify/
├── api/                    # 表现层入口，HTTP路由定义
├── core/                   # 共享内核，跨模块的基础能力
├── services/               # 应用服务实现（按模块组织）
│   ├── app_service/
│   ├── conversation_service/
│   ├── workflow_service/
│   ├── knowledge_service/
│   ├── model_provider_service/
│   └── account_service/
├── models/                 # 领域模型定义（ORM实体与领域对象）
├── extensions/             # 扩展插件目录（外部系统适配器）
├── tasks/                  # 异步任务定义（Celery/RQ等）
├── migrations/             # 数据库迁移脚本
├── tests/                  # 测试代码（与源码结构镜像）
└── configs/                # 配置文件（按环境分层）
```

这种结构与纯技术分层的目录组织形成对比，其优势在于：**功能内聚**——修改一个功能涉及的文件集中在同一目录；**依赖清晰**——模块间的导入关系直观反映架构依赖；**演进灵活**——单个模块的重构不会影响全局结构。

#### 2.1.2 共享内核（Shared Kernel）定位

共享内核是多个限界上下文共同依赖的领域概念和实现，其设计需要特别谨慎——过度膨胀会导致耦合，过于精简则会导致重复。Dify的`core`模块承担共享内核的职责，包含：

| 类别 | 内容 | 变更治理 |
|:---|:---|:---|
| 基础类型定义 | 实体基类、值对象基类、领域事件基类、标识符生成器 | 严格审查，版本兼容保证 |
| 通用领域概念 | `TenantId`、`UserId`、`Timestamp`、`Money`、`Quantity` | 扩展优先于修改 |
| 横切关注点实现 | 审计字段混入、软删除支持、乐观锁 | 通过混入类或元类实现复用 |
| 工具函数 | 日期时间处理、字符串处理、验证规则 | 无状态，纯函数优先 |

共享内核的变更需要严格的治理流程，因为任何修改都可能影响多个模块。Dify通过代码审查、集成测试、版本兼容性检查等机制控制共享内核的演进。

#### 2.1.3 外部接口适配器目录

外部接口适配器封装与外部系统的交互，统一组织在`extensions`目录下，按外部系统类型进一步细分：

```
extensions/
├── model_providers/        # LLM/嵌入模型提供商适配器
│   ├── openai/
│   ├── anthropic/
│   ├── azure_openai/
│   └── base/               # 抽象接口定义
├── vector_stores/          # 向量数据库适配器
│   ├── weaviate/
│   ├── qdrant/
│   ├── milvus/
│   └── base/
├── storage/                # 对象存储适配器（S3/MinIO/OSS）
├── message_queue/          # 消息队列适配器
├── cache/                  # 缓存实现（Redis/Memcached）
└── search/                 # 全文搜索引擎适配器
```

每个适配器目录内部保持一致的接口实现结构，包括客户端封装、配置解析、错误转换、重试逻辑等，使得上层代码可以以统一方式使用不同的外部服务。

### 2.2 模块内部结构

#### 2.2.1 领域模型子目录

领域模型是模块的核心资产，其内部组织反映领域驱动设计的战术模式：

```
models/
├── entities/               # 实体定义
│   ├── __init__.py
│   ├── app.py              # 应用实体（聚合根）
│   └── app_version.py      # 应用版本实体
├── value_objects/          # 值对象定义
│   ├── __init__.py
│   ├── model_config.py
│   ├── prompt_template.py
│   └── retrieval_parameters.py
├── aggregates/             # 聚合根显式组织（可选）
│   └── knowledge_aggregate.py
└── events/                 # 领域事件定义
    ├── __init__.py
    ├── app_events.py
    └── conversation_events.py
```

实体文件包含类的定义、领域方法、不变式验证、工厂方法等。值对象强调不可变性，通常使用`@dataclass(frozen=True)`实现。领域事件与实体紧密相关，但独立组织便于事件订阅者的发现。

#### 2.2.2 应用服务子目录

应用服务层协调领域对象完成用例，其组织方式反映用例结构：

```
services/
├── app_service.py          # 应用服务类（主要用例）
├── dto/                    # 数据传输对象
│   ├── __init__.py
│   ├── requests/           # 请求DTO（输入验证）
│   │   ├── create_app_request.py
│   │   └── update_app_request.py
│   └── responses/          # 响应DTO（输出序列化）
│       ├── app_response.py
│       └── app_list_response.py
└── use_cases/              # 复杂用例的独立封装
    ├── publish_app.py
    ├── fork_app.py
    └── migrate_app_version.py
```

DTO的分离组织使得输入输出契约清晰可见，也便于自动生成API文档。对于特别复杂的用例，可以独立封装为Use Case类，保持应用服务的简洁。

#### 2.2.3 基础设施子目录

基础设施实现与领域层接口的对接：

```
infrastructure/
├── repositories/           # 仓库实现
│   ├── __init__.py
│   ├── app_repository.py
│   └── sqla_repository.py  # SQLAlchemy基类（如使用）
├── external_services/      # 外部服务调用封装
│   └── ...
└── persistence/            # 持久化配置
    ├── __init__.py
    ├── database.py         # 数据库连接、会话管理
    └── unit_of_work.py     # 工作单元实现
```

仓库实现遵循**接口与实现分离**原则，领域层定义`IAppRepository`接口，基础设施层提供具体实现，依赖注入框架在运行时组装。

### 2.3 横切关注点组织

#### 2.3.1 配置管理集中化

配置按环境和用途分层管理，避免分散在代码各处：

| 配置文件 | 用途 | 加载优先级 |
|:---|:---|:---|
| `default.py` | 默认配置（全环境适用） | 最低 |
| `development.py` | 开发环境覆盖 | 中 |
| `testing.py` | 测试环境覆盖 | 中 |
| `production.py` | 生产环境覆盖 | 高 |
| `secrets/` | 敏感配置（加密或环境变量注入） | 最高（运行时） |

配置类采用Pydantic Settings或类似库实现，提供类型安全、验证、环境变量映射等功能。敏感配置（密码、密钥）绝不提交到版本控制，通过环境变量或密钥管理服务注入。

#### 2.3.2 中间件与拦截器目录

HTTP中间件、AOP拦截器等横切机制统一组织：

```
middleware/
├── __init__.py
├── authentication.py       # 认证中间件（JWT/API Key解析）
├── tenant_context.py       # 租户上下文提取
├── rate_limiting.py        # 限流中间件
├── request_logging.py      # 请求日志（结构化）
├── error_handling.py       # 全局异常处理（转换为标准响应）
└── cors_security.py        # CORS与安全头
```

中间件的顺序影响行为，推荐顺序为：错误处理 → 日志 → 限流 → 认证 → 租户上下文 → 业务处理。

#### 2.3.3 迁移与种子数据管理

数据库迁移采用版本化工具（如Alembic），迁移脚本组织为：

```
migrations/
├── versions/               # 版本化迁移脚本
│   ├── 001_initial_schema.py
│   ├── 002_add_workflow_support.py
│   └── ...
├── seeders/                # 种子数据（开发/测试环境）
│   ├── default_tenant.py
│   └── sample_apps.py
└── scripts/                # 数据修复脚本（一次性）
    └── fix_orphaned_segments.py
```

迁移脚本命名包含序号和描述，确保执行顺序。每个迁移应当是原子的、可回滚的（如可能），并在测试环境验证后再应用到生产。

## 3. 领域驱动设计（DDD）实践

### 3.1 实体设计规范

#### 3.1.1 实体标识策略

实体标识的选择需要综合考虑**全局唯一性**、**排序特性**、**隐私保护**等因素：

| 策略 | 实现 | 适用场景 | 特点 |
|:---|:---|:---|:---|
| UUID v7 | 时间排序UUID | 默认选择 | 去中心化生成，数据库索引友好 |
| 雪花ID | 64位整数（时间戳+机器ID+序列号） | 高并发、需排序场景 | 每秒数百万生成速率，天然有序 |
| 语义标识 | 业务编码+序列号 | 需要可读性的场景 | 含业务信息，需协调生成 |

**标识封装**是重要实践——实体标识不直接使用原始类型，而是封装为值对象：

```python
# 推荐：类型安全的标识封装
@dataclass(frozen=True)
class AppId:
    value: str  # 内部存储为UUID字符串或雪花ID
    
    def __post_init__(self):
        validate_uuid(self.value)

# 使用
def get_app(app_id: AppId) -> Optional[App]: ...  # 类型安全
def get_app(app_id: str) -> Optional[App]: ...    # 易混淆不同实体ID
```

标识生成遵循**"尽早生成"原则**，在实体创建时即分配，而非依赖数据库插入后的自增值，这使得领域事件、关联对象可以在事务提交前确定标识。

#### 3.1.2 实体生命周期管理

实体的生命周期阶段有明确的业务含义和状态约束：

| 阶段 | 触发方式 | 关键行为 | 事件 |
|:---|:---|:---|:---|
| 创建 | 工厂方法`Entity.create()` | 验证必需属性，不变式检查，分配标识 | `EntityCreatedEvent` |
| 激活 | 领域方法如`publish()`、`enable()` | 状态变更，业务规则验证 | 状态特定事件 |
| 变更 | 领域方法修改属性 | 保持封装，验证新状态 | `EntityUpdatedEvent` |
| 归档 | `archive()`方法 | 标记归档状态，限制操作 | `EntityArchivedEvent` |
| 删除 | `delete()`软删除 | 设置`deleted_at`，级联清理 | `EntityDeletedEvent` |

**创建阶段**通过工厂方法确保有效创建，禁止直接使用`__init__`创建不完整实体。**状态变更**通过领域方法显式表达业务意图，方法命名反映业务操作而非技术操作，状态变更可能触发领域事件。**软删除与归档**通过状态标记实现，支持数据恢复和审计追溯，删除操作触发级联清理的订阅逻辑。

#### 3.1.3 领域事件发布机制

领域事件用于表达领域内发生的具有业务意义的事实，是实现松耦合、最终一致性的关键机制。

| 方面 | 设计决策 |
|:---|:---|
| 事件定义 | 值对象，过去时态命名，包含事件发生时间、涉及实体标识、相关属性 |
| 事件累积 | 实体通过`add_event()`方法累积事件，存储于内部列表 |
| 发布时机 | 事务提交时统一发布，确保"数据已存，事件才发" |
| 分发模式 | 同步处理器（同一事务）用于强一致性；异步处理器（消息队列）用于可容忍延迟场景 |
| 事件持久化 | 关键事件追加写入事件存储，支持审计、重放、调试 |

事件结构示例：

```python
@dataclass(frozen=True)
class MessageCompletedEvent(DomainEvent):
    conversation_id: ConversationId
    message_id: MessageId
    app_id: AppId
    model_provider: str
    model_name: str
    input_tokens: int
    output_tokens: int
    latency_ms: int
    completed_at: datetime
    # 不包含敏感内容，仅元数据
```

### 3.2 值对象设计

#### 3.2.1 不可变性保证

不可变性是值对象的核心特征，确保**线程安全**、**可自由共享**、**无副作用**。Python中通过以下机制实现：

- `@dataclass(frozen=True)`：冻结数据类，实例创建后不可修改
- 属性私有化，不提供setter
- 修改操作返回新实例（函数式更新）

```python
@dataclass(frozen=True)
class ModelConfig:
    provider: str
    model: str
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    
    def with_temperature(self, value: float) -> "ModelConfig":
        """创建温度参数变更后的新配置"""
        return replace(self, temperature=clamp(value, 0.0, 2.0))
    
    def validate(self) -> None:
        """验证配置有效性，失败时抛出DomainException"""
        if self.temperature < 0 or self.temperature > 2:
            raise InvalidConfigError("temperature out of range")
```

#### 3.2.2 相等性判定规则

值对象的相等性基于**属性值**，而非标识或内存地址：

| 场景 | 实现方式 |
|:---|:---|
| 标准相等 | `__eq__`比较所有显著属性 |
| 哈希支持 | `__hash__`基于相同属性，确保可放入集合/作为字典键 |
| 近似相等 | 浮点数比较使用容差，提供`approx_equals()`方法 |
| 业务相等 | 某些场景下特定子集属性决定相等（如同一地址的不同格式） |

#### 3.2.3 值对象组合模式

复杂值对象通过组合简单值对象构建，形成层次化的值对象图：

```python
@dataclass(frozen=True)
class RetrievalConfig:
    """检索配置，组合多个值对象"""
    search_method: SearchMethod           # 枚举值对象
    top_k: PositiveInt                    # 约束类型
    score_threshold: ScoreThreshold       # 范围约束类型
    reranking: Optional[RerankingConfig] = None  # 嵌套值对象
    
    def validate(self) -> None:
        # 组合验证，各组成部分自验证
        self.search_method.validate()
        self.top_k.validate()
        if self.reranking:
            self.reranking.validate()
        # 跨字段验证
        if self.search_method == SearchMethod.HYBRID and not self.reranking:
            warnings.warn("Hybrid search without reranking may produce suboptimal results")
```

### 3.3 聚合根设计

#### 3.3.1 聚合边界划定原则

聚合边界的划定是DDD设计的关键决策，影响**性能**、**一致性**和**并发控制**：

| 原则 | 说明 | Dify示例 |
|:---|:---|:---|
| 业务不变式 | 包含维护关键不变式所需的所有对象 | Knowledge聚合包含Document、Segment、Embedding，确保"文档删除时关联数据同步清理" |
| 事务边界 | 单个事务只修改一个聚合 | 工作流执行中，每个节点状态变更在独立事务，跨节点一致性通过Saga协调 |
| 加载性能 | 避免过大聚合，大集合采用延迟加载或独立聚合 | 知识库的数万分段不作为聚合内集合，而是独立聚合通过ID引用 |
| 并发控制 | 聚合根负责乐观锁管理 | 版本号字段，更新时验证，冲突时重试或报错 |

#### 3.3.2 聚合内一致性维护

聚合内部对象的生命周期由聚合根统一管理，**外部不得直接引用内部对象**：

```python
class Knowledge(BaseAggregateRoot):
    # 外部可见：通过聚合根方法操作
    def add_document(self, name: str, content: bytes, config: ProcessingConfig) -> DocumentId:
        document = Document.create(...)  # 内部创建
        segments = self._segmenter.segment(content, config)  # 内部处理
        for segment in segments:
            document.add_segment(segment)  # 内部关联
        self._documents[document.id] = document
        self._pending_embeddings.extend(document.pending_segments)
        self.add_event(DocumentAddedEvent(document_id=document.id))
        return document.id  # 仅返回标识
    
    def remove_document(self, document_id: DocumentId) -> None:
        # 级联清理，确保不变式
        document = self._documents.pop(document_id)  # 内部访问
        self._embedding_queue.cancel_pending(document.segment_ids)
        self._vector_store.delete_vectors(document.vector_ids)
        self.add_event(DocumentRemovedEvent(document_id=document_id))
```

#### 3.3.3 跨聚合引用规范

聚合间**通过标识引用**，而非直接对象引用：

| 方式 | 代码示例 | 适用场景 |
|:---|:---|:---|
| 标识引用（推荐） | `app_id: AppId` | 默认方式，确保聚合独立加载 |
| 标识集合 | `knowledge_ids: List[KnowledgeId]` | 多对多关联 |
| 限定引用 | `creator_id: UserId` | 需要知道关联但无需加载完整对象 |

需要关联对象数据时，通过**仓库查询**获取，应用服务负责协调多个聚合的加载和操作，避免N+1查询问题。

### 3.4 领域服务

#### 3.4.1 领域服务与应用服务区分

| 维度 | 领域服务 | 应用服务 |
|:---|:---|:---|
| 职责 | 封装领域规则，执行业务计算 | 协调用例流程，管理事务边界 |
| 依赖 | 仅依赖领域层对象 | 可依赖领域层、仓库、外部服务 |
| 状态 | 无状态 | 无状态 |
| 命名 | 动词+名词，表达业务操作（`PricingCalculator`） | 用例名称，表达用户意图（`CreateOrderUseCase`） |
| 典型示例 | 对话路由、提示词组装、费用计算 | 创建对话、执行工作流、导入文档 |

#### 3.4.2 复杂业务逻辑封装

Dify中的典型领域服务：

**对话路由服务（ConversationRoutingService）**：根据用户输入、历史上下文、可用模型、成本约束等因素，选择最优的模型和参数配置。涉及多维度评分、A/B测试、降级策略等复杂逻辑。

**提示词组装服务（PromptAssemblyService）**：将系统提示、上下文消息、检索结果、工具定义等组装为模型特定的消息格式，处理Token截断、格式转换等细节。

**费用计算服务（UsageCalculator）**：根据模型调用量、Token消耗、存储用量等计算费用，支持多种计费模型（按量、包月、阶梯定价）。

#### 3.4.3 领域服务无状态设计

领域服务应当是无状态的，所有输入通过参数传递，不维护会话信息。需要"记忆"的信息应存储于**实体**或**外部持久化**，而非服务实例变量。这使得领域服务线程安全，可自由共享和测试。

## 4. 数据模型与持久化规范

### 4.1 数据库设计原则

#### 4.1.1 多租户数据隔离策略

| 隔离级别 | 实现方式 | 资源效率 | 隔离强度 | 运维复杂度 | 适用场景 |
|:---|:---|:---|:---|:---|:---|
| 行级隔离 | `tenant_id`列+查询过滤，RLS策略强制 | 最高 | 逻辑隔离 | 低 | 中小租户，成本敏感 |
| Schema级隔离 | PostgreSQL Schema隔离，动态切换 | 中等 | 较强 | 中等 | 中型租户，合规要求 |
| 数据库级隔离 | 独立数据库实例 | 较低 | 最强 | 高 | 大型租户，严格合规 |

实现要点：行级隔离下，所有租户相关表包含`tenant_id`列，查询构建器自动附加过滤条件；Schema级隔离需要连接池支持动态Schema切换；数据库级隔离通过配置路由实现。

#### 4.1.2 软删除与数据审计

| 机制 | 实现 | 用途 |
|:---|:---|:---|
| 软删除 | `deleted_at`时间戳，查询自动过滤 | 数据恢复，审计追溯，关联完整性 |
| 审计字段 | `created_at`, `updated_at`, `created_by`, `updated_by` | 操作追溯，合规要求 |
| 审计日志表 | 敏感操作记录完整快照 | 安全审计，争议处理 |
| 版本历史 | 关键实体变更历史表 | 数据恢复，变更分析 |

唯一索引设计需包含`deleted_at`，允许"删除后重建同名"： `CREATE UNIQUE INDEX idx_app_name ON app(tenant_id, name, deleted_at);`

#### 4.1.3 索引与查询优化预留

| 查询类型 | 索引策略 | 示例 |
|:---|:---|:---|
| 等值查询 | B-tree索引 | `WHERE tenant_id = ? AND status = ?` |
| 范围查询 | B-tree索引，注意列顺序 | `WHERE created_at > ?` |
| 全文搜索 | 专用全文索引或外部搜索引擎 | 知识库内容搜索 |
| 向量相似度 | 向量数据库（HNSW等ANN索引） | 语义检索 |
| JSON字段查询 | GIN索引（PostgreSQL） | 动态配置存储 |

预留优化空间：避免`SELECT *`，明确指定所需列；大表分区设计（按时间或租户）；查询复杂度监控，慢查询自动告警。

### 4.2 ORM抽象与仓库模式

#### 4.2.1 仓库接口定义

仓库接口定义于**领域层**，表达聚合的持久化需求，不涉及具体技术：

```python
class IAppRepository(ABC):
    @abstractmethod
    def get_by_id(self, id: AppId) -> Optional[App]: ...
    
    @abstractmethod
    def get_by_tenant_and_name(self, tenant_id: TenantId, name: str) -> Optional[App]: ...
    
    @abstractmethod
    def list_by_tenant(
        self, tenant_id: TenantId, filters: AppFilters, pagination: Pagination
    ) -> Tuple[List[App], int]: ...  # 返回(数据, 总数)
    
    @abstractmethod
    def save(self, app: App) -> None: ...  # 创建或更新
    
    @abstractmethod
    def delete(self, id: AppId) -> None: ...  # 软删除
```

#### 4.2.2 仓库实现与框架解耦

仓库实现位于**基础设施层**，关键设计：**ORM实体与领域模型分离**，通过显式**映射器（Mapper）**转换；仓库负责**领域事件的发布**，确保事件与持久化同步。

```python
class SqlaAppRepository(IAppRepository):
    def __init__(self, session: Session, event_bus: IEventBus):
        self._session = session
        self._event_bus = event_bus
        self._mapper = AppMapper()
    
    def save(self, app: App) -> None:
        orm_obj = self._mapper.to_orm(app)
        self._session.merge(orm_obj)
        # 事务提交后发布事件
        for event in app.collect_events():
            self._event_bus.publish(event)
```

#### 4.2.3 规约模式（Specification Pattern）查询

复杂查询条件通过规约对象封装，支持组合和复用：

```python
@dataclass
class AppFilters:
    status: Optional[AppStatus] = None
    mode: Optional[AppMode] = None
    created_after: Optional[datetime] = None
    search_keyword: Optional[str] = None

def list_by_tenant(...) -> Tuple[List[App], int]:
    query = self._base_query().filter(AppORM.tenant_id == tenant_id.value)
    
    # 动态应用过滤条件
    conditions = []
    if filters.status:
        conditions.append(AppORM.status == filters.status.value)
    if filters.search_keyword:
        conditions.append(AppORM.name.ilike(f"%{filters.search_keyword}%"))
    # ...
    
    query = query.filter(and_(*conditions))
    # 分页执行...
```

### 4.3 数据迁移策略

#### 4.3.1 版本化迁移管理

- 每个迁移有唯一序号和时间戳
- 包含`upgrade()`和`downgrade()`方法
- CI/CD流水线自动执行，支持回滚
- 生产环境迁移需审批，低峰期执行

#### 4.3.2 向后兼容的Schema变更

| 变更类型 | 兼容性 | 策略 |
|:---|:---|:---|
| 添加可空列 | 兼容 | 直接执行 |
| 添加非空列 | 不兼容 | 先添加可空→填充默认值→改为非空 |
| 删除列 | 不兼容 | 先停写→确认无读→删除 |
| 重命名列 | 不兼容 | 添加新列→双写→迁移数据→切换读→删除旧列 |
| 添加索引 | 兼容（PostgreSQL并发） | `CREATE INDEX CONCURRENTLY` |

#### 4.3.3 数据迁移与代码部署协调

复杂变更的**四阶段部署**：
1. **扩展期**：部署新代码，支持新旧Schema双写
2. **迁移期**：执行数据迁移，旧格式转新格式
3. **验证期**：验证数据一致性，监控错误率
4. **收缩期**：部署新代码，停止旧Schema支持，清理迁移代码

### 4.4 缓存设计

#### 4.4.1 多级缓存策略

| 层级 | 技术 | 数据特征 | 一致性策略 |
|:---|:---|:---|:---|
| L1 本地缓存 | 进程内（如cachetools） | 极高频、低延迟、小数据量 | TTL过期，不保证集群一致 |
| L2 分布式缓存 | Redis | 跨实例共享、中等频率 | 主动失效+TTL兜底 |
| L3 全文/向量 | 专用引擎（Elasticsearch/Milvus） | 复杂查询、相似度计算 | 近实时同步，事件驱动更新 |
| CDN | 边缘节点 | 静态资源、公开数据 | 版本化URL，长期缓存 |

#### 4.4.2 缓存一致性保证

| 场景 | 策略 |
|:---|:---|
| 读多写少 | Cache-Aside：读时回源，写时失效 |
| 写后立即读 | 写入缓存+数据库，或短暂容忍不一致 |
| 强一致性要求 | 禁用缓存，或采用Read-Through+写锁 |
| 分布式环境 | 消息广播失效，或Redis Pub/Sub |

#### 4.4.3 缓存穿透与雪崩防护

| 问题 | 防护措施 |
|:---|:---|
| 缓存穿透 | 布隆过滤器拦截不存在Key；空值缓存短暂TTL |
| 缓存击穿 | 热点Key永不过期，或互斥锁重建 |
| 缓存雪崩 | 随机TTL偏移；熔断降级；多级缓存 |
| 大Key问题 | 拆分Hash结构；压缩；异步加载 |

## 5. API设计规范

### 5.1 RESTful API设计

#### 5.1.1 资源命名与URI结构

| 规则 | 正确示例 | 错误示例 |
|:---|:---|:---|
| 名词复数表示集合 | `/apps`, `/conversations` | `/getApps`, `/app/list` |
| 嵌套表示从属关系 | `/apps/{id}/versions` | `/appVersions?appId={id}` |
| 避免过深嵌套 | `/knowledge/{id}/documents` | `/knowledge/{id}/documents/{docId}/segments/{segId}/embeddings` |
| 使用连字符分隔 | `/model-providers` | `/modelProviders`, `/model_providers` |
| 小写字母 | `/workflow-executions` | `/WorkflowExecutions` |

#### 5.1.2 HTTP方法语义化使用

| 方法 | 用途 | 幂等性 | 示例 |
|:---|:---|:---|:---|
| GET | 获取资源 | 是 | `GET /apps/{id}` |
| POST | 创建资源 | 否 | `POST /apps` |
| PUT | 完整更新 | 是 | `PUT /apps/{id}` |
| PATCH | 部分更新 | 否（通常） | `PATCH /apps/{id}` |
| DELETE | 删除资源 | 是 | `DELETE /apps/{id}` |

#### 5.1.3 状态码精确返回

| 状态码 | 场景 | 说明 |
|:---|:---|:---|
| 200 OK | 成功，有响应体 | 标准成功响应 |
| 201 Created | 创建成功 | 响应包含`Location`头或完整资源 |
| 204 No Content | 成功，无响应体 | 删除成功，或更新无需返回 |
| 400 Bad Request | 请求格式错误 | 客户端语法错误 |
| 401 Unauthorized | 认证失败 | 缺少或无效凭证 |
| 403 Forbidden | 权限不足 | 已认证但无权限 |
| 404 Not Found | 资源不存在 | 或无权访问（安全模糊） |
| 409 Conflict | 资源冲突 | 如名称已存在 |
| 422 Unprocessable Entity | 验证失败 | 请求格式正确但内容无效 |
| 429 Too Many Requests | 限流触发 | 包含`Retry-After`头 |
| 500 Internal Server Error | 服务器错误 | 非预期异常，需监控告警 |

#### 5.1.4 分页、过滤、排序标准化

```
GET /apps?page=1&limit=20&status=published&sort=-created_at,name

响应：
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

| 参数 | 说明 |
|:---|:---|
| `page`/`offset` | 页码（从1开始）或偏移量 |
| `limit`/`size` | 每页数量，默认20，最大100 |
| `sort` | 逗号分隔，`-`前缀降序 |
| 过滤字段 | 直接作为查询参数，如`status=published` |

### 5.2 响应体结构规范

#### 5.2.1 统一响应信封格式

```json
// 成功响应
{
  "code": "success",
  "data": { ... },  // 或数组
  "meta": {         // 可选元数据
    "request_id": "req_xxx",
    "timestamp": "2024-01-15T08:30:00Z"
  }
}

// 错误响应
{
  "code": "app_name_exists",  // 机器可读错误码
  "message": "应用名称已存在",  // 用户友好消息
  "details": {                 // 可选详细信息
    "field": "name",
    "suggestion": "请使用其他名称"
  },
  "request_id": "req_xxx"      // 用于问题追踪
}
```

#### 5.2.2 错误信息结构化

| 字段 | 用途 | 示例 |
|:---|:---|:---|
| `code` | 机器识别，国际化键 | `invalid_api_key`, `quota_exceeded` |
| `message` | 用户直接阅读 | "API密钥无效，请检查配置" |
| `details` | 程序化处理，如字段级错误 | `{"field": "temperature", "constraint": "0-2"}` |
| `help_url` | 文档链接 | `https://docs.example.com/errors/invalid_api_key` |

#### 5.2.3 超媒体链接支持（HATEOAS可选）

对于需要导航的API，响应包含相关操作链接：

```json
{
  "data": {
    "id": "app_xxx",
    "name": "客服助手",
    "status": "draft",
    "_links": {
      "self": { "href": "/apps/app_xxx" },
      "publish": { "href": "/apps/app_xxx/publish", "method": "POST" },
      "versions": { "href": "/apps/app_xxx/versions" }
    }
  }
}
```

### 5.3 版本控制策略

#### 5.3.1 URI版本 vs Header版本

| 方式 | 示例 | 适用场景 |
|:---|:---|:---|
| URI路径 | `/v1/apps`, `/v2/apps` | 默认推荐，直观可见，易于缓存 |
| 请求头 | `Accept: application/vnd.example.v2+json` | API演进频繁，需要细粒度协商 |
| 查询参数 | `/apps?api-version=2` | 简单场景，调试方便 |

Dify采用**URI路径版本**作为主要方式，确保版本明确可见，支持不同版本的并行文档和测试。

#### 5.3.2 版本兼容性保证

| 变更类型 | 兼容性 | 处理方式 |
|:---|:---|:---|
| 添加可选字段 | 兼容 | 直接添加 |
| 添加必填字段 | 不兼容 | 新版本，或默认值 |
| 删除字段 | 不兼容 | 标记弃用，保留至少一个主版本周期 |
| 修改字段类型 | 不兼容 | 新版本 |
| 修改枚举值 | 视情况 | 添加值兼容，删除值不兼容 |

#### 5.3.3 弃用与Sunset机制

- 弃用字段/端点在文档中明确标记`@deprecated`
- 响应头包含`Deprecation: true`和`Sunset: <date>`
- 提前至少6个月通知，提供迁移指南
- 监控弃用功能的使用率，主动通知用户

### 5.4 异步操作与长轮询

#### 5.4.1 202 Accepted模式

对于耗时操作，立即返回202，提供状态查询端点：

```http
POST /workflow-executions
→ 202 Accepted
Location: /workflow-executions/exec_xxx
{
  "id": "exec_xxx",
  "status": "pending",
  "_links": {
    "status": { "href": "/workflow-executions/exec_xxx" }
  }
}
```

#### 5.4.2 任务状态查询端点

```http
GET /workflow-executions/exec_xxx
→ 200 OK
{
  "id": "exec_xxx",
  "status": "running",  // pending/running/completed/failed/cancelled
  "progress": 45,       // 可选进度百分比
  "started_at": "...",
  "estimated_completion": "...",
  "result": null,       // 完成后填充
  "error": null         // 失败时填充
}
```

#### 5.4.3 Server-Sent Events推送

LLM流式输出场景使用SSE，规范要求：

| 方面 | 规范 |
|:---|:---|
| Content-Type | `text/event-stream` |
| 事件格式 | `event: <type>\ndata: <json>\n\n` |
| 事件类型 | `message.delta`（增量内容）, `message.complete`, `error`, `done` |
| 连接管理 | 客户端断开时服务端检测并停止生成，避免资源浪费 |
| 重连支持 | Last-Event-ID头支持断点续传 |

## 6. 认证与授权规范

### 6.1 身份认证机制

#### 6.1.1 JWT Token设计（Access/Refresh分离）

| Token类型 | 有效期 | 用途 | 存储位置 |
|:---|:---|:---|:---|
| Access Token | 15分钟-2小时 | API访问 | 内存，请求头携带 |
| Refresh Token | 7-30天 | 获取新Access Token | HttpOnly Cookie或安全存储 |

JWT声明标准字段：
- `sub`: 用户标识
- `tenant_id`: 租户标识（多租户必需）
- `scope`: 权限范围
- `iat`, `exp`: 签发与过期时间
- `jti`: Token唯一标识（用于撤销）

#### 6.1.2 API Key认证支持

| 场景 | 传递方式 | 格式 |
|:---|:---|:---|
| 服务端调用 | Authorization头 | `Authorization: Bearer {api_key}` |
| 简单场景 | 查询参数 | `?api_key=xxx`（仅GET，避免日志泄露） |
| Webhook | 自定义头或签名 | `X-API-Key`或HMAC签名 |

API Key设计：前缀标识类型（`sk-`密钥，`pk-`公钥），后续随机部分，数据库存储哈希值。

#### 6.1.3 OAuth2/OIDC集成点

- 支持标准授权码流程
- 可配置多个身份提供商（IdP）
- 用户关联：邮箱匹配或显式绑定
- 组/角色映射：从IdP同步到本系统RBAC

### 6.2 权限控制模型

#### 6.2.1 RBAC基础模型

| 实体 | 说明 |
|:---|:---|
| 用户（User） | 系统登录主体 |
| 角色（Role） | 权限集合，如`admin`, `developer`, `viewer` |
| 权限（Permission） | 细粒度操作，如`app:read`, `app:write`, `knowledge:delete` |
| 租户角色 | 用户在特定租户内的角色，支持跨租户不同权限 |

#### 6.2.2 资源级权限校验

```python
# 装饰器方式
@require_permission("app:write")
@require_resource_owner(App, "app_id")  # 或显式校验
def update_app(app_id: AppId, ...): ...

# 策略引擎方式（复杂场景）
if not policy_engine.evaluate(
    user=context.user,
    action="execute",
    resource=workflow,
    context={"ip": request.client_ip, "time": now()}
):
    raise ForbiddenError()
```

#### 6.2.3 动态权限与策略引擎集成

支持基于属性的访问控制（ABAC）：
- 时间限制：仅工作时间可访问
- 位置限制：仅公司IP可访问敏感操作
- 用量限制：超出配额禁止创建新资源

### 6.3 多租户安全隔离

#### 6.3.1 租户上下文传递

| 层级 | 传递方式 |
|:---|:---|
| HTTP请求 | 头`X-Tenant-ID`或JWT声明 |
| 服务间调用 | 上下文传播（OpenTelemetry Baggage或自定义） |
| 异步任务 | 任务消息包含租户ID，执行时恢复上下文 |
| 数据库查询 | 自动附加`WHERE tenant_id = ?` |

#### 6.3.2 跨租户访问防护

- **强制过滤**：所有租户相关查询必须通过租户ID过滤
- **禁止绕过**：ORM外禁止直接SQL，防止遗漏过滤
- **白名单机制**：跨租户操作（如平台管理）需显式声明，记录审计日志
- **测试覆盖**：集成测试验证租户隔离，尝试跨租户访问应失败

#### 6.3.3 数据可见性控制

| 场景 | 控制机制 |
|:---|:---|
| 同一租户内用户 | RBAC控制 |
| 租户间共享 | 显式邀请/授权机制，记录授权关系 |
| 公开资源 | 标记`is_public`，查询时特殊处理 |
| 匿名访问 | 仅允许特定公开端点，严格限制 |

## 7. 错误处理与日志规范

### 7.1 异常体系设计

#### 7.1.1 领域异常 vs 应用异常 vs 系统异常

| 类型 | 定义 | 处理方式 | 用户可见性 |
|:---|:---|:---|:---|
| **领域异常（DomainException）** | 违反业务规则 | 转换为422/409，包含具体错误码 | 是，友好消息 |
| **应用异常（ApplicationException）** | 用例执行失败，如资源未找到 | 转换为404/403等 | 是，适当信息 |
| **系统异常（SystemException）** | 基础设施故障，如数据库连接失败 | 转换为500，记录详细日志 | 否，通用消息 |
| **安全异常（SecurityException）** | 认证授权失败 | 转换为401/403，模糊处理 | 有限信息 |

#### 7.1.2 异常层次结构定义

```
BaseException (Python内置)
└── AppException (应用基础)
    ├── DomainException (领域层)
    │   ├── ValidationError (验证失败)
    │   ├── BusinessRuleViolation (业务规则)
    │   └── InsufficientQuota (配额不足)
    ├── ApplicationException (应用层)
    │   ├── ResourceNotFound (资源不存在)
    │   ├── PermissionDenied (权限不足)
    │   └── ConcurrentModification (并发冲突)
    ├── InfrastructureException (基础设施层)
    │   ├── DatabaseError (数据库错误)
    │   ├── ExternalServiceError (外部服务)
    │   └── CacheError (缓存错误)
    └── SecurityException (安全层)
        ├── AuthenticationError (认证失败)
        └── AuthorizationError (授权失败)
```

#### 7.1.3 异常转换与边界处理

| 边界 | 转换规则 |
|:---|:---|
| 领域层→应用层 | 领域异常直接传递，应用服务可包装添加上下文 |
| 应用层→表现层 | 统一异常处理器转换，映射到HTTP状态码 |
| 基础设施→应用层 | 技术异常包装为基础设施异常，避免泄露细节 |
| 异步任务 | 异常序列化到任务结果，支持重试或死信队列 |

### 7.2 错误响应标准化

#### 7.2.1 错误码设计规范

| 类别 | 格式 | 示例 |
|:---|:---|:---|
| 系统级错误 | `sys_xxx` | `sys_database_error`, `sys_rate_limited` |
| 业务通用错误 | `biz_xxx` | `biz_validation_failed`, `biz_resource_not_found` |
| 领域特定错误 | `{domain}_xxx` | `app_name_exists`, `workflow_invalid_node` |
| 认证授权错误 | `auth_xxx` | `auth_token_expired`, `auth_insufficient_scope` |

#### 7.2.2 用户友好错误消息

- 直接说明问题，避免技术术语
- 提供解决建议
- 支持国际化（i18n键）
- 敏感信息脱敏（如数据库连接字符串）

#### 7.2.3 调试信息分级暴露

| 环境 | 暴露内容 |
|:---|:---|
| 开发环境 | 完整堆栈、内部状态、SQL语句 |
| 测试环境 | 简化堆栈、错误位置、请求ID |
| 生产环境 | 仅请求ID，详细日志记录到系统 |

### 7.3 日志记录策略

#### 7.3.1 结构化日志格式（JSON）

```json
{
  "timestamp": "2024-01-15T08:30:00.123Z",
  "level": "INFO",
  "logger": "app.services.conversation",
  "message": "Conversation created",
  "request_id": "req_xxx",
  "trace_id": "trace_xxx",
  "span_id": "span_xxx",
  "tenant_id": "ten_xxx",
  "user_id": "usr_xxx",
  "event": "conversation_created",
  "conversation_id": "conv_xxx",
  "duration_ms": 45,
  "context": {
    "app_id": "app_xxx",
    "model_provider": "openai"
  }
}
```

#### 7.3.2 日志级别使用准则

| 级别 | 使用场景 | 示例 |
|:---|:---|:---|
| DEBUG | 开发调试，详细执行流程 | 函数入参、SQL语句、缓存命中 |
| INFO | 正常业务流程关键节点 | 请求处理完成、资源创建、任务完成 |
| WARNING | 非预期但可恢复的情况 | 重试触发、降级发生、慢查询 |
| ERROR | 功能失败，需要关注 | 请求处理失败、外部服务错误 |
| CRITICAL | 系统级故障，需要立即响应 | 数据库连接池耗尽、核心服务不可用 |

#### 7.3.3 敏感信息脱敏

| 类型 | 脱敏规则 |
|:---|:---|
| 密码、密钥 | 完全替换为`***`或`[REDACTED]` |
| Token | 保留前4后4，中间替换 |
| 身份证号 | 保留前3后4 |
| 手机号 | 保留前3后4 |
| 邮箱 | 保留域名，用户名部分替换 |
| 银行卡 | 保留后4位 |

#### 7.3.4 分布式追踪上下文注入

- 使用OpenTelemetry标准
- 请求入口生成或继承Trace ID
- 所有日志包含trace_id, span_id
- 跨服务调用传播上下文
- 异步任务恢复上下文

### 7.4 可观测性集成

#### 7.4.1 指标（Metrics）暴露规范

| 类别 | 指标示例 | 类型 |
|:---|:---|:---|
| 请求指标 | `http_requests_total`, `http_request_duration_seconds` | Counter, Histogram |
| 业务指标 | `conversations_created_total`, `messages_generated_total` | Counter |
| 资源指标 | `active_connections`, `queue_depth` | Gauge |
| 外部服务 | `llm_requests_total`, `llm_latency_seconds` | Counter, Histogram |
| 错误指标 | `errors_total{type="domain\|system"}` | Counter |

暴露方式：Prometheus `/metrics`端点，或OpenTelemetry协议。

#### 7.4.2 健康检查端点设计

| 端点 | 用途 | 检查内容 |
|:---|:---|:---|
| `GET /health/live` | 存活探针（Kubernetes） | 进程运行，快速返回200 |
| `GET /health/ready` | 就绪探针 | 数据库连接、缓存可用、关键依赖健康 |
| `GET /health/deep` | 深度检查（监控） | 全依赖检查，可能较慢，用于诊断 |

#### 7.4.3 链路追踪埋点

| 位置 | 操作 |
|:---|:---|
| HTTP请求入口 | 创建/继承Span，记录请求属性 |
| 数据库查询 | 创建子Span，记录SQL（脱敏）、执行时间 |
| 缓存操作 | 记录命中/未命中、序列化时间 |
| 外部服务调用 | 创建子Span，记录服务、操作、状态码 |
| 异步任务 | 创建独立Span，关联触发上下文 |
| 消息队列 | 生产消费都创建Span，关联消息ID |

## 8. 并发与异步处理

### 8.1 异步任务设计

#### 8.1.1 任务队列抽象

| 抽象 | 职责 | 实现示例 |
|:---|:---|:---|
| `ITaskQueue` | 任务入队、优先级、延迟执行 | Celery, RQ, ARQ |
| `ITask` | 任务定义，序列化，执行逻辑 | `@task`装饰器类 |
| `ITaskResult` | 结果存储、查询、回调 | 数据库/Redis/专用存储 |

任务定义要求：可序列化参数（Pydantic模型或基础类型），明确重试策略，幂等性保证。

#### 8.1.2 任务优先级与重试策略

| 优先级 | 场景 | 队列配置 |
|:---|:---|:---|
| critical | 实时性要求，如Webhook推送 | 专用队列，更多worker |
| high | 用户触发，如文档处理 | 优先消费 |
| normal | 后台任务，如统计计算 | 默认队列 |
| low | 可延迟，如数据清理 | 低优先级队列，闲时执行 |

重试策略：指数退避（2^attempt * base_delay），最大重试3-5次，最终进入死信队列人工处理。

#### 8.1.3 任务幂等性保证

| 机制 | 实现 |
|:---|:---|
| 唯一任务ID | 客户端生成或队列生成，重复提交检测 |
| 状态检查 | 执行前检查是否已处理，避免重复 |
| 数据库唯一约束 | 结果写入使用UPSERT |
| 分布式锁 | 关键操作获取锁，防止并发执行 |

### 8.2 流式响应处理

#### 8.2.1 SSE（Server-Sent Events）规范

| 方面 | 规范 |
|:---|:---|
| 连接管理 | 异步生成器，支持背压 |
| 错误处理 | 流中错误以特殊事件发送，非断开连接 |
| 超时控制 | 空闲超时（如30秒），总时长限制 |
| 客户端断开 | 检测并立即停止生成，释放资源 |
| 重连恢复 | 支持`Last-Event-ID`续传 |

#### 8.2.2 WebSocket连接管理

| 场景 | 设计决策 |
|:---|:---|
| 实时协作编辑 | WebSocket，双向通信 |
| 连接认证 | 连接时验证Token，定期刷新 |
| 心跳机制 | 30秒Ping/Pong，检测死连接 |
| 消息格式 | JSON，包含类型字段，便于路由 |
| 水平扩展 | Redis Pub/Sub或专用服务同步状态 |

#### 8.2.3 背压与流量控制

| 机制 | 实现 |
|:---|:---|
| 客户端背压 | SSE/WS的TCP背压，生成器`await`自然阻塞 |
| 服务端限流 | Token Bucket限制生成速率 |
| 队列缓冲 | 异步任务队列缓冲突发流量 |
| 降级策略 | 高负载时切换为非流式或简化输出 |

### 8.3 并发控制

#### 8.3.1 限流策略

| 算法 | 特点 | 适用场景 |
|:---|:---|:---|
| 令牌桶（Token Bucket） | 允许突发，平滑限流 | API限流，用户体验优先 |
| 漏桶（Leaky Bucket） | 严格匀速，无突发 | 后端保护，资源公平分配 |
| 滑动窗口 | 精确统计，实现复杂 | 计费场景，精确计数 |
| 分布式限流 | Redis协调，集群一致 | 多实例部署 |

#### 8.3.2 熔断与降级机制

| 状态 | 触发条件 | 行为 |
|:---|:---|:---|
| Closed（关闭） | 正常 | 请求正常通过 |
| Open（打开） | 错误率>阈值，或连续错误数>阈值 | 快速失败，返回降级响应 |
| Half-Open（半开） | 超时后 | 允许有限请求探测恢复 |

降级策略：返回缓存数据、简化功能、排队等待、友好错误提示。

#### 8.3.3 资源池管理

| 资源 | 管理策略 |
|:---|:---|
| 数据库连接 | 连接池，最小/最大连接数，连接超时，空闲回收 |
| HTTP客户端 | 连接池，Keep-Alive，超时配置，DNS缓存 |
| 线程/进程池 | 大小限制，任务队列深度，拒绝策略 |
| 内存缓冲 | 大小限制，LRU淘汰，避免OOM |

## 9. 外部集成规范

### 9.1 第三方服务适配

#### 9.1.1 适配器模式封装

| 组件 | 职责 |
|:---|:---|
| `I{Service}Client` | 领域层接口，定义所需操作 |
| `{Service}Client` | 适配器实现，封装SDK或原始HTTP |
| `{Service}Config` | 配置对象，端点、凭证、超时等 |
| `{Service}Error` | 异常转换，统一为领域异常 |
| `{Service}Metrics` | 调用指标，延迟、成功率、用量 |

#### 9.1.2 超时与重试配置

| 场景 | 超时设置 | 重试策略 |
|:---|:---|:---|
| 实时交互（LLM生成） | 连接5s，读取60-120s | 不重试或1次，避免重复生成 |
| 异步处理（嵌入） | 连接10s，读取300s | 指数退避，最多3次 |
| 元数据操作（模型列表） | 连接5s，读取10s | 2次快速重试 |
| 上传下载 | 连接10s，读取无限制（流式） | 断点续传，而非重试 |

#### 9.1.3 断路器实现

| 参数 | 典型值 | 说明 |
|:---|:---|:---|
| 失败阈值 | 5次/60秒 | 触发打开 |
| 错误率阈值 | 50% | 辅助判断 |
| 打开持续时间 | 30秒 | 快速失败期 |
| 半开请求数 | 3 | 探测恢复 |
| 成功阈值 | 2/3 | 关闭断路器 |

### 9.2 LLM服务集成

#### 9.2.1 模型提供商抽象接口

```python
class IModelProvider(ABC):
    @abstractmethod
    def list_models(self) -> List[ModelInfo]: ...
    
    @abstractmethod
    async def chat_completion(
        self,
        request: ChatCompletionRequest
    ) -> AsyncIterator[ChatCompletionChunk]: ...  # 流式
    
    @abstractmethod
    async def embed(
        self,
        texts: List[str],
        model: str
    ) -> List[EmbeddingVector]: ...
    
    @abstractmethod
    def count_tokens(self, text: str, model: str) -> int: ...
    
    @property
    @abstractmethod
    def capabilities(self) -> ModelCapabilities: ...  # 功能声明
```

#### 9.2.2 流式响应统一处理

| 方面 | 统一处理 |
|:---|:---|
| 响应格式 | 转换为内部标准格式，屏蔽提供商差异 |
| 错误分类 | 映射到标准异常（RateLimit, InvalidRequest, ServerError） |
| 用量追踪 | 统一提取input/output tokens，记录到用量系统 |
| 内容安全 | 可选的内容过滤，敏感词检测 |
| 中断处理 | 客户端断开时取消生成，避免浪费 |

#### 9.2.3 Token用量追踪与限流

| 层级 | 机制 |
|:---|:---|
| 实时追踪 | 每次调用记录，异步批量写入 |
| 配额检查 | 调用前检查租户/用户剩余配额 |
| 软限制 | 告警通知，不阻断 |
| 硬限制 | 超出时立即拒绝，提示升级 |
| 成本优化 | 缓存相似请求，模型降级策略 |

### 9.3 事件驱动集成

#### 9.3.1 消息队列抽象

| 抽象 | 职责 |
|:---|:---|
| `IEventBus` | 事件发布，支持同步/异步 |
| `IEventHandler` | 事件处理，幂等性保证 |
| `IEventStore` | 事件持久化，支持重放 |
| `IOutbox` | 事务性发件箱，确保"数据存了事件才发" |

#### 9.3.2 事件Schema版本管理

| 策略 | 实现 |
|:---|:---|
| Schema演进 | 向后兼容，新字段可选，不删除旧字段 |
| 版本标识 | 事件包含`schema_version`字段 |
| 多版本消费 | 处理器声明支持的版本范围 |
| 迁移工具 | 旧版本事件可升级到新版本 |

#### 9.3.3 至少一次投递保证

| 机制 | 说明 |
|:---|:---|
| 生产者确认 | 消息持久化到队列后才提交事务 |
| 消费者确认 | 处理成功后显式确认，失败重入队 |
| 幂等性设计 | 消费者幂等，重复处理无副作用 |
| 死信队列 | 超限重试后隔离，人工处理 |
| 监控告警 | 堆积深度、消费延迟、失败率 |

## 10. 配置与环境管理

### 10.1 配置分层

#### 10.1.1 默认配置、环境配置、运行时配置

| 层级 | 来源 | 优先级 | 示例 |
|:---|:---|:---|:---|
| 代码默认值 | 配置文件`default.py` | 最低 | 连接池大小、超时时间 |
| 环境配置 | `development.py`, `production.py` | 中 | 数据库地址、日志级别 |
| 环境变量 | `DATABASE_URL`, `LOG_LEVEL` | 高 | 敏感配置、容器编排注入 |
| 运行时参数 | 启动命令行、配置中心 | 最高 | 动态调整的限流阈值 |

#### 10.1.2 敏感配置加密管理

| 场景 | 方案 |
|:---|:---|
| 密钥存储 | 环境变量 > 密钥管理服务（AWS KMS, Azure Key Vault）> 配置文件加密 |
| 传输加密 | TLS 1.3，证书固定 |
| 内存保护 | 使用后立即清零，避免swap |
| 审计日志 | 密钥访问记录，异常检测 |

#### 10.1.3 配置热更新支持

| 配置类型 | 热更新支持 | 实现 |
|:---|:---|:---|
| 功能开关 | 是 | 配置中心推送，本地缓存定期刷新 |
| 限流阈值 | 是 | 原子变量替换，无需重启 |
| 数据库连接 | 否 | 需要连接池重建，建议滚动更新 |
| 日志级别 | 是 | 动态调整，无需重启 |

### 10.2 环境一致性

#### 10.2.1 容器化部署规范

| 方面 | 规范 |
|:---|:---|
| 基础镜像 | 官方Python slim，定期更新安全补丁 |
| 多阶段构建 | 编译依赖与运行环境分离，减小镜像 |
| 非root运行 | 创建专用用户，最小权限 |
| 健康检查 | Dockerfile定义，Kubernetes使用 |
| 资源限制 | CPU/内存请求与限制，避免资源争抢 |
| 优雅关闭 | SIGTERM处理，完成当前请求后退出 |

#### 10.2.2 十二要素应用原则

| 要素 | 实践 |
|:---|:---|
| 代码库 | 单一代码库，多环境部署 |
| 依赖 | 显式声明，隔离环境 |
| 配置 | 环境变量存储，代码与配置分离 |
| 后端服务 | 作为附加资源，可替换 |
| 构建发布运行 | 严格分离，不可变制品 |
| 进程 | 无状态，共享 nothing |
| 端口绑定 | 自包含，通过端口暴露 |
| 并发 | 进程模型水平扩展 |
| 易处理 | 快速启动，优雅终止 |
| 开发/生产等价 | 环境一致，容器化保障 |
| 日志 | 事件流，不管理文件 |
| 管理进程 | 一次性进程，与主应用相同环境 |

#### 10.2.3 基础设施即代码

| 层级 | 工具 | 管理内容 |
|:---|:---|:---|
| 云资源 | Terraform/Pulumi | VPC、数据库、缓存、负载均衡 |
| 容器编排 | Kubernetes YAML/Helm | Deployment、Service、Ingress、HPA |
| 应用配置 | Kustomize/Helm Values | 环境特定配置，非敏感 |
| 密钥 | External Secrets Operator | 同步KMS密钥到K8s Secret |
| 监控 | Prometheus Operator + Grafana | 规则、仪表盘、告警 |

## 11. 测试策略规范

### 11.1 测试金字塔

#### 11.1.1 单元测试（领域逻辑）

| 方面 | 规范 |
|:---|:---|
| 范围 | 领域层实体、值对象、领域服务 |
| 依赖 | 零外部依赖，全部Mock |
| 工具 | pytest, 参数化测试 |
| 覆盖目标 | 核心领域逻辑100%分支覆盖 |
| 执行速度 | <10ms/测试，快速反馈 |

```python
def test_conversation_add_message_updates_context():
    conv = Conversation.create(...)
    msg = Message.create(content="Hello", role=Role.USER)
    
    conv.add_message(msg)
    
    assert len(conv.messages) == 1
    assert conv.last_message_at is not None
    assert conv.context_window.includes(msg)
```

#### 11.1.2 集成测试（仓库、外部服务）

| 方面 | 规范 |
|:---|:---|
| 范围 | 仓库实现、适配器、数据库交互 |
| 依赖 | TestContainers提供真实数据库，WireMock模拟外部服务 |
| 事务隔离 | 每个测试回滚，或数据库模板快速重置 |
| 覆盖目标 | 关键查询路径，事务边界 |
| 执行速度 | <1s/测试，CI并行执行 |

#### 11.1.3 契约测试（API接口）

| 方面 | 规范 |
|:---|:---|
| 范围 | 控制器、序列化、状态码、错误响应 |
| 工具 | pytest + HTTP客户端，或Pact |
| 消费者驱动 | 前端/客户端定义期望，后端验证 |
| 文档同步 | OpenAPI自动生成，测试验证一致性 |
| 执行速度 | <100ms/测试，快速反馈 |

### 11.2 测试数据管理

#### 11.2.1 测试固件与工厂模式

| 模式 | 用途 | 示例 |
|:---|:---|:---|
| Object Mother | 常用对象预设 | `AppMother.published_chat_app()` |
| Builder | 灵活构建复杂对象 | `AppBuilder().with_model("gpt-4").published().build()` |
| Factory | 批量生成，随机数据 | `fake.app_batch(count=10)` |

#### 11.2.2 数据库事务隔离

| 策略 | 实现 | 适用 |
|:---|:---|:---|
| 测试事务回滚 | 每个测试在事务中，结束回滚 | 快速，但可能遗漏提交问题 |
| 数据库模板 | 预置干净数据库，测试后丢弃 | 更接近真实，稍慢 |
| 唯一标识隔离 | 所有数据含测试运行ID，批量清理 | 并行测试支持 |

#### 11.2.3 测试环境数据清理

- 自动化清理：测试后删除创建的数据
- 生命周期标记：测试数据带过期时间，定期清理
- 独立命名空间：测试使用独立数据库/Schema

## 12. 代码质量与工程实践

### 12.1 代码组织原则

#### 12.1.1 依赖方向规则（向内依赖）

```
┌─────────────────┐
│   表现层 (api)   │  ← 依赖注入框架组装
├─────────────────┤
│   应用层 (services) │  ← 编排用例，管理事务
├─────────────────┤
│   领域层 (models)   │  ← 核心业务规则，零外部依赖
├─────────────────┤
│ 基础设施层 (infrastructure) │  ← 技术实现，依赖领域接口
└─────────────────┘
        ↑
   共享内核 (core)  ← 被所有层依赖，最小化
```

**禁止**：领域层导入基础设施层，应用层直接操作数据库，表现层调用仓库。

#### 12.1.2 接口隔离与依赖倒置

| 原则 | 实践 |
|:---|:---|
| 接口隔离 | 客户端不依赖不需要的方法，细粒度接口 |
| 依赖倒置 | 高层模块依赖抽象，而非具体实现 |
| 构造函数注入 | 显式声明依赖，便于测试和替换 |
| 组合优于继承 | 行为通过组合获得，避免深层继承 |

#### 12.1.3 显式依赖声明

```python
# 推荐：显式依赖，可测试
class ConversationService:
    def __init__(
        self,
        conversation_repo: IConversationRepository,
        app_repo: IAppRepository,
        model_provider: IModelProvider,
        event_bus: IEventBus,
        quota_checker: IQuotaChecker
    ):
        ...

# 避免：隐式全局依赖，难以测试
class ConversationService:
    def create(self, ...):  # 内部直接导入db, redis...
        from infrastructure import db  # 隐藏依赖！
```

### 12.2 命名与文档规范

#### 12.2.1 领域术语统一词汇表

| 术语 | 英文 | 说明 | 禁用 |
|:---|:---|:---|:---|
| 应用 | App | 可发布的LLM应用配置 | Application（歧义） |
| 对话 | Conversation | 用户与应用的交互会话 | Chat, Session |
| 消息 | Message | 对话中的单轮交互 |  |
| 工作流 | Workflow | 可视化的节点编排 | Pipeline, DAG |
| 知识库 | Knowledge | 文档集合与检索配置 | KnowledgeBase（冗长） |
| 分段 | Segment | 文档的分块单元 | Chunk, Piece |
| 提示词 | Prompt | 发送给模型的指令模板 |  |

#### 12.2.2 自解释代码优先

| 实践 | 示例 |
|:---|:---|
| 意图揭示命名 | `calculate_remaining_quota()` 而非 `calc_quota()` |
| 避免魔术数字 | `MAX_CONTEXT_LENGTH = 128000` 而非 裸数字 |
| 复杂条件提取 | `is_eligible_for_upgrade()` 而非 长条件表达式 |
| 类型注解 | 全函数签名类型，泛型明确 |
| 文档字符串 | 公共API说明用途、参数、返回值、异常 |

#### 12.2.3 架构决策记录（ADR）

| 场景 | 记录内容 |
|:---|:---|
| 重大技术选型 | 为什么选择PostgreSQL而非MySQL |
| 架构模式变更 | 为何从单体向微服务演进 |
| 关键设计权衡 | 最终一致性 vs 强一致性的选择 |
| 性能优化方案 | 缓存策略的演进过程 |

ADR格式：标题、状态、背景、决策、后果、替代方案考虑。

### 12.3 代码审查清单

#### 12.3.1 安全审查要点

| 检查项 | 说明 |
|:---|:---|
| 注入防护 | SQL参数化，命令避免shell=True |
| 认证绕过 | 所有端点检查认证，无默认开放 |
| 权限校验 | 资源操作验证所有权，禁止仅依赖ID |
| 敏感数据 | 日志无密码，响应无内部细节 |
| 依赖安全 | 定期扫描CVE，及时更新 |

#### 12.3.2 性能审查要点

| 检查项 | 说明 |
|:---|:---|
| N+1查询 | 关联数据批量加载，预取优化 |
| 大结果集 | 分页处理，流式响应 |
| 缓存策略 | 热点数据缓存，缓存一致性 |
| 异步处理 | IO操作异步化，避免阻塞 |
| 资源释放 | 连接、文件、锁的正确关闭 |

#### 12.3.3 可维护性审查要点

| 检查项 | 说明 |
|:---|:---|
| 单一职责 | 函数/类职责明确，易于理解 |
| 测试覆盖 | 核心逻辑有测试，边界情况覆盖 |
| 错误处理 | 异常分类清晰，不吞没错误 |
| 配置外置 | 无硬编码，环境差异配置化 |
| 文档同步 | 代码变更同步更新文档和ADR |

