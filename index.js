const mountedNode = document.getElementById('suggestions');

document.getElementById('queryInput').addEventListener('input', (event) => {
  // console.log('event.target.value:', event.target.value);

  const query = event.target.value;

  fetchSuggestions(query)
    .then(suggestions => {
      console.log(`suggestions for ${query}:`, suggestions);

      renderSuggestions(suggestions, mountedNode);
    })
    ;
});


function renderSuggestions(suggestions, mountedNode) {
  // 清空已有的
  mountedNode.textContent = '';

  // 防止多次添加引起 repaint
  const fragment = document.createDocumentFragment();

  suggestions.forEach((suggestion) => {
    const li = document.createElement('li');

    console.log('suggestion:', suggestion);

    li.textContent = suggestion;

    fragment.appendChild(li);
  });

  mountedNode.appendChild(fragment);
}

/**
 * 获取下拉提示
 * @param  {string} query 查询词
 * @return {Promise<string>}       [description]
 */
function fetchSuggestions(query) {
  return jsonp('http://tip.soku.com/search_tip_1?site=2', {
    query,
    callbackQuery: 'jsoncallback',
  })
    .then(json => json.r.map(({ w }) => w))
    .catch((error) => {
      console.error('error:', error);
    })
    ;
}
