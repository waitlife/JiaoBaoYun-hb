/**
 * @author an
 */

var events = (function(mod) {

	//去掉所有html标签
	mod.deleteHtml = function(text) {
		//		var dd = text.replace(/<\/?.+?>/g, "");
		//		var dds = dd.replace(/ /g, "");
		var reTag = /<(?:.|\s)*?>/g;
		return text.replace(reTag, "");
		//		return dds;
	}

	/**
	 * 绑定监听
	 * @param {Object} id 绑定dom的Id
	 * @param {Object} event 绑定的监听事件
	 */
	mod.addTap = function(id, event) {
		//		console.log("获取当前页面的id：" + plus.webview.currentWebview().id);
		var item = document.getElementById(id);
		if(item) {
			item.addEventListener('tap', event);
		} else {
			console.log('### ERROR ### 页面: ' + plus.webview.currentWebview().id + ' 未找到id为 ' + id + ' 的元素');
		}
	}
	/**
	 * 加载跳转界面监听的公用方法
	 * @param {Object} item 加载监听的控件
	 * @param {Object} targetHTML 目标Url
	 */
	mod.jumpPage = function(item, targetHTML) {
		item.addEventListener('tap', function() {
			mod.openNewWindow(targetHTML);
		})
	}
	/**
	 * 打开新界面
	 * @param {Object} targetPage 目标界面
	 */
	mod.openNewWindow = function(tarPagePath) {
		var tarPageIds = tarPagePath.split('/');
		var targetPage = plus.webview.getWebviewById(tarPageIds[tarPageIds.length - 1]);
		console.log('targetPage是否存在:' + Boolean(targetPage))
		if(targetPage) {
			targetPage.show('slide-in-right', 250);
		} else {
			mui.openWindow({
				url: tarPagePath,
				id: tarPageIds[tarPageIds.length - 1],
				show: {
					anishow: 'slide-in-right',
					duration: 250
				},
				waiting: {
					title: '正在加载...'
				},
				styles: mod.getWebStyle()
			})
		}

	}
	/**
	 * 打开新页面时，同时传值
	 * 扩展参数仅在打开新窗口时有效，若目标窗口为预加载页面，
	 * 则通过mui.openWindow方法打开时传递的extras参数无效。
	 * @param {Object} targetHTML 新页面路径
	 * @param {Object} passData 获取要传的值
	 */
	mod.openNewWindowWithData = function(targetHTML, passData) {
		mui.openWindow({
			url: targetHTML,
			id: targetHTML.split('/')[targetHTML.split('/').length - 1],
			extras: {
				data: passData
			},
			show: {
				anishow: 'slide-in-right',
				duration: 250
			},
			waiting: {
				title: '正在加载...'
			},
			styles: mod.getWebStyle()
		});
	};
	/**
	 * 加载子页面
	 * @param {Object} subPage 子页面路径
	 * @param {Object} datas 向子页面加载的数据，可选参数
	 */
	mod.initSubPage = function(subPage, datas, height, bottom) {
		if(!datas) {
			datas = null;
		}
		height = height ? height : 0;
		bottom = bottom ? bottom : 0;
		var styles = mod.getWebStyle();
		styles.top = (localStorage.getItem('StatusHeightNo') * 1 + 45 + height) + 'px';
		styles.bottom = bottom + 'px';
		mui.init({
			gestureConfig: {
				doubletap: true //启用双击监听
			},
			subpages: [{
				url: subPage,
				id: subPage.split('/')[subPage.split('/').length - 1],
				styles: styles,
				extras: {
					data: datas
				}
			}]
		});
	}

	/**
	 *
	 * @param {Object} id 刷新的list控件id
	 * @param {Object} fresh 下拉刷新加载数据的方法
	 * @param {Object} addMore 上拉刷新加载数据的方法
	 */
	mod.initRefresh = function(id, fresh, addMore) {

		mui.init({
			gestureConfig:{
				longtap:true
			},
			pullRefresh: {
				container: '#refreshContainer',
				down: {
					callback: pulldownRefresh
				},
				up: {
					contentrefresh: '正在加载...',
					callback: pullupRefresh
				}
			}
		});
		/**
		 * 下拉刷新具体业务实现
		 */
		function pulldownRefresh() {
			setTimeout(function() {
				//
				var item = document.getElementById(id)
				//清除所有数据
				mod.clearChild(item);
				//					while(item.firstChild != null) {
				//						item.removeChild(item.firstChild)
				//					}
				//加载新控件
				fresh();
				mui('#refreshContainer').pullRefresh().endPulldownToRefresh(); //refresh completed
				mui('#refreshContainer').pullRefresh().refresh(true);
			}, 150);
		}
		var count = 0;
		/**
		 * 上拉加载具体业务实现
		 */
		function pullupRefresh() {
			setTimeout(function() {
				addMore();
			}, 1500);
		}
	}
	/**
	 * 预加载单个页面 在mui.plusReady里调用
	 * @param {Object} tarPage 页面路径
	 * @param {Object} interval 延迟加载时间间隔 单位毫秒 ，不输入默认为0
	 */
	mod.preload = function(tarPage, interval) {
		if(!interval) {
			interval = 0;
		}
		console.log("预加载的页面：" + tarPage)
		if(!plus.webview.getWebviewById(tarPage)) {
			//初始化预加载详情页面
			setTimeout(function() {
				mui.preload({
					url: tarPage,
					id: tarPage.split('/')[tarPage.split('/').length - 1], //默认使用当前页面的url作为id
					styles: mod.getWebStyle(),
					show: {
						anishow: 'slide-in-right',
						duration: 250
					},

					waiting: {
						title: '正在加载...'
					}
				})
			}, interval)
		}

	}
	/**
	 * 加载不需要传值的预加载页面
	 * @param {Object} tarpge
	 */
	mod.showPreloadPage = function(tarPage) {
		var targetPage = null;
		//获得目标页面
		if(!targetPage) {
			targetPage = plus.webview.getWebviewById(tarPage);

		}
		targetPage.show('slide-in-right', 250);
	}
	/**
	 * 如果目标页面未加载,需要先预加载页面
	 * 传递数值到指定页面并打开页面
	 * @param {Object} tarpage 目标页面Id
	 * @param {Object} listener 监听事件
	 * @param {Object} getDatas 获取数据的方法  return somthing
	 */
	mod.fireToPage = function(tarPage, listener, getDatas) {
		//			console.log('tarPage:' + tarPage);
		tarPage = tarPage.split('/')[tarPage.split('/').length - 1];
		var targetPage = null;
		//获得目标页面
		if(!targetPage) {
			targetPage = plus.webview.getWebviewById(tarPage);
			//				console.log(typeof(targetPage))
		}
		//触发目标页面的listener事件
		mui.fire(targetPage, listener, {
			data: getDatas()
		});
		console.log('要传的值是：' + JSON.stringify(getDatas()))
		targetPage.show('slide-in-right', 250)
	}
	/**
	 * 如果目标页面未加载,需要先预加载页面
	 * 传递数值到指定页面并打开页面
	 * @param {Object} tarpage 目标页面Id
	 * @param {Object} listener 监听事件
	 * @param {Object} datas 要传递的数据
	 */
	mod.fireToPageWithData = function(tarPage, listener, datas) {

		tarPage = tarPage.split('/')[tarPage.split('/').length - 1];
		console.log('tarPage:' + tarPage+",listener:"+listener);
		var targetPage = null;
		//获得目标页面
		if(!targetPage) {
			targetPage = plus.webview.getWebviewById(tarPage);
		}
		//触发目标页面的listener事件
		mui.fire(targetPage, listener, {
			data: datas
		});
		targetPage.show('slide-in-right', 250);
	}
	/**
	 * 事件传递 不传数据 常用于 父子页面间
	 * @param {Object} tarPage 目标页面
	 * @param {Object} listener 事件
	 */
	mod.fireToPageNone = function(tarPage, listener, datas) {
		tarPage = tarPage.split('/')[tarPage.split('/').length - 1];
		if(!datas) {
			datas = null;
		}
		//		console.log('tarPage:' + tarPage);
		var targetPage = null;
		//获得目标页面
		if(!targetPage) {
			targetPage = plus.webview.getWebviewById(tarPage);
		}
		if(targetPage) {
			//触发目标页面的listener事件
			mui.fire(targetPage, listener, {
				data: datas
			});
		} else {
			console.log('目标页面不存在' + tarPage);
		}

	}
	/**
	 * 清空子元素
	 * @param {Object} item 需清空子元素的控件
	 */
	mod.clearChild = function(item) {
		while(item.firstElementChild) {
			item.removeChild(item.firstElementChild);
		}
	}
	/**
	 * listView加载数据
	 * @param {Object} listContainer
	 * @param {Object} data
	 * @param {Object} createInner
	 */
	mod.createListView = function(listContainer, data, createInner) {
		var list = document.getElementById(listContainer);
		data.forEach(function(cell, i, data) {
			var li = document.createElement('li');
			li.className = 'mui-table-view-cell';
			li.innerHTML = createInner(cell);
			list.appendChild(li);
		})

	}
	mod.arraySingleItem = function(array) {
		var r = [];
		for(var i = 0, l = array.length; i < l; i++) {
			for(var j = i + 1; j < l; j++)
				if(array[i] === array[j]) {
					j = ++i;
				}
			r.push(array[i]);
		}
		return r;
	}
	mod.infoChanged = function() {
		events.fireToPageNone('mine.html', 'infoChanged');
		events.fireToPageNone('../cloud/cloud_home.html', 'infoChanged');
		events.fireToPageNone('../index/index.html', 'infoChanged');
		events.fireToPageNone('../cloud/cloud_home.html', 'infoChanged');
		//		events.fireToPageNone('../show/show_home_1.html', 'infoChanged');
		events.fireToPageNone('qiuzhi_home.html', 'infoChanged');
		events.fireToPageNone('aboutme_sub.html', 'infoChanged');
	}
	mod.shortForString = function(str, len) {
		if(str.length > len + 2) {
			return str.substring(0, len) + "...";
		}
		return str;
	}
	mod.shortForDate = function(fullDate) {
		var arrDate = fullDate.split(":");
		arrDate.splice(arrDate.length - 1, 1);
		var noSecond = arrDate.join(':');
		var arrSecond = noSecond.split('-');
		if(new Date().getFullYear() == arrSecond[0]) {
			arrSecond.splice(0, 1);
		}
		return arrSecond.join('-');
	}

	/**
	 * 将界面的焦点清除后再退出当前界面
	 */
	mod.blurBack = function() {
		var oldBack = mui.back;
		mui.back = function() {
			document.activeElement.blur();
			oldBack();
		}
	}
	/**
	 * 返回一个安卓手机返回键无法关闭的等待框
	 * @author 莫尚霖
	 * @param {Object} string 等待框显示的文字，默认'加载中...'
	 */
	mod.showWaiting = function(string) {
		var title = '加载中...';
		if(string) {
			title = string;
		}
		var showWaiting = plus.nativeUI.showWaiting(title, {
			back: 'none'
		});
		return showWaiting;
	}

	/**
	 * 关闭一个或所有的等待框
	 * @author 莫尚霖
	 * @param {Object} waiting 等待框对象
	 */
	mod.closeWaiting = function(waiting) {
		if(waiting) {
			waiting.close();
		} else {
			plus.nativeUI.closeWaiting();
		}
	}

	/**
	 * 创建一个子页面，并传递数据
	 * @author 莫尚霖
	 * @param {Object} mainWebviewObject 主页面的窗体
	 * @param {Object} subPageUrl 子页面的路径
	 * @param {Object} data 传递给子页面的数据
	 * @param {Object} loadedCallBack 子页面加载完成的回调
	 */
	mod.createSubAppendMain = function(mainWebviewObject, subPageUrl, data, loadedCallBack) {
		var styles = mod.getWebStyle();
		styles.top = (localStorage.getItem('StatusHeightNo') * 1 + 45) + 'px';
		var sub = plus.webview.create(subPageUrl, subPageUrl.split('/')[subPageUrl.split('/').length - 1], styles, {
			data: data
		});

		sub.addEventListener('loaded', function() {
			mainWebviewObject.append(sub);
			loadedCallBack(sub);
		});

		return sub;
	}

	/**
	 * 修改双webview下拉刷新出现的位置，在main中使用
	 * @author 莫尚霖
	 * @param {Object} top 下拉刷新距离顶部的高度
	 */
	mod.changeTopPocket = function(top) {
		setTimeout(function() {
			var toppocket = document.querySelector('.mui-pull-top-pocket');
			var height; //高度
			if(top) {
				height = top;
			} else {
				height = localStorage.getItem('StatusHeightNo') * 1 + 45;
			}
			if(toppocket) {
				document.querySelector('.mui-pull-top-pocket').style.top = height + 'px';
			} else {
				mod.changeTopPocket(height);
			}
		}, 200);
	}
	mod.getFileNameByPath = function(filePath) {
		var filePaths = filePath.split(".");
		var fileName = filePaths[filePaths.length - 1];
		return new Date().getTime() + parseInt(Math.random() * 1000) + '.' + fileName;
	}

	/**
	 * 退出登录后执行的方法
	 * @author 莫尚霖
	 */
	mod.logOff = function() {
		//清理上传下载的任务和界面
		events.fireToPageNone('storage_transport.html', 'removeAllTask');
		//清理云盘主页
		events.fireToPageNone('../cloud/cloud_home.html', 'cleanCloudHome');
		//清理科教
		events.fireToPageNone('../sciedu/sciedu_home.html', 'cleanSicEduHome');
		//清理展现
		events.fireToPageNone('../show/show_home_1.html', 'cleanShowHome');
	}

	mod.ifHaveInfo = function(info) {
		return info ? info : '暂无信息'
	}

	/**
	 *
	 * @param {Object} title 标题
	 * @param {Object} hint 提示语
	 * @param {Object} callback 确认回调
	 * @param {Object} cancelLog 取消打印信息
	 */
	mod.setDialog = function(title, hint, callback, cancelLog) {
		var btnArray = ['否', '是'];
		mui.confirm(hint, title, btnArray, function(e) {
			if(e.index == 1) {
				callback();
			} else {
				mui.toast(cancelLog)
			}
		})
	}

	mod.format = function(dateTime, format) {
		var o = {
			"M+": dateTime.getMonth() + 1, //month
			"d+": dateTime.getDate(), //day
			"h+": dateTime.getHours(), //hour
			"m+": dateTime.getMinutes(), //minute
			"s+": dateTime.getSeconds(), //second
			"q+": Math.floor((dateTime.getMonth() + 3) / 3), //quarter
			"S": dateTime.getMilliseconds() //millisecond
		};
		if(/(y+)/.test(format)) {
			format = format.replace(RegExp.$1, (dateTime.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for(var k in o) {
			if(new RegExp("(" + k + ")").test(format)) {
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	}
	mod.softIn = function(id) {
		//		if(plus.os.name == "Android") {
		//			document.getElementById(id).onfocus = function() {
		//				screen.height = plus.screen.resolutionHeight * plus.screen.scale
		//				var webHeight = plus.android.invoke(plus.android.currentWebview(), "getHeight")
		//				console.log('状态栏高度:' + plus.navigator.getStatusbarHeight() + "屏幕高度：" + screen.height + "浏览器高度：" + webHeight);
		//				var scrollHeight = parseInt(webHeight) - parseInt(screen.height) - parseInt(plus.navigator.getStatusbarHeight());
		//				console.log("实际高度：" + scrollHeight)
		//				//		document.querySelector(".mui-input-group").style.marginBottom=scrollHeight+"px";
		//				document.body.clientHeight = scrollHeight;
		//				mui(".mui-scroll-wrapper").scroll().scrollTo(0, -document.getElementById(id).offsetTop);
		//			}
		//			document.getElementById(id).onblur = function() {
		//				mui(".mui-scroll-wrapper").scroll().scrollTo(0, 0);
		//			}
		//			document.getElementById(id).oninput=function(){
		//				mui(".mui-scroll-wrapper").scroll().scrollTo(0, -document.getElementById(id).offsetTop);
		//			}
		//			window.addEventListener('resize', function() {
		//				screen.height = plus.screen.resolutionHeight * plus.screen.scale
		//				var webHeight = plus.android.invoke(plus.android.currentWebview(), "getHeight")
		//				console.log('状态栏高度:' + plus.navigator.getStatusbarHeight() + "屏幕高度：" + screen.height + "浏览器高度：" + webHeight);
		//			})
		//		}
	}
	/**
	 * 设置监听，解决area与scroll冲突问题
	 */
	mod.areaInScroll = function() {
		window.addEventListener("touchmove", function(e) {
			var target = e.target;
			if(target && target.tagName == 'TEXTAREA') {
				if(target.scrollHeight > target.clientHeight) {
					e.stopPropagation();
				} else {
					target.dispatchEvent(e);
				}
			}
		}, true);
	}

	/**
	 * 获得元素的文本
	 * @author 莫尚霖
	 * @param {Object} content
	 */
	mod.htmlGetText = function(data) {
		var ele = document.createElement('div');
		ele.style.display = 'none';
		ele.id = "html_get_text";
		document.body.appendChild(ele);
		ele.innerHTML = data;
		var content = jQuery('#html_get_text').text(); //获得文字
		ele.parentNode.removeChild(ele);
		return content;
	}

	/**
	 * 初始化强制隐藏键盘
	 * @author 莫尚霖
	 */
	mod.initHideKeyBoard = function() {
		if(plus.os.name == 'Android') {
			var Context = plus.android.importClass("android.content.Context");
			var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			var main = plus.android.runtimeMainActivity();
			var inputManger = main.getSystemService(Context.INPUT_METHOD_SERVICE);
			var Focus = plus.android.invoke(main, 'getCurrentFocus');
			//console.log('invoke ' + plus.android.invoke(main, 'getCurrentFocus'));
			//console.log('invoke ' + plus.android.invoke(Focus, 'getWindowToken'));
			var WindowToken = plus.android.invoke(Focus, 'getWindowToken');
			var hideOption = {
				manger: inputManger,
				token: WindowToken,
				type: InputMethodManager.HIDE_NOT_ALWAYS
			}
			return hideOption;
		}
	}

	/**
	 * 强制隐藏键盘需要和initHideKeyBoard配合使用
	 * @author 莫尚霖
	 * @param {Object} hideOption initHideKeyBoard 返回的数据
	 */
	mod.hideKeyBoard = function(hideOption) {
		document.activeElement.blur();
		if(plus.os.name == 'Android') {
			hideOption.manger.hideSoftInputFromWindow(hideOption.token, hideOption.type);
		}
	}

	/**
	 * 图片只加载一遍 onerror
	 * @author 莫尚霖
	 * @param {Object} image 加载失败的图片元素
	 * @param {Object} path 图片加载失败后显示的图片
	 */
	mod.imageOnError = function(image, path) {
		image.src = path;
		image.onerror = null;
	}
	/**
	 * 限制文字长度模块
	 * @param {Object} inputValue 输入的value
	 * @param {Object} length 限制的长度
	 */
	mod.limitInput = function(inputValue, length) {
		if(inputValue.length > length) {
			mui.toast("输入已超过" + length + "字，请删除多余字符");
			return true;
		}
		return false;
	}

	/**
	 * 默认webview的样式
	 */
	mod.getWebStyle = function() {
		var styles = {
			top: '0px',
			bottom: '0px',
			softinputMode: "adjustResize",
			hardwareAccelerated: false
		};
		return styles;
	}
	/**
	 * 禁止使用回车
	 * @param {Object} elem  禁止使用回车的元素
	 */
	mod.fobidEnter = function(elem) {
		elem.onkeydown = function(event) {
			console.log("键盘输入事件：" + JSON.stringify(event.keyCode))
			if(event.keyCode == 13) {
				return false;
			}
		}
	}
	/**
	 * actionsheet
	 * @param {Object} titleArray 各选项 格式如下[{title:选项1,dia：1需要显示dialog},{title:选项1,dia：0 或不填需要显示dialog}]
	 * @param {Object} cbArray 各选项回调方法数组，确认选择后的回调函数
	 */
	mod.showActionSheet=function(btnArray,cbArray){
		var len=btnArray.length;
		plus.nativeUI.actionSheet({
			buttons:btnArray,
			cancel:"取消"
		},function(e){
			var index=e.index;
				console.log("点击的index:"+index);
			if(index>0){
				if(btnArray[index-1].dia){
					mod.setDialog(btnArray[index-1].title,"确定？",cbArray[index-1],"已取消删除")
				}else{
					cbArray[index-1]();
				}
			}
		})
	}

	/**
	 * 关闭某个webview
	 * @author 莫尚霖
	 * @param {Object} webview webview的id或object
	 * @param {Object} num 动画，默认页面从屏幕中横向向右侧滑动到屏幕外关闭
	 */
	mod.closeWebview = function(webview, num) {
		//关闭已经打开的Webview窗口，需先获取窗口对象或窗口id，并可指定关闭窗口的动画
		//若操作窗口对象已经关闭，则无任何效果。
		//使用窗口id时，则查找对应id的窗口，如果有多个相同id的窗口则操作最先打开的窗口，若没有查找到对应id的WebviewObject对象，则无任何效果。
		plus.webview.close(webview, mod.getAniClose(num));
	}

	/**
	 * 获取关闭的动画
	 * @author 莫尚霖
	 * @param {Object} num 类型，默认slide-out-right
	 */
	mod.getAniClose = function(num) {
		var aniClose = '';
		var type = num || 2;//默认2
		switch(type) {
			case 0:
				aniClose = 'auto';
				//自动选择显示窗口相对于的动画效果。
				break;
			case 1:
				aniClose = 'none';
				//立即关闭页面，无任何动画效果。 此效果忽略动画时间参数，立即关闭。
				break;
			case 2:
				aniClose = 'slide-out-right';
				//页面从屏幕中横向向右侧滑动到屏幕外关闭。
				//Android - 2.2+ (支持): 默认动画时间为200ms。
				//iOS - 5.1.1+ (支持): 默认动画时间为300ms。
				break;
			case 3:
				aniClose = 'slide-out-left';
				//页面从屏幕中横向向左侧滑动到屏幕外关闭。
				//Android - 2.2+ (支持): 默认动画时间为200ms。
				//iOS - 5.1.1+ (支持): 默认动画时间为300ms。
				break;
			case 4:
				aniClose = 'slide-out-top';
				//页页面从屏幕中竖向向上侧滑动到屏幕外关闭。
				//Android - 2.2+ (支持): 默认动画时间为200ms。
				//iOS - 5.1.1+ (支持): 默认动画时间为300ms。
				break;
			case 5:
				aniClose = 'slide-out-bottom';
				//页面从屏幕中竖向向下侧滑动到屏幕外关闭。
				//Android - 2.2+ (支持): 默认动画时间为200ms。
				//iOS - 5.1.1+ (支持): 默认动画时间为300ms。
				break;
			case 6:
				aniClose = 'fade-out';
				//页面从不透明到透明逐渐隐藏关闭。
				//Android - 2.2+ (支持): 默认动画时间为200ms。
				//iOS - 5.1.1+ (支持): 默认动画时间为300ms。
				break;
			case 7:
				aniClose = 'zoom-in';
				//页面逐渐向页面中心缩小关闭。
				//Android - 2.2+ (支持): 默认动画时间为100ms。
				//iOS - 5.1.1+ (支持): 默认动画时间为100ms。
				break;
			case 8:
				aniClose = 'zoom-fade-in';
				//页面逐渐向页面中心缩小并且从不透明到透明逐渐隐藏关闭。
				//Android - 2.2+ (支持): 默认动画时间为100ms。
				//iOS - 5.1.1+ (支持): 默认动画时间为100ms。
				break;
			case 9:
				aniClose = 'pop-out';
				//页面从屏幕右侧滑出消失，同时上一个页面带阴影效果从屏幕左侧滑入显示。
				//Android - 2.2+ (支持): 默认动画时间为200ms。
				//iOS - 5.1.1+ (支持): 默认动画时间为300ms。
				break;
			default:
				break;
		}
		return aniClose;
	}
	var firstTime=null;
	/**
	 * 一段时间内只允许运行一次方法,可用于打开新界面
	 * @param {Function} callback 要运行的方法 
	 */
	mod.singleInstanceInPeriod=function(callback){
		var secondTime=null;
		if(!firstTime){
			firstTime="1234";
		}else{
			secondTime="123";
		}
		setTimeout(function(){
			firstTime=null;
		},1000)
		if(!secondTime){
			callback();
		}
	}
	return mod;

})(events || {});