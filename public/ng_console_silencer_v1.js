/* NG_CONSOLE_SILENCER_V1 */
(function(){
  // logs ON only if ?debug=1
  if (/[?&]debug=1\b/.test(location.search)) return;

  var noop = function(){};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.warn = noop;
  // console.error intentionally ON
})();
