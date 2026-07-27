/**
 * 宜搭公共 JavaScript 扩展脚本，供宜搭页面通过 `this.utils.loadScript()` 加载。
 *
 * @version v202607270916
 * @compatibility 作为经典脚本加载，使用原生 ES6 语法，不使用 `export`、`import`、可选链或空值合并。
 */

var YIDA_EXT_VERSION = 'v202607270916';

/**
 * 获取当前公共扩展脚本的发布版本号，适用于加载校验、问题诊断和版本兼容判断。
 *
 * @title 获取扩展脚本版本号
 * @returns {string} 同步返回 `vyyyyMMddHHMM` 格式的当前脚本版本号。
 * @context 不依赖宜搭页面上下文、fieldId、数据源或页面状态，可直接通过 `window.YidaExt.yidaExt_getVersion()` 调用。
 * @sideEffects 无；仅读取脚本级静态变量 `YIDA_EXT_VERSION`。
 * @throws {never} 本方法不抛出异常。
 * @example
 * var version = window.YidaExt.yidaExt_getVersion();
 */
function yidaExt_getVersion() {
  return YIDA_EXT_VERSION;
}

/**
 * 验证公共扩展脚本是否已正确加载，并向当前宜搭页面显示成功提示。
 *
 * @title 测试公共扩展脚本
 * @returns {{loaded: boolean, methodName: string, version: string}} 同步返回加载状态、当前方法名称和脚本版本号。
 * @context 依赖 `this.utils.toast()`；宜搭动作面板必须通过 `window.YidaExt.yidaExt_test.call(this)` 传入正确页面上下文，不依赖 fieldId、数据源或页面状态。
 * @sideEffects 在当前页面显示一条短暂的成功 Toast；脚本加载时会向 `window.YidaExt` 注册本方法，不修改字段值、页面状态或 DOM。
 * @throws {Error} 当宜搭页面上下文不存在，或当前环境不提供 `this.utils.toast()` 时抛出错误。
 * @example
 * this.utils.loadScript('https://example.com/yida-extend-methods.js')
 *   .then(() => window.YidaExt.yidaExt_test.call(this));
 */
function yidaExt_test() {
  if (!this || !this.utils || typeof this.utils.toast !== 'function') {
    throw new Error('yidaExt_test 调用失败：当前环境缺少宜搭 this.utils.toast() API。');
  }

  this.utils.toast({
    type: 'success',
    title: '公共扩展脚本加载成功，版本：' + YIDA_EXT_VERSION,
    duration: 3000
  });

  return {
    loaded: true,
    methodName: 'yidaExt_test',
    version: YIDA_EXT_VERSION
  };
}

window.YidaExt = window.YidaExt || {};
window.YidaExt.version = YIDA_EXT_VERSION;
window.YidaExt.yidaExt_getVersion = yidaExt_getVersion;
window.YidaExt.yidaExt_test = yidaExt_test;
