/**
 * 求知子页面界面逻辑
 */
var pageIndex = 1;
var channelInfo;
mui.init();
mui.plusReady(function() {
		events.preload("qiuzhi-question.html", 200);
		events.preload("qiuzhi-answerDetail.html", 300);
		window.addEventListener('channelInfo', function(e) {
				console.log('求知子页面获取的 :' + JSON.stringify(e.detail.data))
				channelInfo = e.detail.data;
				requestChannelList(channelInfo);
				events.clearChild(document.getElementById('list-container'))
			})
			//加载h5刷新方式
		h5fresh.addRefresh(function() {
			pageIndex = 1;
			//刷新的界面实现逻辑
			requestChannelList(channelInfo);
		})
		setListener();
	})
	/**
	 * 请求专家数据
	 */
	/**
	 * 放置专家数据
	 */
	/**
	 * 请求求知数据
	 */
	//4.获取所有符合条件问题
function requestChannelList(channelInfo) {
	//所需参数
	var comData = {
		askTitle: '', //问题标题,用于查找，可输入部分标题
		channelId: channelInfo.TabId, //话题ID,传入0，获取所有话题数据
		pageIndex: pageIndex, //当前页数
		pageSize: 10 //每页记录数,传入0，获取总记录数
	};
	// 等待的对话框
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	//4.获取所有符合条件问题
	postDataQZPro_getAsksByCondition(comData, wd, function(data) {
		wd.close();
		console.log('获取所有符合条件问题:' + JSON.stringify(data));
		if(data.RspCode == 0) {
			setChannelList(data.RspData.Data);
		} else {
			mui.toast(data.RspTxt);
		}
	});
}

/**
 * 放置求知数据
 */
var setChannelList = function(data) {
	console.log('求知主界面加载的数据信息：' + JSON.stringify(data));
	var list = document.getElementById('list-container');
	for(var i in data) {
		var li = document.createElement('li');
		li.className = "mui-table-view-cell";
		li.innerHTML = getInnerHTML(data[i]);
		list.appendChild(li);
	}
}
var getInnerHTML = function(cell) {
	var inner = '<a>' +
		'<div class="channel-info">' +
		'<p><span></span>来自话题:' + cell.AskChannel + '</p>' +
		'</div>' +
		'<div class="ask-container">' +
		'<h4 class="ask-title" askId="' + cell.TabId + '">' + cell.AskTitle + '</h4>' +
		'<p class="answer-content" answerId="' + cell.AnswerId + '">' + cell.AnswerContent + '</p>' +
		'</div>' +
		'<div class="extra-info"></div>' +
		'<p>' + cell.IsLikeNum + '赞·' + cell.CommentNum + '评论·关注<p>' +
		'</a>'
	return inner;
}

/**
 * 上拉加载的实现方法
 */
var pullUpFresh = function() {

	}
	/**
	 * 各种监听事件
	 */
var setListener = function() {
	events.addTap('submit-question', function() {
			events.openNewWindow('qiuzhi-newQ.html');
		})
		//标题点击事件
	mui('.mui-table-view').on('tap', '.ask-title', function() {
		events.fireToPageNone('qiuzhi-questionSub.html', 'askId', this.getAttribute('askId'));
		plus.webview.getWebviewById('qiuzhi-question.html').show();
	})
	mui('.mui-table-view').on('tap', '.answer-content', function() {
		events.fireToPageNone('qiuzhi-answerDetailSub.html', 'answerId', this.getAttribute('answerId'));
		plus.webview.getWebviewById('qiuzhi-answerDetail.html').show();
	})
}