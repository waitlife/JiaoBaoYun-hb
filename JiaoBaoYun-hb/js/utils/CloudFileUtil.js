var CloudFileUtil = (function($, mod) {

	/**
	 * 获取当前的网络连接状态
	 * @param {Object} callback 回调callback(data)
	 */
	mod.getCurrentType = function(callback) {
		var num = plus.networkinfo.getCurrentType();
		var str = '';
		switch(num) {
			case plus.networkinfo.CONNECTION_UNKNOW: //0
				str = '网络连接状态未知';
				break;
			case plus.networkinfo.CONNECTION_NONE: //1
				str = '未连接网络';
				break;
			case plus.networkinfo.CONNECTION_ETHERNET: //2
				str = '有线网络';
				break;
			case plus.networkinfo.CONNECTION_WIFI: //3
				str = '无线WIFI网络';
				break;
			case plus.networkinfo.CONNECTION_CELL2G: //4
				str = '蜂窝移动2G网络';
				break;
			case plus.networkinfo.CONNECTION_CELL3G: //5
				str = '蜂窝移动3G网络';
				break;
			case plus.networkinfo.CONNECTION_CELL4G: //6
				str = '蜂窝移动4G网络';
				break;
		}
		var data = {
			code: num,
			type: str
		}
		callback(data);
	}

	/**
	 * 获取七牛下载的token
	 * @param {Object} url 获取下载token路径
	 * @param {Object} successCB
	 * @param {Object} errorCB
	 */
	mod.getQNDownToken = function(url, successCB, errorCB) {
		console.log('getQNDownToken:' + url);
		mui.ajax(url, {
			async: false,
			//			data: {
			//				Key: QNFileName
			//			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒
			//			headers: {
			//				'Content-Type': 'application/json'
			//			},
			success: function(data) {
				//服务器返回响应
				successCB(data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理
				errorCB(xhr, type, errorThrown);
			}
		});
	}

	/**
	 * 创建下载任务
	 * @param {Object} url 文件路径
	 * @param {Object} filename 下载到本地的路径
	 * @param {Object} uploadCompletedCallBack 下载完成时的回调
	 * @param {Object} onStateChangedCallBack 下载任务状态监听的回调
	 * @param {Object} successCallBack 下载任务创建成功的回调
	 */
	mod.download = function(url, filename, DownloadCompletedCallback, onStateChangedCallBack, successCallBack) {
			var dtask = plus.downloader.createDownload(url, {
					filename: filename //下载文件保存的路径
				},
				/**
				 * 下载完成时的回调
				 * @param {Object} download 下载任务对象
				 * @param {Object} status 下载结果状态码
				 */
				function(download, status) {
					// 下载完成
					DownloadCompletedCallback(download, status);
				}
			);
			//下载状态变化的监听
			dtask.addEventListener("statechanged",
				/**
				 * 下载状态变化的监听
				 * @param {Object} download 下载任务对象
				 * @param {Object} status 下载结果状态码
				 */
				function(download, status) {
					onStateChangedCallBack(download, status);
				}
			);
			successCallBack(dtask);
			//dtask.start();
		}
		/**
		 * 创建下载任务
		 * @param {Object} url 要下载文件资源地址
		 * @param {Object} filename 下载文件保存的路径
		 * @param {Object} callback 下载成功回调
		 */
	mod.downloadFile = function(url, fileName, callback) {
		var dtask = plus.downloader.createDownload(url, {
				filename: fileName //下载文件保存的路径
			},
			/**
			 * 下载完成时的回调
			 * @param {Object} download 下载任务对象
			 * @param {Object} status 下载结果状态码
			 */
			function(d, status) {
				// 下载完成
				if(status == 200) {
					callback(d);
					console.log("Upload success" + d.filename);
					//上传失败
				} else {
					mui.toast('上传失败,请重新上传:'+status);
				}
			}
		);
		//下载状态变化的监听
		task.addEventListener("statechanged", onStateChanged, false);
		dtask.start();
	}

	/**
	 * 获取上传到七牛的uptoken
	 * @param {Object} url 获取token的url
	 * @param {Object} QNFileName 存放到七牛的文件名
	 * @param {Object} successCB 成功的回调successCB(data)
	 * @param {Object} errorCB 失败的回调errorCB(xhr, type, errorThrown);
	 */
	mod.getQNUpToken = function(url, QNFileName, successCB, errorCB) {
		mui.ajax(url, {
			async: false,
			data: {
				Key: QNFileName
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒
			//			headers: {
			//				'Content-Type': 'application/json'
			//			},
			success: function(data) {
				//服务器返回响应
				successCB(data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理
				errorCB(xhr, type, errorThrown);
			}
		});
	}
	/**
	 * 
	 * @param {Object} url
	 * @param {Object} data
	 * @param {Object} successCB
	 * @param {Object} errorCB
	 */
	mod.getQNUpTokenWithManage=function(url,data,successCB, errorCB){
		mui.ajax(url, {
			async: false,
			data: data,//请求参数
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒
			success: function(data) {
				//服务器返回响应
				successCB(data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理
				errorCB(xhr, type, errorThrown);
			}
		});
	}

	/**
	 * 创建上传任务
	 * @param {Object} fPath 文件路径
	 * @param {Object} QNUptoken 七牛上传token
	 * @param {Object} uploadCompletedCallBack 上传完成时的回调
	 * @param {Object} onStateChangedCallBack 上传任务状态监听的回调
	 * @param {Object} successCallBack 上传任务创建成功监听的回调
	 */
	mod.upload = function(fPath, QNUptoken, QNFileName, uploadCompletedCallBack, onStateChangedCallBack, successCallBack) {
			//console.log('upload:' + fPath);
			var uid = Math.floor(Math.random() * 100000000 + 10000000).toString();
			var scope = "private";
			var task = plus.uploader.createUpload("http://upload.qiniu.com/", {
					method: "POST"
				},
				/**
				 * 上传任务完成的监听
				 * @param {Object} upload 上传任务对象
				 * @param {Object} status 上传结果状态码，HTTP传输协议状态码，如果未获取传输状态则其值则为0，如上传成功其值通常为200。
				 */
				function(upload, status) {
					uploadCompletedCallBack(upload, status);
				}
			);
			task.addData("key", QNFileName);
			//task.addData("scope", scope + ':' + type);
			task.addData("token", QNUptoken);
			task.addFile(fPath, {
				"key": "file",
				"name": "file"
			});
			//上传状态变化的监听
			task.addEventListener("statechanged",
				/**
				 * 上传状态变化的监听
				 * @param {Object} upload 上传任务对象
				 * @param {Object} status 上传结果状态码，HTTP传输协议状态码，如果未获取传输状态则其值则为0，如上传成功其值通常为200。
				 */
				function(upload, status) {
					onStateChangedCallBack(upload, status);
				}, false);
			//console.log('upload2:' + fPath + '|' + type + "|" + QNUptoken);
			successCallBack(task);
			//task.start();
		}
	/**
	 * 
	 * @param {Object} path 要上传文件的目标地址
	 * @param {Object} fileName 本地路径
	 * @param {Object} QNUptoken 上传token
	 * @param {Object} callback 回调函数
	 */
	mod.uploadFile = function(path, fileName,QNUptoken, callback) {
			//console.log('upload:' + fPath);
			var task = plus.uploader.createUpload("http://upload.qiniu.com/", {
					method: "POST"
				},
				/**
				 * 上传任务完成的监听
				 * @param {Object} upload 上传任务对象
				 * @param {Object} status 上传结果状态码，HTTP传输协议状态码，如果未获取传输状态则其值则为0，如上传成功其值通常为200。
				 */
				function(upload, status) {
					 callback(upload, status);
				}
			);
			task.addData("key", path);
			//task.addData("scope", scope + ':' + type);
			task.addData("token", QNUptoken);
			task.addFile(fileName, {
				"key": "file",
				"name": "file"
			});
			//上传状态变化的监听
			task.addEventListener("statechanged", onStateChanged, false);
			task.start();
		}
		// 监听上传任务状态
	function onStateChanged(upload, status) {
		console.log('mui上传状态：' + upload.state)
		if(upload.state == 4 && status == 200) {
			// 上传完成
			console.log("Upload success: " + upload.getFileName());
		}
	}

	/**
	 * 批量删除七牛的文件
	 * @param {Object} Url 批量删除文件的地址
	 * @param {Object} fileUrl 所有的文件路径'['url1','url2']'
	 * @param {Object} successCB 成功的回调
	 * @param {Object} errorCB 失败的回调
	 */
	mod.BatchDelete = function(Url, fileUrl, successCB, errorCB) {
		console.log('BatchDelete:' + Url + '|' + fileUrl);
		mui.ajax(Url, {
			async: false,
			data: {
				Paths: fileUrl
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒
			//			headers: {
			//				'Content-Type': 'application/json'
			//			},
			success: function(data) {
				//服务器返回响应
				successCB(data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理
				errorCB(xhr, type, errorThrown);
			}
		});
	}

	return mod;
})(mui, window.ColudFileUtil || {});