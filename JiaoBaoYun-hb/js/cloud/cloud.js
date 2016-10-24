/**
 *  作者：444811716@qq.com
 *	时间：2016-10-20
 *  描述：云盘
 */
var cloud = (function($, mod) {

	/**
	 * 增加文件夹
	 * @param {Object} table 父元素
	 * @param {Object} data [FolderInfoList] 文件夹数组
	 * FolderInfoList:[FolderInfo] 文件夹信息数组
	 * FolderInfo：[FolderName,FolderUrl]
	 * FolderName 文件夹名字
	 * FolderUrl 文件夹路径
	 */
	mod.addFolders = function(table, data) {
		$.each(data, function(index, item) {
			var html = '';
			//右侧向右图标
			var html1 = '<a><span class="mui-navigate-right mui-media-object mui-pull-right"></span>';
			//左侧文件夹图片
			var html2 = '<img class="mui-media-object mui-pull-left" src="../../image/cloud/cloud_folder.png">';
			//文件夹名字
			var html3 = '<div class="mui-media-body"><p class="mui-ellipsis">' + item[0] + '</p></div></a>';

			html = html1 + html2 + html3;
			var li = document.createElement('li');
			li.className = 'mui-table-view-cell mui-media';
			li.id = item[1];
			li.innerHTML = html;
			table.appendChild(li);
		});
	}

	/**
	 * 增加文件
	 * @param {Object} table 父元素
	 * @param {Object} data [FilesInfoList] 文件数组
	 * FilesInfoList:[FilesInfo] 文件夹信息数组
	 * FilesInfo：[FilesName,FilesUrl]
	 * FilesName 文件名字
	 * FilesUrl 文件路径
	 */
	mod.addFiles = function(table, data) {
		$.each(data, function(index, item) {
			var classify = mod.classify(item[0]);
			var html = '';
			//文件标识
			var html1 = '<a><img class="mui-media-object mui-pull-left" src="../../image/cloud/cloud_' + classify + '.png">';
			//右侧删除图标
			var html2 = '<span class="mui-icon mui-icon-trash mui-media-object mui-pull-right"></span>';
			//右侧下载图标
			var html3 = '<span class="mui-icon mui-icon-download mui-media-object mui-pull-right"></span>';
			//文件名
			var html4 = '<div class="mui-media-body"><p class="mui-ellipsis">' + item[0] + '</p></div></a>';
			html = html1 + html2 + html3 + html4;
			var li = document.createElement('li');
			li.className = 'mui-table-view-cell mui-media';
			li.setAttribute('data-name', item[0]); //记录文件名字
			li.id = item[1]; //记录文件路径
			li.innerHTML = html;
			table.appendChild(li);
		});
	}

	/**
	 * 通过文件名后缀将文件分类
	 * @param {Object} filename 文件名
	 */
	mod.classify = function(filename) {
		//把一个字符串分割成字符串数组
		var nameList = filename.split(".");
		//获取文件后缀
		var type = nameList[nameList.length - 1];
		//转换为小写
		type = type.toLowerCase(); //转换为小写
		switch(type) {
			case 'doc':
			case 'xls':
			case 'txt':
			case 'zip':
				return type; //文档类型
				break;
			case 'avi':
			case 'wma':
			case 'asf':
			case 'wmv':
			case 'rmvb':
			case 'mp4':
			case 'swf':
				return 'video'; //视频类型
				break;
			case 'cda':
			case 'wav':
			case 'cda':
			case 'aif':
			case 'aiff':
			case 'au':
			case 'mp1':
			case 'mp2':
			case 'mp3':
			case 'ra':
			case 'rm':
			case 'ram':
			case 'mid':
			case 'Rmi':
				return 'audio'; //音频类型
				break;
			default:
				return 'file'; //未识别的文件类型
				break;
		}
	}

	return mod;
})(mui, window.cloud || {})