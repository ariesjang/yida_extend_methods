/**
 * 宜搭公共 JavaScript 扩展脚本，供宜搭页面通过 `this.utils.loadScript()` 加载。
 *
 * @version v202607261355
 * @compatibility 使用原生 ES6 语法，不使用可选链或空值合并。
 */

var YIDA_EXT_VERSION = 'v202607261355';

/**
 * 验证公共扩展脚本是否已正确加载，并向当前宜搭页面显示成功提示。
 *
 * @title 测试公共扩展脚本
 * @returns {{loaded: boolean, methodName: string, version: string}} 同步返回加载状态、当前方法名称和脚本版本号。
 * @context 依赖 `this.utils.toast()`；必须由宜搭动作面板以正确的页面上下文调用，不依赖 fieldId、数据源或页面状态。
 * @sideEffects 在当前页面显示一条短暂的成功 Toast；不修改字段值、页面状态、全局状态或 DOM。
 * @throws {Error} 当宜搭页面上下文不存在，或当前环境不提供 `this.utils.toast()` 时抛出错误。
 * @example
 * this.yidaExt_test();
 */
export function yidaExt_test() {
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
