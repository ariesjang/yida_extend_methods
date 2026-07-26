# 宜搭 JS-API 与动作面板速查

> 整理日期：2026-07-26  
> 官方来源：[宜搭 JS-API](https://docs.aliwork.com/docs/developer/api/yidaAPI)、[JS 动作面板 - 前端代码开发](https://docs.aliwork.com/docs/yida_support/lbtl0t/ocmxyv)  
> 本文是面向本项目的结构化速查，不替代官方文档。平台能力、参数和兼容性可能更新，存在差异时以线上官方文档为准。

## 1. 适用范围

宜搭 JS-API 用于设计器的 JS 动作面板和变量绑定场景，可访问页面状态、数据源、路由、组件和宜搭工具能力。本项目使用原生 ES6，不使用可选链 `?.` 或空值合并 `??`。

宜搭动作面板只识别以下具名导出形式：

```js
/**
 * 显示欢迎提示，适用于按钮点击等需要即时反馈的场景。
 *
 * @title 显示欢迎提示
 * @param {string} name - 需要展示的用户名称。
 * @returns {void} 本方法同步执行且无返回值。
 * @context 依赖 `this.utils.toast()`，必须由宜搭动作面板调用。
 * @sideEffects 在当前页面显示一条短暂的成功提示。
 */
export function showWelcome(name) {
  this.utils.toast({
    type: 'success',
    title: '欢迎 ' + name
  });
}
```

约束：

- 仅 `export function name() {}` 会被动作面板识别。
- 导出函数名称不得重复。
- 公共动作之间通过 `this.methodName()` 调用。
- 不需要宜搭上下文的工具函数保持非导出，并通过普通函数调用。
- 所有公共动作和内部工具函数均须具备完整、准确的 JSDoc。

## 2. `this` 上下文

导出动作最外层的 `this` 指向宜搭页面上下文。普通 `function` 回调会创建新的 `this`，因此异步回调优先使用箭头函数。

```js
/**
 * 加载指定数据源并返回结果，用于由动作主动触发远程查询。
 *
 * @title 加载示例数据
 * @returns {Promise<*>} 数据源成功响应的结果。
 * @context 依赖名为 `getDataList` 的宜搭远程数据源。
 * @sideEffects 发起网络请求；失败时显示错误提示并继续抛出异常。
 */
export function loadExampleData() {
  return this.dataSourceMap.getDataList.load().catch((error) => {
    this.utils.toast({
      type: 'error',
      title: '数据加载失败'
    });
    throw error;
  });
}
```

必须使用普通回调时，可先保存 `const that = this`。不要在嵌套普通函数中直接调用 `this.$()`、`this.setState()` 或其他页面 API。

## 3. 全局状态 API

### `this.state.xxx`

读取页面级全局状态，`xxx` 通常是页面数据源变量名。只读访问，不直接对 `this.state` 赋值。

### `this.setState(nextState)`

合并更新页面状态并触发重新渲染，使用方式与 React 的 `setState` 类似。

```js
/**
 * 将页面切换为加载状态，适用于异步任务启动前的界面反馈。
 *
 * @title 进入加载状态
 * @returns {void} 本方法同步提交状态更新。
 * @context 依赖 `this.setState()` 和页面状态变量 `status`、`statusText`。
 * @sideEffects 修改页面全局状态并触发重新渲染。
 */
export function enterLoadingState() {
  this.setState({
    status: 'loading',
    statusText: '加载中...'
  });
}
```

禁止使用 `this.state.a = value`，该写法无法保证后续兼容性。

## 4. 远程数据 API

### `this.dataSourceMap.xxx.load(params)`

- 用途：手动调用名称为 `xxx` 的远程数据源。
- 参数：可选对象，会与设计器中配置的请求参数合并。
- 返回：Promise；成功值由数据源响应结构决定。
- 注意：必须处理失败；数据源名称属于页面配置依赖，应写入调用方法的 JSDoc。

### `this.reloadDataSource()`

- 用途：重新请求所有“自动加载”设置为 true 的远程数据源。
- 返回：Promise。
- 注意：这是批量刷新，可能产生多次网络请求；仅需刷新单个数据源时优先调用对应的 `load()`。

## 5. 动作调用与参数

### `this.methodName(...args)`

调用动作面板中的另一个导出函数，并传递当前宜搭上下文。不要使用裸调用 `methodName()` 代替，否则被调用动作中的 `this` 可能不可用。

### `this.params`

读取在动作绑定配置中设置的回调参数：

```js
/**
 * 输出动作面板配置的人员参数，适用于验证动作绑定参数。
 *
 * @title 读取动作参数
 * @returns {void} 本方法同步执行且无返回值。
 * @context 依赖动作配置写入 `this.params.name` 和 `this.params.age`。
 * @sideEffects 向浏览器控制台写入诊断信息。
 */
export function logActionParams() {
  var params = this.params || {};
  console.log(params.name, params.age);
}
```

`this.params` 可能为空，应先提供安全默认值。

## 6. 工具类 API

### `this.utils.dialog(options)`

显示对话框。常用配置：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `type` | `string` | `alert`、`confirm` 或 `show` |
| `title` | `string` | 标题 |
| `content` | `string` 或 ReactNode | 内容 |
| `hasMask` | `boolean` | 是否显示遮罩，默认 true |
| `footer` | `boolean` | 是否显示底部按钮 |
| `footerAlign` | `string` | `left`、`center` 或 `right` |
| `footerActions` | `string[]` | 确认与取消按钮的类型及顺序 |
| `onOk` | `function` | 确认回调 |
| `onCancel` | `function` | 取消回调 |

返回对象可通过 `hide()` 手动关闭。复杂内容可能依赖宜搭页面的 React 环境，公共库应优先使用简单文本或经过安全处理的内容。

### `this.utils.formatter(type, value, pattern)`

格式化日期、金额、手机号或银行卡号等。常见类型包括：

- `date`：例如 `YYYY-MM-DD`、`YYYY-MM-DD HH:mm:ss`。
- `money`：金额分隔格式。
- `cnmobile`：中国大陆手机号显示格式。
- `card`：银行卡号显示格式。

不得假设非法输入一定能被正常格式化；公共方法应先校验或标准化输入。

### `this.utils.getDateTimeRange(when, type)`

获取指定时间粒度的起止时间戳。

- `when`：可选，时间戳或 `Date`，默认当前时间。
- `type`：可选，支持 `year`、`month`、`week`、`day`、`date`、`hour`、`minute`、`second`，默认 `day`。
- 返回：包含开始和结束时间戳的二元数组。

### 环境与用户

| API | 用途 |
| --- | --- |
| `this.utils.getLocale()` | 获取页面语言环境，例如 `zh_CN` |
| `this.utils.getLoginUserId()` | 获取当前登录用户 ID |
| `this.utils.getLoginUserName()` | 获取当前登录用户名称 |
| `this.utils.isMobile()` | 判断是否为移动端 |
| `this.utils.isSubmissionPage()` | 判断是否为数据提交页 |
| `this.utils.isViewPage()` | 判断是否为数据查看页 |

登录用户信息属于个人数据，不应无必要地写入日志、URL 或第三方请求。

### `this.utils.loadScript(url)`

动态加载远程 JavaScript，返回 Promise。加载第三方资源时：

- 仅使用可信、固定版本的 HTTPS 地址。
- 处理加载失败、超时、重复调用和全局对象未注册。
- 避免多个不同版本写入同一个全局变量。
- 不把令牌、敏感表单值或个人信息传给不可信脚本。
- 公共加载器宜缓存同一 URL 对应的 Promise，避免并发重复加载。

### `this.utils.openPage(path)`

打开新页面；在钉钉环境中会使用更适合客户端的打开方式。外部地址必须验证协议与来源。

### `this.utils.previewImage(options)`

打开图片预览，`options.current` 指定当前图片地址。图片应来自可信 HTTPS 地址。

### `this.utils.toast(options)`

显示轻量提示。常用参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `type` | `string` | `success`、`warning`、`error`、`notice`、`help` 或 `loading` |
| `title` | `string` | 提示内容 |
| `size` | `string` | `medium` 或 `large` |
| `duration` | `number` | 自动关闭时长；loading 类型不适用 |

返回值是关闭函数，可用于手动结束 loading。异步流程应保证成功和失败路径都能关闭 loading。

## 7. 路由 API

### `this.utils.router.push(path, params, blank, isUrl, type)`

- `path`：必填，完整 URL、URL 片段或页面 ID。
- `params`：可选查询参数对象。
- `blank`：是否新开页面，默认 false。
- `isUrl`：是否按 URL 解析，默认 false。
- `type`：`push` 或 `replace`。

用户输入必须作为参数编码，不应直接拼入 URL。

### `this.utils.router.replace(path, params)`

替换当前路由记录，用户通常不能通过浏览器后退返回替换前页面。

### `this.utils.router.getQuery(key, queryStr)`

- 传入 `key` 时返回指定查询参数。
- 不传 `key` 时返回查询参数对象。
- `queryStr` 可用于解析自定义查询字符串。
- 默认解析页面的 search 与 hash，hash 中的同名参数优先。

查询参数属于不可信输入，使用前需要校验。

### `this.utils.router.stringifyQuery(params)`

把对象序列化为查询字符串。仅负责序列化，不替代业务级参数校验。

## 8. 组件通用 API

`fieldId` 是宜搭组件唯一标识。通过 `this.$(fieldId)` 获取组件实例，只使用官方公开方法。

### `this.$(fieldId).get(prop)`

读取组件公开属性。禁止使用 `this.$(fieldId).xxx` 直接读取属性或私有成员。

### `this.$(fieldId).set(prop, value)`

设置组件公开属性。禁止使用 `this.$(fieldId).xxx = value` 直接赋值。

调用前应确认组件存在。公共方法接收动态 `fieldId` 时，应提供明确的缺失组件错误。

## 9. 表单组件 API

### 值操作

| API | 用途与注意事项 |
| --- | --- |
| `getValue()` | 获取组件当前输入值；返回类型由组件类型决定 |
| `setValue(value, options)` | 设置组件值 |
| `reset(toDefault)` | 重置组件；`toDefault` 默认 true，表示恢复默认值 |

`setValue()` 的可选配置：

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `doNotValidate` | false | 是否阻止自动校验 |
| `formatted` | false | 传入值是否已经格式化 |
| `triggerChange` | true | 是否触发组件值变化事件 |

设置值可能触发联动、公式和 onChange。需要静默更新时必须根据业务评估 `triggerChange`，并在方法注释中说明副作用。

### 状态操作

| API | 用途 |
| --- | --- |
| `getBehavior()` | 获取当前状态 |
| `setBehavior(behavior)` | 设置当前状态 |
| `resetBehavior()` | 恢复设计器配置的状态 |

状态值包括：

- `NORMAL`：正常输入态。
- `READONLY`：只读态。
- `DISABLED`：禁用态。
- `HIDDEN`：隐藏态。

### 校验操作

| API | 用途 |
| --- | --- |
| `validate(callback)` | 主动执行组件校验，可在回调中读取错误和值 |
| `disableValid()` | 暂停组件校验 |
| `enableValid()` | 恢复组件校验 |
| `setValidation(validation)` | 设置组件校验状态或信息 |
| `resetValidation()` | 重置组件校验状态 |

校验回调可能返回错误集合与当前值。不要仅依赖界面提示判断校验是否通过；提交或后续业务动作应根据校验结果明确中止。

## 10. Dialog 组件 API

对于设计器中的 Dialog 组件：

| API | 用途 |
| --- | --- |
| `this.$(fieldId).show()` | 显示指定 Dialog |
| `this.$(fieldId).hide()` | 隐藏指定 Dialog |

它与 `this.utils.dialog()` 不同：前者控制页面中已有的 Dialog 组件，后者以工具方式创建对话框。

## 11. 子表单补充

### 读取子表单

```js
/**
 * 读取指定子表单的全部行数据，适用于提交前检查或汇总计算。
 *
 * @param {Object} pageContext - 宜搭页面上下文，必须提供 `$` 方法。
 * @param {string} subFormId - 子表单组件唯一标识。
 * @returns {Array<Object>} 子表单当前行数据；没有数据时返回空数组。
 * @context 依赖 `pageContext.$(subFormId).getValue()`。
 * @sideEffects 无。
 * @throws {Error} 当上下文、子表单标识或组件实例无效时抛出错误。
 */
function getSubFormRows(pageContext, subFormId) {
  var subForm = pageContext.$(subFormId);
  var rows = subForm.getValue();
  return Array.isArray(rows) ? rows : [];
}
```

可使用：

- `getItems()` 获取行标识列表。
- `getItemValue(itemId)` 获取指定行数据。
- 从行数据中使用子表单内部字段的 `fieldId` 读取单元格值。

### 识别变化

子表单 onChange 的 `extra` 中可包含：

- `formGroupId`：子表单标识。
- `from`：变更来源。
- `changes.fieldId`：发生变化的单元格字段。

单元格编辑、公式计算、数据联动或外部赋值都可能触发 onChange。处理器应识别变更来源和字段，并避免写回同一字段造成递归触发。

### 更新相关行

只更新目标行和目标字段，不应为一次单元格变化无条件重写整个子表单。写回前比较新旧值，并根据业务需要控制是否触发 change 事件。

## 12. 调试与常见错误

### 调试方式

- 优先使用 Chrome DevTools 的 Console、Network 和 Elements 面板。
- 可在本地调试阶段临时使用 `debugger`，提交或发布前移除无意保留的断点。
- 宜搭页面基于 React，可使用 React Developer Tools 辅助定位渲染问题。
- XSwitch 等资源代理工具仅用于受控的本地调试，不应成为生产运行依赖。

### `Cannot read property '$' of undefined`

常见原因是裸调用另一个动作：

```js
// 错误：没有传递宜搭上下文。
testAction();

// 正确：通过 this 调用动作面板中的导出函数。
this.testAction();
```

嵌套普通函数中的 `this` 丢失也会产生类似错误，应改用箭头函数或保存上下文引用。

### HTTPS 与 CORS

宜搭页面运行在 HTTPS 域名下，浏览器会阻止加载 HTTP 接口或脚本。远程服务必须：

1. 使用有效证书的 HTTPS。
2. 明确允许宜搭页面来源跨域访问。
3. 正确响应预检请求并允许所需方法和请求头。

本地局域网 HTTP 地址不能作为线上宜搭页面的直接数据接口。

## 13. 选择建议

- 简短、非阻塞反馈使用 Toast；需要确认或复杂内容使用 Dialog。
- 刷新单一数据源使用对应的 `load()`；确需刷新所有自动数据源时才使用 `reloadDataSource()`。
- 页面内跳转优先使用 router；需要钉钉端友好地打开独立页面时评估 `openPage()`。
- 组件值、属性、状态和校验分别使用对应官方 API，不混用私有字段。
- 大数据量统计、批处理或敏感逻辑优先放到宜搭数据源、连接器、集成自动化或服务端，不在浏览器端拉取全量数据处理。

