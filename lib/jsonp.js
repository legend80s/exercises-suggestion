/**
 * 通过 jsonp 获取数据
 * @param  {string}    url                   资源 endpoint
 * @param  {string}    options.callbackQuery jsonp callback 名
 * @param  {Obejct} options.queries          其他查询参数
 * @return {Promise<*>}                      返回一个 Promise
 */
function jsonp(url, { callbackQuery, callbackName, ...queries }) {
  // console.log('url:', url);
  // console.log('callbackQuery:', callbackQuery);
  // console.log('callbackName:', callbackName);
  // console.log('queries:', queries);
  if (!callbackName) {
    callbackName = `jsonp_${randomStr()}`;
  }

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
        // 但是它报错，不是我们的问题，所以可以不用管
        existingCallback && existingCallback(response);;
      } catch (error) {
        // do nothing
        console.error('error:', error);
      }

      // 删除插入的 script，否则 script 会越积越多
      headNode.removeChild(script)
      if (!existingCallback) {
        // 删除我们在 window 上绑定的函数
        delete window[callbackName];
      }

      resolve(response);
    }

    /**
     * 请求报错处理
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
 * 因为 Math.random() 有小数点不好看，所以只取小数点后面的数字
 * @return {string}
 */
function randomStr() {
  return Math.random().toString().slice(2);
}


