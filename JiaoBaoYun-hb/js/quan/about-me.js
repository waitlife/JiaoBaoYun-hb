/**
 * 与我相关界面
 * 逻辑部分
 * @anthor an
 */
//页码，请求第几页数据
var pageIndex = 1;
//每页条数
var pageCount = 10;
//当前留言的总条数
var totalPage = 0;
//提醒总页码
var alertTotalPage = 0;
//获取个人信息                                                        
var personalUTID;
//判断是加载更多1，还是刷新2
var flag = 2;
var msgType = 0; //消息类型
var comData = {}; //回复传值
var repliedCell;
var repliedItem; //回复的对象
//页码请求到要显示的数据，array[model_userSpaceAboutMe]
var aboutMeArray = [];
var isShowing=false;
mui.init();
mui.plusReady(function() {
	events.preload("../homework/workdetail-stu.html", 100);
	var pInfo = window.myStorage.getItem(window.storageKeyName.PERSONALINFO);
	personalUTID = pInfo.utid;
	//	initNativeObjects();
	//页码1
	pageIndex = 1;
	//请求并放置数据
	requestData();
	addReplyView();
	addReplyLisetner();
	setListener();
})
/**
 * 界面放置数据
 * @param {Object} data 请求成功后返回的数据
 */
var setData = function(data) {
	var list = document.getElementById('list-container');
	data.forEach(function(cell, i) {
		var li = document.createElement('li');
		li.className = 'mui-table-view-cell';
		li.innerHTML = createInner(cell);
		if(cell.MsgType != 6 && cell.MsgType != 3) {
			li.querySelector('.reply').cell = cell;
		}

		list.appendChild(li);
		if(li.querySelector(".refer-content")) {
			li.querySelector(".refer-content").info = cell;
		}
		if(li.querySelector(".work-notice")) {
			li.querySelector(".work-notice").info = cell;
		}
	})
}
/**
 * 创建Inner
 * @param {Object} cell
 */
var createInner = function(cell) {
	var cellData = getCellData(cell);
	if(cellData.MsgType != 6) {
		var inner =
			'<div class="cell-title">' +
			'<img class="title-img" headId="' + cellData.headID + '" src="' + ifHaveImg(cellData) + '"/>' +
			zanNoReply(cellData.MsgType) +
			'<div class="title-words">' +
			'<h5 class="title-title">' + cellData.title + '</h5>' +
			'<p class="title-words">' + events.shortForDate(cellData.time) + '</p>' +
			'</div>' +
			'</div>' +
			//最新内容
			'<p class="comment-content break-words">' + ifHave(cellData.content) + '</p>' +
			ifHaveReferContent(cellData, cell) +
			'<div class="extras">' + ifHave(cellData.messages) + '</div>';
	} else {
		var inner = '<a><div class="cell-title">' +
			'<img class="title-img" headId="' + cellData.headID + '" src="' + ifHaveImg(cellData) + '"/>' +
			//		'<span class="reply">回复</span>' +
			'<div class="title-words">' +
			'<h5 class="title-title">' + cellData.title + '</h5>' +
			'<p class="title-words">' + events.shortForDate(cellData.time) + '</p>' +
			'</div>' +
			'</div>' +
			'<p class="comment-content work-notice">' + ifHave(cellData.UserContent) + '</p>' +
			//		'<div class="refer-content">' + '<span>' + cellData.UserOwnerNick + ':</span>' + ifHave(cellData.referContent) + '</div>' +
			//		'<div class="extras">' + ifHave(cellData.messages) + '</div>'
			'</a>';
	}
	return inner;
}
var zanNoReply = function(msgType) {
	if(msgType == 3) {
		return '';
	}
	return '<span class="reply">回复</span>';
}
var ifHaveReferContent = function(cellData, cell) {
	if(cellData.referContent) {
		return '<div class="refer-content">' + addEncImg(cell.EncImgAddr) + '<div class="refer-words triple-line extra-words break-words">' + '<span>' + events.shortForString(cellData.UserOwnerNick, 6) + ':</span>' + cellData.referContent + '</div></div>'
	} else {
		return '';
	}
}
var addEncImg = function(encImg) {
	if(encImg && encImg.length > 0) {
		return '<img class="refer-img display-inlineBlock" src="' + encImg.split("|")[0] + '"/>';
	}
	return '';
}
var addReplyView = function() {
	/**
	 * 回复点击事件
	 */
	mui('.mui-table-view').on('tap', '.reply', function() {
		var replyContainer = document.getElementById('footer');
		//		replyContainer.style.display = 'block';
		//		showSoftInput('#msg-content');
		repliedCell = this.cell;
		repliedItem = this.parentElement.parentElement.querySelector(".extras");
		console.log('点击的回复包含数据：' + JSON.stringify(repliedCell));
		msgType = this.cell.MsgType;
		//		document.getElementById('msg-content').value = '';
		events.openNewWindowWithData('reply-aboutMe.html', repliedCell);
		//		replyContainer.style.top=(plus.screen.resolutionHeight-replyContainer.offsetHeight);
	})
	/**
	 * 头像点击事件
	 */
	mui('.mui-table-view').on('tap', '.title-img', function() {
		var id = this.getAttribute('headId');
		console.log(id);
		mui.openWindow({
			url: 'zone_main.html',
			id: 'zone_main.html',
			styles: {
				top: '0px', //设置距离顶部的距离
				bottom: '0px'
			},
			extras: {
				data: id,
				NoReadCnt: 0,
				flag: 0
			}

		});
	})
}
var setListener = function() {
	plus.webview.currentWebview().addEventListener("show",function(){
		isShowing=true;
	})
	plus.webview.currentWebview().addEventListener("hide",function(){
		isShowing=false;
	})
	mui(".mui-table-view").on("tap", ".refer-content", function() {
		this.info.PublisherId = this.info.UserId
		this.info.PublisherName = this.info.UserName
		this.info.TabId = this.info.SpaceId
		console.log(JSON.stringify(this.info));
		events.openNewWindowWithData('../quan/space-detail.html', jQuery.extend(this.info, { focusFlag: 0 }))
	})
	mui(".mui-table-view").on("tap", ".work-notice", function() {
		var curNotice=this.info;
		getHomeworkResult(this.info,function(data){
			if(data.HomeworkResult.UploadTime){
				events.openNewWindowWithData('../homework/homework-commented.html', jQuery.extend(curNotice,data,{ HomeworkResultId: data.HomeworkResult.HomeworkResultId, workType: 1,isNotice:true }));
//				events.fireToPageWithData("../homework/homework-commented.html","workNotice",jQuery.extend(this.info,data))
			}else{
				events.fireToPageWithData("../homework/workdetail-stu.html", "workNotice", jQuery.extend(curNotice,{isNotice:true}));
			}
		});		
	});
}
var getHomeworkResult = function(workInfo,callback) {
	var personalId=myStorage.getItem(storageKeyName.PERSONALINFO).utid;
	var wd=events.showWaiting();
	postDataPro_GetHomeworkResultStu({
		studentId: personalId, //学生Id
		classId: workInfo.ClassId, //班级群Id；
		homeworkId: workInfo.HomeworkId //作业id；
	},wd,function(data){
		wd.close();
		console.log("获取当前作业结果："+JSON.stringify(data))
		if(data.RspCode==0){
			callback(data.RspData);
		}
	})
}
/**
 * 评论成功后，加载评论
 */
var addReplyLisetner = function() {
	window.addEventListener('hasReplied', function(e) {
		var replyValue = e.detail;
		var p = document.createElement('p');
		p.className = "extra-words break-words";
		p.innerHTML = '<span>' + myStorage.getItem(storageKeyName.PERSONALINFO).unick + '</span>回复<span>' + events.shortForString(repliedCell.MaxUserName, 6) + ':</span>' + replyValue;
		repliedItem.appendChild(p);
	});
	window.addEventListener('infoChanged',function(){
		pageIndex = 1;
		document.getElementById('list-container').innerHTML='';
		requestData();
	})
}
/**
 * 
 * @param {Object} callback
 */
//var postReply = function(callback) {
//	var msgContent = document.getElementById('msg-content');
//	console.log('类型:' + msgType)
//	switch(msgType) {
//		//1为其他用户评论
//		case 1:
//			//2为评论的回复
//		case 2:
//			//3为其他用户点赞
//		case 3:
//
//			var comData = {
//				userId: pId, //用户ID
//				upperId: repliedCell.TabId, //上级评论ID
//				replyUserId: repliedCell.MaxUser, //回复ID
//				userSpaceId: repliedCell.SpaceId, //用户空间ID
//				commentContent: msgContent.value //回复内容
//			};
//			console.log('开始post回复数据' + JSON.stringify(comData));
//			var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
//			postDataPro_addUserSpaceCommentReply(comData, wd, function(data) {
//				console.log('发布回复后返回的数据：' + JSON.stringify(data))
//				wd.close();
//				if(data.RspCode == 0) {
//					callback();
//				}
//			})
//			break;
//
//			//为其他用户留言
//		case 4:
//			//5为留言的回复
//		case 5:
//			var comData = {
//				userId: pId, //用户ID
//				upperId: repliedCell.TabId, //上级评论ID
//				replyUserId: repliedCell.MaxUser, //回复ID
//				userOwnerId: repliedCell.UserOwnerId, //用户空间ID
//				msgContent: msgContent.value //回复内容
//			};
//			var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
//			postDataPro_addUserSpaceMsgReply(comData, wd, function(data) {
//				wd.close();
//				if(data.RspCode == 0) {
//					callback();
//				}
//			})
//			break;
//		default:
//			break;
//	}
//}

var ifHave = function(data) {
	return data ? data : '';
}
var ifHaveImg = function(cellData) {
	if(cellData.headImg) {
		return cellData.headImg;
	} else if(cellData.UserImg) {
		return cellData.UserImg;
	} else {
		return '../../image/utils/default_personalimage.png'
	}

}
/**
 * 根据获取信息 设置
 * @param {Object} cell 单个cell数据
 */
var getCellData = function(cell) {
	var cellData = new Object();
	cellData.MsgType = cell.MsgType;
	cellData.UserName = cell.UserName;
	if(cell.MsgType == 6) {
		cellData.headID = cell.UserId;
	} else {
		cellData.headID = cell.MaxUser;
	}
	cellData.UserImg = cell.UserImg;
	cellData.UserContent = cell.Content;
	cellData.headImg = cell.MaxUserImg;

	cellData.content = cell.MaxContent;
	cellData.referContent = cell.MsgContent;
	cellData.UserOwnerNick = cell.UserOwnerNick;
	switch(cell.MsgType) {
		//其他用户评论
		case 1:
			cellData.title = events.shortForString(cell.MaxUserName, 6) + ' 评论了我';

			break;
			//评论的回复
		case 2:
			cellData.title = events.shortForString(cell.MaxUserName, 6) + " 回复";
			break;
			//其他用户点赞
		case 3:
			cellData.title = events.shortForString(cell.MaxUserName, 6) + " 赞了我";
			break;
			//其他用户留言
		case 4:
			cellData.title = events.shortForString(cell.MaxUserName, 6) + " 给我留言";
			break;
			//留言的回复
		case 5:
			cellData.title = events.shortForString(cell.MaxUserName, 6) + " 给我留言的回复";
			break;
		case 6:
			cellData.title = events.shortForString(cell.UserName, 6) + ' 的作业提醒';
			break;
		default:
			break;
	}
	cellData.time = cell.MsgDate;
	if(cellData.MsgType != 6) {
		var messages = '';
		if(cellData.MsgType != 4) {
			if(cell.Content) {
				messages += ('<p class="extra-words break-words"><span>' + events.shortForString(cell.UserName, 6) + ':</span>' + cell.Content + '</p>')
			}
		}

		if(cell.MsgArray && cell.MsgArray.length > 0) {
			cell.MsgArray.forEach(function(msg, i, msgArray) {
				if(msg.MsgContent) {
					if(msg.MsgToName) {
						messages += ('<p class="extra-words break-words" ><span>' + events.shortForString(msg.MsgFromName, 6) + '</span>回复<span>' + events.shortForString(msg.MsgToName, 6) + ':</span>' + msg.MsgContent + '</p>');
					} else {
						messages += ('<p class="extra-words break-words" ><span>' + events.shortForString(msg.MsgFromName, 6) + ':</span>' + msg.MsgContent + '</p>');
					}
				}

			});
		}
		cellData.messages = messages;
	}

	return cellData;
}

/**
 * 请求数据
 * @param {Object} callback 请求数据后的回调
 */
function requestData() {
	if(pageIndex > 1) {
		if(pageIndex <= totalPage) {
			requireAboutMe();
		} else if(pageIndex <= alertTotalPage) {
			requireHomeworkAlert();
		}
	} else {
		requireAboutMe();
	}
}
var getRoleInfos = function(tempRspData) {
	var idsArray = [];
	for(var i in tempRspData) {
		idsArray.push(tempRspData[i].UserId);
		if(tempRspData[i].MsgType != 6) {
			idsArray.push(tempRspData[i].MaxUser);
			idsArray.push(tempRspData[i].UserOwnerId);
			for(var j in tempRspData[i].MsgArray) {
				idsArray.push(tempRspData[i].MsgArray[j].MsgFrom);
				idsArray.push(tempRspData[i].MsgArray[j].MsgTo);
			}
		}
	}
	console.log('身份数组：' + idsArray);
	if(idsArray.length > 0) {
		idsArray = events.arraySingleItem(idsArray);
		//发送获取用户资料申请
		var tempData = {
			vvl: idsArray.toString(), //用户id，查询的值,p传个人ID,g传ID串
			vtp: 'g' //查询类型,p(个人)g(id串)
		}
		console.log('tempData:' + JSON.stringify(tempData));
		var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
		//21.通过用户ID获取用户资料
		postDataPro_PostUinf(tempData, wd, function(infos) {
			wd.close();
			console.log('获取个人资料success:RspCode:' + JSON.stringify(infos));
			if(infos.RspCode == 0) {
				var rechargedData = replenishData(tempRspData, infos.RspData);
				console.log('最终数据：' + JSON.stringify(rechargedData));
				setData(rechargedData);
			}

		});
	}
};
var setCommentMsgReadByUser = function() {
	var comData = {
		userId: myStorage.getItem(storageKeyName.PERSONALINFO).utid, //用户ID
		spaceTypes: '[4,5,6,7,8]'
	}
	var wd;
	postDataPro_setCommentMsgReadByUser(comData, wd, function(data) {
		console.log('与我相关设置成已读success:RspCode:' + JSON.stringify(data));
	})

}
var replenishData = function(data, infos) {
	var hashInfos = rechargeArraysToHash(infos);
	for(var i in data) {
		data[i].UserName = hashInfos[data[i].UserId].unick;
		data[i].UserImg = hashInfos[data[i].UserId].uimg;
		if(data[i].MsgType != 6) {
			data[i].MaxUserName = hashInfos[data[i].MaxUser].unick;
			data[i].MaxUserImg = hashInfos[data[i].MaxUser].uimg;
			data[i].UserOwnerNick = hashInfos[data[i].UserOwnerId].unick;
			//		idsArray.push(tempRspData[i].MaxUser);
			for(var j in data[i].MsgArray) {
				data[i].MsgArray[j].MsgFromName = hashInfos[data[i].MsgArray[j].MsgFrom] ? hashInfos[data[i].MsgArray[j].MsgFrom].unick : '数据错误'
				data[i].MsgArray[j].MsgToName = hashInfos[data[i].MsgArray[j].MsgTo] ? hashInfos[data[i].MsgArray[j].MsgTo].unick : '数据错误'
			}
		}

	}
	return data;
}
var rechargeArraysToHash = function(infos) {
	var hash = new Object();
	infos.forEach(function(info) {
		hash[info.utid] = info;
	});
	return hash;
}

/**
 * 加载刷新
 */
events.initRefresh('list-container',
	function() {
		pageIndex = 1;
		requestData();
	},
	function() {
		console.log('请求页面：page：' + pageIndex + ',总页面：' + totalPage + '，作业提醒总页数：' + alertTotalPage);
		mui('#refreshContainer').pullRefresh().endPullupToRefresh(pageIndex >= totalPage && pageIndex >= alertTotalPage);
		if(pageIndex < totalPage || pageIndex < alertTotalPage) {
			pageIndex++;
			requestData();
		}
	});
/**
 * 获取与我相关
 */
var requireAboutMe = function() {
	var comData = {
		userId: myStorage.getItem(storageKeyName.PERSONALINFO).utid, //用户ID
		pageIndex: pageIndex + '', //当前页数
		pageSize: pageCount + '' //每页记录数
	};
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	//56.（用户空间）获取与我相关
	postDataPro_getAboutMe(comData, wd, function(data) {
		wd.close();
		console.log('获取的与我相关的数据：' + JSON.stringify(data));
		if(data.RspCode == '0000') {
			setCommentMsgReadByUser();
			totalPage = data.RspData.TotalPage;
			if(pageIndex == 1 || pageIndex <= alertTotalPage) {
				requireHomeworkAlert(data.RspData.Data);
			} else {
				getRoleInfos(data.RspData.Data)
			}

		} else {
			mui.toast(data.RspTxt);
		}
	});
}
/**
 * 获取作业提醒并和与我相关的消息合并
 * @param {Object} aboutMeData 与我相关的数据
 */
var requireHomeworkAlert = function(aboutMeData) {
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	//	userId，学生/家长Id；
	//pageIndex，页码，从1开始；
	//pageSize，每页记录数；
	postDataPro_GetHomeworkAlert({
		userId: myStorage.getItem(storageKeyName.PERSONALINFO).utid,
		pageIndex: pageIndex,
		pageSize: 5
	}, wd, function(data) {
		wd.close();
		console.log('与我相关界面获取的作业提醒：' + JSON.stringify(data));
		if(data.RspCode == 0) {
			alertTotalPage = data.RspData.TotalPage;
			if(totalPage == 0 && alertTotalPage == 0) {
				if(isShowing){
					mui.toast('暂无数据！');
				}
				return;
			}
			if(!aboutMeData) {
				aboutMeData = [];
			}
			for(var i in data.RspData.Data) {
				data.RspData.Data[i].MsgDate = new Date(data.RspData.Data[i].MsgDate).Format('yyyy-MM-dd HH:mm:ss')
			}
			//拼接数据
			var allData = aboutMeData.concat(data.RspData.Data);
			//数据排序
			allData.sort(function(a, b) {
				return -((new Date(a.MsgDate.replace(/-/g, '/')).getTime()) - (new Date(b.MsgDate.replace(/-/g, '/')).getTime()));
			})

			console.log('与我相关界面获取的所有数据:' + JSON.stringify(allData))
			//获取人员信息
			getRoleInfos(allData);
		} else {
			mui.toast(data.RspTxt);
		}
	})
}
//格式化日期
Date.prototype.Format = function(fmt) {
	var o = {
		"y+": this.getFullYear(),
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"H+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S+": this.getMilliseconds() //毫秒
	};
	for(var k in o) {
		if(new RegExp("(" + k + ")").test(fmt)) {
			if(k == "y+") {
				fmt = fmt.replace(RegExp.$1, ("" + o[k]).substr(4 - RegExp.$1.length));
			} else if(k == "S+") {
				var lens = RegExp.$1.length;
				lens = lens == 1 ? 3 : lens;
				fmt = fmt.replace(RegExp.$1, ("00" + o[k]).substr(("" + o[k]).length - 1, lens));
			} else {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			}
		}
	}
	return fmt;
}