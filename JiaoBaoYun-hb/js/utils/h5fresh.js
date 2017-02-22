/**
 * h5下拉刷新
 * 解决与水平滚动的冲突
 * @anthor an
 */
var h5fresh = (function(mod) {
	var ws = null; //当前webview
	// 扩展API加载完毕，现在可以正常调用扩展API
	mod.addRefresh = function(refresh, data) {
		var height = '10%';
		var range = '20%';
		var style = 'default';
		var offset = '0px;'
		if(data) {
			if(data.style) {
				style = data.style;
			}
			if(data.offset) {
				offset = data.offset;
			}
			if(data.height) {
				height = data.height;
			}
			if(data.range) {
				height = data.range;
			}
		}
		ws = plus.webview.currentWebview();
		ws.setPullToRefresh({
			support: true, //是否开启Webview窗口的下拉刷新功能
			style: style, //"default" - 目前已实现的经典样式； "circle" - 新增下拉圆圈样式。 默认值为"default"。
			offset: offset, //下拉刷新控件的起始位置.仅对"circle"样式下拉刷新控件有效，用于定义刷新控件下拉时的起始位置。 相对于Webview的顶部偏移量，支持百分比，如"10%"；像素值，如"50px"。 默认值为"0px"。
			height: height, //窗口的下拉刷新控件高度
			range: range, //)窗口可下拉拖拽的范围
			contentdown: {
				caption: "下拉可以刷新"
			},
			contentover: {
				caption: "释放立即刷新"
			},
			contentrefresh: {
				caption: "正在刷新..."
			}
		}, function() {
			setTimeout(function() {
				refresh();
				ws.endPullToRefresh();
			}, 2000)
		}); //刷新
		//	plus.nativeUI.toast("下拉可以刷新");
	}

	// 刷新页面
	function onRefresh() {
		setTimeout(function() {
			if(list) {
				var item = document.createElement("li");
				item.innerHTML = "<span>New Item " + (new Date()) + "</span>";
				list.appendChild(item, list.firstChild);
			}
			ws.endPullToRefresh();
		}, 2000);
	}

	return mod
})(h5fresh || {})