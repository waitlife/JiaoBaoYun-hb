/**
 * 微课获取课程列表功能模块
 */
var course_list = (function(mod) {
	/**
	 * 获取数据
	 * @param {Int} pageIndex 页码
	 * @param {View} listContainer 放置数据的容器
	 * @param {Function} callback 回调
	 */
	mod.getData = function(pageIndex, listContainer, callback) {
		console.log('pageFlag =' + pageFlag);
		//个人信息
		var personal = window.myStorage.getItem(window.storageKeyName.PERSONALINFO);
		//所需参数
		var comData = {
			userId: personal.utid, //用户ID,登录用户
			pageIndex: pageIndex, //当前页数
			pageSize: '10' //每页记录数,传入0，获取总记录数
		};
		// 等待的对话框
		var wd = events.showWaiting();
		if(pageFlag == 1) { //关注0，全部1
			//1.获取所有课程
			postDataMCPro_getAllCourses(comData, wd, function(data) {
				wd.close();
				console.log('1.获取所有课程:' + data.RspCode + ',RspData:' + JSON.stringify(data.RspData) + ',RspTxt:' + data.RspTxt);
				if(data.RspCode == 0) {
					//总页数
					totalPage = data.RspData.TotalPage;
					pageIndex++;
					if(freshFlag == 1) { //刷新
						//清除节点
						document.getElementById('list-container').innerHTML = "";
						courseArray = data.RspData.Data;
						if(data.RspData.Data.length == 0) {
							mui.toast('没有数据');
						}
					} else { //加载更多
						//合并数组
						courseArray = courseArray.concat(data.RspData.Data);
					}
					if(mui(".mui-table-view-cell").length < 10) {
						mui(".mui-pull-loading")[0].innerHTML = "";
					}
					callback(pageIndex, data.RspData.Data, listContainer);
				} else {
					mui.toast(data.RspTxt);
				}
			});
		} else { //关注0，全部1
			//2.获取所有关注的课程
			postDataMCPro_getAllFocusCourses(comData, wd, function(data) {
				wd.close();
				console.log('2.获取所有关注的课程:' + data.RspCode + ',RspData:' + JSON.stringify(data.RspData) + ',RspTxt:' + data.RspTxt);
				if(data.RspCode == 0) {
					//总页数
					totalPage = data.RspData.TotalPage;
					pageIndex++;
					if(freshFlag == 1) { //刷新
						//清除节点
						document.getElementById('list-container').innerHTML = "";
						courseArray = data.RspData.Data;
						if(data.RspData.Data.length == 0) {
							mui.toast('没有数据');
						}
					} else { //加载更多
						//合并数组
						courseArray = courseArray.concat(data.RspData.Data);
					}
					if(mui(".mui-table-view-cell").length < 10) {
						mui(".mui-pull-loading")[0].innerHTML = "";
					}
					callback(pageIndex, data.RspData.Data, listContainer);
				} else {
					mui.toast(data.RspTxt);
				}
			});
		}

	};
	/**
	 * 放置数据
	 * @param {Int} pageIndex 页码
	 * @param {Object} data 要放置的数据
	 * @param {View} listContainer 放置数据的container
	 */
	mod.setData = function(pageIndex, data, listContainer) {
		if(pageIndex == 1) {
			listContainer.innerHTML = "";
		}
		var fragment = document.createDocumentFragment();
		for(i in data) {
			var cell = data[i];
			mod.createCell(cell, fragment);
		}
		listContainer.appendChild(fragment);
		mod.endFresh();
	}
	/**
	 * 
	 * @param {Object} cell
	 * @param {Object} fragment
	 */
	mod.createCell = function(cell, fragment) {
		var li = document.createElement("li");
		li.className = "mui-table-view-cell";
		li.innerHTML = mod.getCellInner(cell);
		fragment.appendChild(li);
		li.info=cell;
		li.querySelector(".input-btn").info=cell;
	}
	/**
	 * 
	 * @param {Object} cell
	 */
	mod.getCellInner = function(cell) {

		return '<div class="course-container">' +
			'<img class="course-img" src="' + cell.CoursePic + '"/>' +
			'<div class="course-detail">' +
			'<div class="courseName-button">' +
			'<p class="coursre-name">' + cell.CourseName + '</p>' +
			mod.getBtn(cell) +
			'</div>' +
			'<p class="course-info">' + cell.SecName + '</p>' +
			'</div>' +
			'</div>';

	}
	/**
	 * 获取按钮
	 * @param {Object} cell
	 */
	mod.getBtn = function(cell) {
		if(cell.IsFocused) {
			return '<input type="button" class="input-btn btn-focused" value="已关注"/>'
		}
		return '<input type="button" class="input-btn btn-unfocus" value="关注"/>'
	}
	/**
	 * 点击关注按钮
	 * @param {Object} model
	 */
	mod.clickFocuseBtn = function(model) {
		//个人信息
		var personal = window.myStorage.getItem(window.storageKeyName.PERSONALINFO);
		//所需参数
		var comData = {
			userId: personal.utid, //用户ID,登录用户
			courseId: model.TabId, //课程ID
			status: !model.IsFocus //关注状态，0 不关注，1 关注
		};
		//6.设置对某个课程关注
		postDataMCPro_setCourseFocus(comData, wd, function(data) {
			wd.close();
			console.log('6.设置对某个课程关注:' + data.RspCode + ',RspData:' + JSON.stringify(data.RspData) + ',RspTxt:' + data.RspTxt);
			if(data.RspCode == 1) { //成功

			} else {
				mui.toast(data.RspTxt);
			}
		});
	}
	/**
	 * 
	 */
	mod.initFresh = function() {
		//上拉下拉注册
		mui(".mui-scroll-wrapper .mui-scroll").pullToRefresh({
			down: {
				callback: function() {
					freshContainer = this;
					oldPageIndex = pageIndex;
					freshFlag = 1;
					pageIndex = 1;
					wd = events.showWaiting(); //2.获取符合条件的专家信息
					mod.getData(pageIndex, document.getElementById("list-container"), mod.setData);
				}
			},
			up: {
				callback: function() {
					freshContainer = this;
					console.log('我在底部pageIndex:' + pageIndex + ':总页数:' + totalPage);
					if(pageIndex < totalPage) {
						freshFlag = 2;
						wd = events.showWaiting();
						//						pageIndex++;
						mod.getData(pageIndex, document.getElementById("list-container"), mod.setData);
					} else {
						freshContainer.endPullUpToRefresh();
						mui(".mui-pull-loading")[0].innerHTML = "没有更多了";
					}
				}
			}
		});
	}
	mod.endFresh = function() {
		events.closeWaiting();
		console.log("freshFlag:" + freshFlag);
		if(freshContainer) {
			console.log("freshContainer className" + freshContainer.className)
			if(freshFlag == 1) {
				console.log("走这吗？？？？？");
				freshContainer.endPullDownToRefresh();
				mui(".mui-pull-loading")[0].innerText = "上拉加载更多";
			} else if(freshFlag == 2) {
				freshContainer.endPullUpToRefresh();
			} else {
				mui(".mui-pull-loading")[0].innerText = "上拉加载更多";
			}
		}
		freshFlag = 0;
	}
	mod.setListener=function(){
		document.getElementById("list-container").addEventListener("click",function(e){
			var item=e.target;
			console.log("item.className:"+item.className);
			console.log("item.info:"+JSON.stringify(item.info));
			switch(item.className){
				case "input-btn btn-unfocus":
				case "input-btn btn-focused":
				
				break;
				case "":
				case "":
				case "":
				default:
				 
				break;
			}
		},false)
		mui(".mui-table-view").on("tap",".course-detail",function(){
			console.log("点击事件");
		})
	}
	return mod;
})(course_list || {})