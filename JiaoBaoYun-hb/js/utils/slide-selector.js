/**
 * 城市滑动选择
 * @requires jQuery.js slide_navigatian.css
 */
var slide_selector = (function(mod) {
	var thisCities; //城市数组
	var thisPagePath; //对应的界面
	var citiesIndex = 0; //滑动计数，左滑-1，右滑+1；
	var curCity; //当前城市
	var subWvs;
	var self;
	/**
	 * 放置城市数据
	 * @param {Object} cities //城市数组
	 */
	mod.setCities = function(cities) {
		thisCities = cities;
		if(cities.length > 0) {
			var fragment = document.createDocumentFragment();
			if(cities.length == 1) { //城市数组为1
				var p = document.createElement('p');
				p.className = 'single-city';
				p.innerText = cities[0];
				fragment.appendChild(p);
			} else { //城市长度为1以上
				var div = document.createElement('div');
				div.className = 'cities-selector';
				div.innerHTML = getCitiesInner(cities);
				console.log("页面获取的innerHTML:" + div.innerHTML)
				fragment.appendChild(div);
			}
			document.querySelector('.mui-content').appendChild(fragment);
		}
	}

	/**
	 * 获取不同的页面
	 * @param {Object} pagePath 要加载的html路径
	 */
	mod.getPages = function(cities, subPage) {
			thisCities = cities;
			self = plus.webview.currentWebview();
			mod.pages = [];
			// 子窗口样式
			var subStyles = {
				top: "0px",
				bottom: "50px"
			};
			// 创建子页面
			for(var i = 0; i < 2; i++) {
				/**
				 * 创建窗口对象
				 */
				var subWv = plus.webview.getWebviewById(subPage + i);
				if(!subWv) {
					subWv = plus.webview.create(subPage, subPage + i, subStyles, {
						index: i
					});
					if(i > 0) {
						subWv.hide("none");
					}
				}
				// 窗口对象添加至数组
				mod.pages.push(subWv);

				self.append(subWv);
			}
			curCity = thisCities[0];
			console.log("当前的城市为：" + curCity.aname + ",当前的pageId为：" + mod.pages[0].id);
			setTimeout(function() {
				mui.fire(mod.pages[0], 'cityInfo', curCity);
			}, 2000)

			addSwipe();
		}
		/**
		 * 加载左滑、右滑事件
		 */
	var addSwipe = function() {
			window.addEventListener("swipe_event", function(event) {
				// 获取方向以及索引
				console.log('滑动事件监听')
				var direction = event.detail.direction;
				if(direction == "left") {
					swipe(1);
				} else {
					swipe(0);
				}
			})
		}
		/**
		 * 滑动事件的实现
		 * @param {Object} type 0 右滑 1左滑
		 * @param {Object} index 
		 */
	var swipe = function(type) {
		var showPage;
		//		getRealCityIndex();
		var curPage = mod.pages[citiesIndex % 2];
		if(type == 1) { //右滑
			showPage = mod.pages[(citiesIndex + 1) % 2];
			citiesIndex++;
		} else { //左滑
			showPage = mod.pages[(citiesIndex + 2 - 1) % 2];
			citiesIndex--;
		}
		getCurrentCity();
		/**
		 * 向index页面传递数据
		 */
		getRealCityIndex();
		curCity.index = citiesIndex;
		sendPageChanged();
		curPage.hide(); //隐藏当前页面
		showPage.show("fade-in"); //显示要显示的页面;
		console.log("滑动模式：" + type + ",滑动后的要显示的页面id:" + showPage.id);
		mui.fire(showPage, 'cityInfo', curCity); //向显示界面传值
	}
	var getRealCityIndex = function() {
		if(citiesIndex >= 0) {
			citiesIndex = citiesIndex % thisCities.length;
		} else {
			citiesIndex = citiesIndex % thisCities.length + thisCities.length;
		}
	}
	var sendPageChanged = function() {
			getCurrentCity();
			events.fireToPageNone('../index/index.html', 'showCity', curCity)
		}
		/**
		 * 设置点点的显示
		 */
	var setIndicatorShow = function(index) {
			jQuery(".mine-active").className = "mine-indicator";
			if(citiesIndex >= 0) {
				jQuery(".mine-slider-indicator").children().eq(index).className = "mine-indicator mine-active";	
			}
		}
		/**
		 * 获取当前城市
		 */
	var getCurrentCity = function() {
		if(citiesIndex >= 0) {
			curCity = thisCities[citiesIndex % thisCities.length];
		} else {
			curCity = thisCities[citiesIndex % thisCities.length + thisCities.length];
		}
	}
	mod.addSwipeListener = function() {
		console.log(44444444444)	
			var parent = plus.webview.currentWebview().parent();
			// 左滑事件
			document.addEventListener("swipeleft", function(event) {
				var angle = event.detail.angle;
				angle = Math.abs(angle);
				console.log('左滑事件：' + angle);
				/**
				 * 控制滑动的角度，为避免误操作，可自定义限制滑动角度；
				 */
				if(angle > 100 && angle < 185) {
					parentEvent(parent, "left");
				}
			});
			// 右滑事件
			document.addEventListener("swiperight", function(event) {

				var angle = event.detail.angle;
				angle = Math.abs(angle);
				console.log('右滑事件：' + angle);
				/**
				 * 控制滑动的角度，为避免误操作，可自定义限制滑动角度；
				 */
				if(angle < 15) {
					parentEvent(parent, "right");
				}
			});
		}
		/**
		 * 触发父窗口自定义事件
		 * @param {Object} wvobj 目标窗口对象
		 * @param {Number} index 索引值
		 * @param {String} direction 方向
		 */
	function parentEvent(wvobj, direction) {
		/**
		 * 触发自定义事件
		 */
		mui.fire(wvobj, "swipe_event", {
			direction: direction
		});
	}
	return mod;
})(slide_selector || {})