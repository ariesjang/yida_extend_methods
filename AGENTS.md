# 宜搭公共 JS 扩展项目约束

## 1. 项目定位

本项目用于沉淀钉钉宜搭低代码平台中的通用业务逻辑，将多个业务页面反复使用的能力抽取为公共 JavaScript 方法。产物由宜搭页面通过 `this.utils.loadScript()` 动态加载，并结合宜搭动作面板和宜搭 JS-API 使用。

本文件是整个仓库的长期开发约束。新增、修改、审查或重构代码时均须遵守。

## 2. 运行环境与兼容性

- 使用 JavaScript 和原生 ES6 能力，不引入未经明确批准的编译链、运行时框架或包管理依赖。
- 可以使用宜搭官方公开的 JS-API；不得依赖未公开的组件属性、私有对象或内部实现。
- 禁止使用可选链 `?.`、空值合并 `??` 及其他目标宜搭运行环境不能稳定支持的语法。
- 需要兼容 PC 与移动端时，应使用 `this.utils.isMobile()` 判断运行环境，不通过 User-Agent 猜测。
- 网络资源和接口必须使用 HTTPS，并满足浏览器跨域策略。不得从不可信来源加载脚本。
- 不得假设异步接口一定成功。远程数据源、脚本加载及其他 Promise 调用必须提供失败处理。

## 3. 交付文件与代码组织

- `public/` 是本项目唯一的发布目录，也是宜搭页面通过 `this.utils.loadScript()` 直接加载脚本的固定目录。
- 每个可独立加载的业务最终交付为 `public/` 下的单一 JavaScript 文件，例如 `public/business-a.js` 和 `public/business-b.js`；没有具体公共方法需求时，不创建空白 JS 文件。
- 当前未引入构建流程时，可以直接维护 `public/` 下的发布脚本。未来引入多文件开发和构建流程后，开发源码统一放入 `src/`，构建产物仍输出到 `public/` 中原有的相对路径和文件名。
- 已被宜搭页面加载的 `public/` 文件路径和文件名属于稳定发布接口。未经明确迁移安排不得改名、移动或添加内容哈希；确需变更时，必须同步更新所有加载地址并说明兼容方案。
- `public/` 必须纳入 Git 版本管理，不得在 `.gitignore` 中忽略。构建流程不得在未生成有效替代文件的情况下清空或删除现有发布脚本。
- 引入构建流程后，`src/` 是人工维护的源码目录，`public/` 是生成的发布目录；不得直接修改生成后的文件，修改应在 `src/` 完成并重新构建。
- 本项目所有函数统一使用 `yidaExt_` 前缀，前缀后的名称采用 lowerCamelCase，例如 `yidaExt_test`、`yidaExt_normalizeText`。新增函数不得使用其他前缀或无前缀名称。
- `public/` 脚本由 `this.utils.loadScript()` 以经典脚本方式加载，禁止在发布文件中使用 `export` 或 `import`。发布方法通过 `window.YidaExt` 命名空间暴露，例如 `window.YidaExt.yidaExt_test`。
- 宜搭动作面板内的包装动作仍使用具名声明 `export function actionName(...) {}`，由包装动作加载脚本后通过 `window.YidaExt.methodName.call(this, ...)` 调用公共方法；不使用默认导出、匿名导出或变量形式的函数导出。
- 导出的函数名称必须唯一、语义明确且保持稳定；修改公共函数名称视为接口变更。
- 仅需要被宜搭动作面板识别和调用的公共动作使用 `export`。内部工具函数使用普通具名 `function`，不得无意义地暴露到动作面板。
- 公共动作入口应保持简洁，主要负责参数接收、校验、宜搭上下文读取、流程编排和结果返回。
- 可复用的计算、格式转换、数据清洗和业务判断应下沉到内部工具函数，避免在入口函数内堆积实现细节。
- 公共动作之间必须通过 `this.methodName(...)` 调用，以传递正确的宜搭执行上下文。内部工具函数直接按函数名调用。
- 不复制已有能力。新增方法前先搜索现有实现、函数名称和相似业务逻辑。

### 3.1 发布版本

- 发布版本号统一使用 `vyyyyMMddHHMM` 格式，其中 `yyyy` 为四位年份、`MM` 为两位月份、`dd` 为两位日期、`HH` 为 24 小时制小时、末尾 `MM` 为两位分钟，例如 `v202607261530`。
- 版本时间统一按 `Asia/Shanghai` 时区生成。版本号应取实际发布时刻，不得手工填写与发布时间无关的值。
- 每个 `public/` 发布脚本的文件级 JSDoc 必须包含 `@version`，且值必须与本次发布对应的 Git 标签完全一致，包括前缀 `v`。
- Git 发布版本使用带注释的标签（annotated tag），标签名称必须严格使用同一版本号；发布前必须核对 Git 标签、JS 文件级 JSDoc 和实际发布文件三者一致。
- 同一分钟内不得创建两个发布版本。若同一分钟内需要再次发布，应等待下一分钟并生成新版本号，不得复用、覆盖或强制移动已经发布的 Git 标签。
- 未发布的开发提交不得提前创建正式版本标签。版本号写入发布脚本后，该变更必须包含在对应 Git 标签指向的提交中。
- 文件级 JSDoc 使用以下格式；除 `@version` 外，可按需补充脚本名称、用途和兼容性说明：

```js
/**
 * 宜搭业务公共扩展脚本。
 *
 * @version v202607261530
 */
```

### 3.2 代码仓库与发布源

- GitHub 仓库 `https://github.com/ariesjang/yida_extend_methods` 是本项目唯一的权威代码仓库和发布源，本地 `origin` 必须指向该仓库。
- Gitee 仓库仅视为历史副本，不再维护、同步或推送任何分支、提交和标签；后续流程不得将 Gitee 作为回源、发布或版本一致性依据。
- 每次代码发布只向 GitHub 的 `master` 分支和对应版本标签推送。发布完成后必须核对 GitHub 上的提交 SHA、标签和 `public/` 发布脚本版本一致。
- JSDMirror 通过 GitHub `/gh/` 路径拉取发布脚本。固定加载地址为 `https://cdn.jsdmirror.com/gh/ariesjang/yida_extend_methods@master/public/yida-extend-methods.js`，版本归档地址使用对应 Git 标签替换 `master`。

## 4. `this` 上下文规则

- 导出的动作函数由宜搭调用时，函数最外层的 `this` 指向宜搭页面上下文。
- 普通 `function` 回调会创建自己的 `this`。异步回调优先使用箭头函数；确需普通回调时，先保存上下文引用。
- 不得将依赖宜搭上下文的导出动作作为无绑定的普通函数调用。
- 读取或设置组件时只使用官方 API，例如 `this.$(fieldId).getValue()`、`setValue()`、`get()` 和 `set()`。
- 状态更新必须使用 `this.setState()`；禁止直接修改 `this.state`。
- 动作面板传入的配置参数通过 `this.params` 读取。函数形参和 `this.params` 的使用场景应在 JSDoc 中区分说明。

## 5. 注释与文档规范

所有公共动作和内部工具函数都必须添加与实现一致的完整 JSDoc，不允许出现无注释函数。

每个函数的 JSDoc 至少应包含：

- 一句话说明功能目的，并补充适用场景。
- 每个参数的名称、类型、业务含义、是否可选及默认值。
- 返回值的类型、结构和业务含义；无返回值时显式写明 `@returns {void}`。
- 函数是同步还是异步；返回 Promise 时说明 resolve 值和 reject/异常语义。
- 对宜搭上下文的依赖，包括使用的 `this` API、`fieldId`、数据源名称、页面状态和调用前置条件。
- 可观察副作用，例如字段更新、页面跳转、弹窗、网络请求、全局状态修改或 DOM 修改。
- 可能的错误、失败处理方式、边界条件和兼容性限制。
- 公共动作必须使用 `@title` 提供宜搭动作面板中的中文名称。
- 复杂公共方法必须提供简短的 `@example`，展示推荐调用方式。

推荐模板：

```js
/**
 * 将指定表单字段重置为默认值，适用于用户主动清空并恢复初始配置的场景。
 *
 * @title 重置指定字段
 * @param {string} fieldId - 宜搭组件唯一标识；必填，必须对应当前页面中可访问的表单组件。
 * @param {boolean} [toDefault=true] - 是否恢复组件默认值；为 false 时重置为空值。
 * @returns {void} 本方法同步执行且不返回业务数据。
 * @context 依赖 `this.$(fieldId).reset()`，只能由宜搭动作面板以正确页面上下文调用。
 * @sideEffects 修改指定表单组件的当前值，可能触发与该字段关联的页面逻辑。
 * @throws {Error} 当 fieldId 为空或当前页面不存在对应组件时抛出错误。
 * @example
 * this.resetField('textField_example', true);
 */
export function resetField(fieldId, toDefault) {
  // 具体实现下沉到内部函数或保持为简短的 API 编排。
}
```

内部工具函数同样需要完整注释，但不使用 `@title`：

```js
/**
 * 将可能为空的输入转换为去除首尾空白的字符串，供公共动作执行参数标准化。
 *
 * @param {*} value - 待标准化的原始值；null 和 undefined 按空字符串处理。
 * @returns {string} 标准化后的字符串。
 * @sideEffects 无。
 */
function normalizeText(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}
```

行内注释用于解释业务原因、特殊分支、兼容处理和非显而易见的副作用，不重复描述代码表面行为。修改实现时必须同步更新相关 JSDoc、示例和行内注释，不得保留过期说明。

## 6. 异步、脚本与错误处理

- `this.dataSourceMap.xxx.load()`、`this.reloadDataSource()` 和 `this.utils.loadScript()` 均按异步接口处理。
- 公共异步动作应返回 Promise，使调用方能够等待结果并处理失败。
- `loadScript()` 应封装重复加载保护。同一 URL 不应因多个动作并发调用而重复插入脚本。
- 加载完成后应验证目标全局对象是否存在，不能仅以 Promise resolved 作为库可用的唯一依据。
- 第三方全局对象名称、版本、来源地址和安全风险必须写入函数 JSDoc。
- 面向用户的错误使用 `this.utils.toast()` 或适当的 Dialog 反馈；诊断细节可以写入 `console.error`，但不得输出令牌、个人敏感信息或完整业务数据。
- 不静默吞掉异常。若方法无法恢复，应在提供必要用户提示后继续抛出或返回明确失败结果。

## 7. 宜搭 API 使用原则

- 仅使用官方文档公开的 API，参考 `docs/yida-js-api-reference.md`。
- 通过 `this.$(fieldId)` 获取组件实例；不得读取或修改文档未公开的实例成员。
- 组件属性通过 `get(prop)`、`set(prop, value)` 访问，不直接读取或赋值实例属性。
- 表单值通过 `getValue()`、`setValue()`、`reset()` 处理。
- 组件状态通过 `getBehavior()`、`setBehavior()`、`resetBehavior()` 处理。
- URL 参数通过 `this.utils.router.getQuery()` 获取，通过路由 API 构造跳转；不得手工拼接未编码的用户输入。
- 展示轻量反馈优先使用 Toast，需要用户确认或承载复杂内容时使用 Dialog。
- 统计、批量数据处理和敏感操作不应在浏览器端无边界执行；应优先评估宜搭数据源、连接器、集成自动化或服务端能力。

## 8. 质量与验收

- 新增或修改公共方法时，至少覆盖正常输入、空值、非法参数、异步失败、重复调用和目标组件不存在等场景。
- 检查所有函数均有完整 JSDoc，且 `@param`、`@returns` 与真实签名一致。
- 检查所有导出名称唯一，并确认只有公共动作被导出。
- 检查代码中不存在可选链、空值合并、HTTP 资源地址、未处理的 Promise 和对宜搭私有属性的访问。
- 检查 `this` 在嵌套函数、定时器和 Promise 回调中的指向。
- 发布前检查版本号符合 `vyyyyMMddHHMM` 格式，并确认所有本次发布的 `public/` 脚本中 `@version` 的值与 Git 标签完全一致。
- 任何新增能力都应评估参数通用性、可复用性、幂等性、性能和向后兼容性；发现更好的公共抽象时应向用户提出建议。
