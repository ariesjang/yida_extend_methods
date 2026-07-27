# 宜搭页面 ES Module 导入说明

宜搭动作面板可使用下列代码验证远程 ES Module 导入。建议优先使用带 Git 标签的版本地址，避免 `master` 分支的 CDN 缓存延迟影响测试。

```js
import {
  yidaExt_getVersion as yidaExt_getVersionModule,
  yidaExt_test as yidaExt_testModule
} from 'https://cdn.jsdmirror.cn/gh/ariesjang/yida_extend_methods@v202607270916/public/yida-extend-methods.esm.js';

/**
 * 获取当前导入模块的版本号。
 *
 * @title 获取公共扩展版本
 * @returns {string} 当前公共扩展模块版本号。
 * @context 不依赖宜搭页面上下文、fieldId、数据源或页面状态。
 * @sideEffects 无。
 * @throws {never} 本方法不抛出异常。
 * @example
 * this.yidaExt_getVersionAction();
 */
export function yidaExt_getVersionAction() {
  return yidaExt_getVersionModule();
}

/**
 * 测试当前导入的公共扩展模块。
 *
 * @title 测试公共扩展模块
 * @returns {{loaded: boolean, methodName: string, version: string}} 模块测试结果。
 * @context 依赖宜搭动作面板注入的 `this` 及 `this.utils.toast()`，不依赖 fieldId、数据源或页面状态。
 * @sideEffects 在当前页面显示一条短暂的成功 Toast。
 * @throws {Error} 当宜搭页面上下文无效或缺少 `this.utils.toast()` 时抛出错误。
 * @example
 * this.yidaExt_testAction();
 */
export function yidaExt_testAction() {
  var yidaExt_testBound = yidaExt_testModule.bind(this);
  return yidaExt_testBound();
}
```

远程 `import` 只负责加载模块，不会自动传递宜搭页面上下文。依赖宜搭 `this` 的方法必须在动作函数内使用 `.bind(this)`；不依赖页面上下文的方法可以直接调用。

如果动作面板保存或预览时报模块解析、CORS 或 MIME 错误，应停止使用 ESM 入口，并改用经典脚本入口和 `this.utils.loadScript()`。
