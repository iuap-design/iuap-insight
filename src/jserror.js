/**
 * 监听浏览器中错误
 * @return {[type]} [description]
 */
export default function(){
  /**
   * [function description]
   * @param  {[type]} msg   [description]
   * @param  {[type]} url   [description]
   * @param  {[type]} line  [description]
   * @param  {[type]} col   [description]
   * @param  {[type]} error [description]
   * @return {[type]}       [description]
   */
  window.onerror = function(msg,url,line,col,error){
      if (msg != "Script error." && !url){
          return true;
      }

      setTimeout(function(){

        var data = {};
        col = col || (window.event && window.event.errorCharacter) || 0;

        data.url = url;
        data.line = line;
        data.col = col;

        if (!!error && !!error.stack){
            data.msg = error.stack.toString();
        }else if (!!arguments.callee){
          var ext = [];
          var f = arguments.callee.caller, c = 3;

          while (f && (--c>0)) {
             ext.push(f.toString());
             if (f  === f.caller) {
                  break;
             }
             f = f.caller;
          }

          ext = ext.join(",");
          data.msg = ext;
        }

        var _paq = window._paq;

  		  if(_paq){
      		var visitor_id;
      		_paq.push([ function() { visitor_id = this.getVisitorId(); }]);

      			_paq.push(['setUserId', visitor_id]);
      			_paq.push(['setDocumentTitle', data.msg]);
      			_paq.push(['setCustomVariable',1,"js_error",data.msg,"page"]);
      			_paq.push(['trackEvent', 'jserror', data.url, data.line, data.col]);
    		}
      }, 0);
  };
}
