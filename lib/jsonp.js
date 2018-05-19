/**
 * 通过 jsonp 获取跨域资源
 *
 * @public
 *
 * @param  {string} url                      资源 endpoint
 * @param  {string} options.callbackQuery    jsonp callback key
 * @param  {string} options.callbackName     jsonp callback value
 * @param  {Obejct} options.queries          其他查询参数
 *
 * @return {Promise<*>}                      返回一个包含请求返回值的 Promise
 *
 * @example
 * jsonp(
 *   'http://tip.soku.com/search_tip_1?site=2',
 *   { query: '北京', callbackQuery: 'jsoncallback', callbackName: handleResponse }
 * )
 *   .then(console.log)
 *
 * // 实际上是在 head 内插入一个 script 标签：
 * // <script src="http://tip.soku.com/search_tip_1?site=2&query=北京&jsoncallback=handleResponse"></script>
 * // 浏览器看到 script 就会执行 src 内部的代码从而执行 handleResponse 函数，因此我们可在该函数中获取到返回值
 *
 * jsonp(
 *   'http://tip.soku.com/search_tip_1?site=2',
 *   { query: '北京', callbackQuery: 'jsoncallback' }
 * )
 *   .then(console.log)
 * // 没指定回调函数名，则默认生成一个，但为了不与已存在的函数重名，故生成一个随机的函数名
 * // 所以实际插入的可能是
 * <script src="http://tip.soku.com/search_tip_1?site=2&query=北京&jsoncallback=jsonp_06340378690836301"></script>
 * 无需担心泄露
 */
function jsonp(url, { callbackQuery, callbackName = `jsonp_${randomStr()}`, ...queries }) {
  // console.log('url:', url);
  // console.log('callbackQuery:', callbackQuery);
  // console.log('callbackName:', callbackName);
  // console.log('queries:', queries);
  // console.log('callbackName:', callbackName);

  const headNode = document.querySelector('head')
  const script = document.createElement("script");
  const queryString = queryToString(queries);
  // console.log('queryString:', queryString);

  script.src = url + (/\?/.test(url) ? '&' : '?') + callbackQuery + '=' + callbackName + (queryString ? '&' + queryString : '');

  headNode.appendChild(script);

  const existingCallback = typeof window[callbackName] === 'function' && window[callbackName];

  return new Promise(function (resolve, reject) {
    script.addEventListener('error', onError);

    window[callbackName] = (response) => {
      try {
        // 若 existingCallback 存在，则也需要调用它
        // 但是它报错，不是我们的问题，所以可不管
        existingCallback && existingCallback(response);;
      } catch (error) {
        // DO NOTHING
        console.error('error:', error);
      }

      // 删除插入的 script，否则 script 会越积越多
      headNode.removeChild(script);
      if (!existingCallback) {
        // 删除我们在 window 上绑定的函数
        delete window[callbackName];
      }

      resolve(response);
    }

    /**
     * 错误处理
     * @param  {Event} event DOM 事件
     */
    function onError(event) {
      // console.log('error event:', event);

      // 删除注册的事件，防止事件堆积造成内存泄漏
      script.removeEventListener('error', onError)
      // 删除插入的 script，否则 script 会越积越多
      headNode.removeChild(script);

      reject({
        status: 400,
        statusText: 'Bad Request'
      });
    }
  });
}


/**
 * 将对象转为 query 字符串
 *
 * @private
 *
 * @param  {Obejct} queries
 * @return {string}
 *
 * @example
 * queryToString({ query: '上海', timestamp: '2018-05-18' });
 * // => 'query=上海&timestamp=2018-05-18'
 */
function queryToString(queries) {
  return Object.keys(queries).map((key) => `${key}=${queries[key]}`).join('&');
}

/**
 * Generate random string.
 *
 * @private
 *
 * 因为 Math.random() 有小数点不好看，所以只取小数点后面的数字
 * @return {string}
 */
function randomStr() {
  return Math.random().toString().slice(2);
}
