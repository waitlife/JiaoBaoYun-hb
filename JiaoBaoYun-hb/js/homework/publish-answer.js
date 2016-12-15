var personalUTID; //个人id
var role; //角色
var imgIds;
var stuSubmitAnswer;
var answerResultId;
mui.init();
mui.plusReady(function() {
	mui.previewImage();
	personalUTID = parseInt(myStorage.getItem(storageKeyName.PERSONALINFO).utid);
	window.addEventListener('roleInfo', function(e) {
		imgIds=[];
		console.log('上传答案||作业界面获取的上级页面传过来的信息：' + JSON.stringify(e.detail));
		var data = e.detail.data;
		role = data.role;
		var studentClasses = data.studentClasses;
		setCondition(role, studentClasses);
	})

	/**
	 * 通过系统相机获取图片
	 * 并显示在界面上
	 */
	events.addTap('getAnswer', function() {

			camera.getPic(camera.getCamera(), function(picPath) {
				files.getFileByPath(picPath, function(fileStream) {
					uploadFile(picPath, fileStream);
				})

			})
		})
		//删除图标的点击事件
	mui('#pictures').on('tap', '.icon-guanbi', function() {
			imgIds.splice(imgIds.indexOf(this.parentElement.imgId),1);
			//删除图片
			pictures.removeChild(this.parentElement)
		})
		//上传路径
	var server = "http://demo.dcloud.net.cn/helloh5/uploader/upload.php";
	//上传按钮点击事件
	events.addTap('post-imgs', function() {
		
		if(imgIds.length > 0) {
			//选择的科目id
			var selectSubjectID = jQuery('#subjects').val();
			//判断当前显示的是老师身份0，还是家长、学生身份1
			if(role == 2) {
				//14.发布答案,只能上传图片；
				//所需参数
				var comData = {
					teacherId: personalUTID, //教师Id
					subjectId: selectSubjectID, //科目Id， 见（一）.17. GetSubjectList()；
					fileIds: imgIds.toString() //上传文件的id串，例如“1,2”；
				};
				requestPublishAnswer(comData);
			} else {
				//判断是要学生提交答案0，还是修改答案1
				if(stuSubmitAnswer) {
					//6.	提交答案结果
					//所需参数
					var comData = {
						userId: personalUTID, //学生/家长id，
						classId: uploadTeacherModel.gid, //班级id
						studentId: personalUTID, //学生Id；
						fileIds: imgIds.toString(), //文件id数组；
						teacherId: jQuery('#receive-teachers').val(), //老师Id；
						teacherName: jQuery('#receive-teachers').find("option:selected").text() //老师名字；
					};
					requestSubmitAnswer(comData);
				} else {
					//8.修改答案结果；
					//所需参数
					var comData = {
						userId: personalUTID, //学生/家长id，
						studentId: personalUTID, //学生Id；
						answerResultId: answerResultId, //要修改的答案id；
						fileIds: imgIds, //文件id数组；
						teacherId: jQuery('#receive-teachers').val(), //老师Id；
						teacherName: jQuery('#receive-teachers').find("option:selected").text() //老师名字；
					};
					requestModifyAnswer(comData);
				}
			}
		} else {
			mui.toast('请拍照后上传');
		}
	})
})
/**
 * 
 * @param {Object} picPath
 * @param {Object} fileStream
 */
var uploadFile = function(picPath, fileStream) {
//		picPath = picPath.replace('/', '');
		var comData = {
			teacherId: personalUTID, //教师Id
			fileType: 1, //文件类型，1：图片；2：音频；3：视频；
			fileName: picPath.split('/')[1], //文件名，带后缀；
			fileStream: fileStream, //base64格式文件流；
			displayOrder: 1 //图片顺序；
		};
		var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
		postDataPro_UploadFile(comData, wd, function(data) {
			wd.close();
			console.log('上传答案||作业上传图片的返回值：' + JSON.stringify(data));
			if(data.RspCode == '0000') {
				setPic(data.RspData);
			} else {
				mui.toast('上传失败，请重新上传')
			}
		})
	}
/**
 * 
 * @param {Object} picPath 
 * //“FileId”：1，       //附件id
	//“FileName”：”xxx.png”,       //附件名
	//“FileType”：1,       //附件类型
	//“Url”：“xxx/xxx.png”       //附件url
	//“ThumbUrl”：”xxxxxxxx/xxx.png”，    //缩略图url
	//“DisplayOrder”：1                //显示顺序
 */
var setPic=function(img){
	imgIds.push(img.FileId);
//	picPath=camero.getAbsolutePath(picPath);
	var pictures = document.getElementById('pictures');
				var div = document.createElement('div');
				div.imgId=img.FileId;
				div.className = 'img-div';
				div.innerHTML = '<img src="' + img.ThumbUrl + '" data-preview-src="" data-preview-group="1"/>' +
					'<a class="mui-icon iconfont icon-guanbi"></a>'
	pictures.appendChild(div);
}
	/**
	 * 设置界面
	 * @param {Object} role
	 */
var setCondition = function(role, stuClasses) {
		var btn_post = document.getElementById('post-imgs');
		var title = document.getElementById('title');
		if(role == 2) {
			document.querySelector('.subjects-container').style.display = 'block';
			document.querySelector('.teachers-container').style.display = 'none';
			btn_post.innerText = '上传答案';
			title.innerText = '上传答案';
			requestSubjectList();
		} else {
			stuSubmitAnswer=true;
			document.querySelector('.subjects-container').style.display = 'none';
			document.querySelector('.teachers-container').style.display = 'block';
			btn_post.innerText = '上传作业';
			title.innerText = '上传作业';
			//循环遍历老师数组，将群和老师身份的拼接
			requestClassTeacherInfo(stuClasses);
		}
	}

//17.获取所有科目列表
function requestSubjectList() {
	//所需参数
	var comData = {};
	// 等待的对话框
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	//17.获取所有科目列表
	postDataPro_GetSubjectList(comData, wd, function(data) {
		wd.close();
		console.log('上传作业||答案界面获取的科目列表：' + JSON.stringify(data));
		if(data.RspCode == 0) {
			//给科目数组赋值
			subjectArray = data.RspData.List;
			var subjects = document.getElementById('publish-subjects');
			//清空数据
			events.clearChild(subjects);
			//加载选项
			subjectArray.forEach(function(subject, i) {
					var op = document.createElement('option');
					op.value = subject.Value;
					op.innerText = subject.Text;
					subjects.appendChild(op);
				})
				//给选择的科目id取第一个值
			selectSubjectID = subjectArray[0].Value;
		} else {
			mui.toast(data.RspTxt);
		}
	});
}

//循环遍历老师数组，将群和老师身份的拼接
function requestClassTeacherInfo(stuClasses) {
	//学生身份时，存储班级里的老师数组
	var classTeacherArray = [];
	// 等待的对话框
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	for(var i in stuClasses) {
		//		var tempModel = stuClasses[i];
		//所需参数
		var comData = {
			top: -1, //选择条数,-1为全部
			vvl: stuClasses[i].gid, //群ID,查询的值
			vvl1: -1 //类型,0家长,1管理员,2老师,3学生,-1全部
		};
		//13.通过群ID获取群对象资料【model_groupStus】
		postDataPro_PostGusers(comData, wd, function(data) {
			console.log('上传答案||作业界面获取的资料数据：' + JSON.stringify(data))
			wd.close();
			if(data.RspCode == 0) {
				var tempArray = data.RspData; //[{"stuid":19,"gid":14,"stuname":"10群学1","stuimg":"","mstype":3}]
				//循环得到的资料数组，
				for(var m in tempArray) {
					//找到当前的老师
					if(tempArray[m].mstype == 1 || tempArray[m].mstype == 2) {
						//将班级信息，添加到老师model
						for(var n in stuClasses) {
							//群号相同
							if(tempArray[m].gid == stuClasses[n].gid) {
								//将群名添加到群资料model中
								tempArray[m].gname = stuClasses[n].gname;
								if(classTeacherArray.indexOf(tempArray[m]) < 0) {
									//添加到数组中
									classTeacherArray.push(tempArray[m]);
								}
								break;
							}
						}
					}
				}
				setTeachers(classTeacherArray);
			} else {
				mui.toast(data.RspTxt);
			}
		});
	}
}
var setTeachers = function(teaInfos) {
	var teaContainer = document.getElementById('receive-teachers');
	events.clearChild(teaContainer);
	teaInfos.forEach(function(teaInfo, i) {
			var op = document.createElement('option');
			op.value = teaInfo.utid;
			op.innerText = teaInfo.ugnick;
			teaContainer.appendChild(op);
		})
		//	for(var i in teaInfos){
		//		
		//	}
}

//所需参数
//				var comData = {
//					teacherId: personalUTID, //教师Id，如果为学生，userId: personalUTID,
//					fileType: '1', //文件类型，1：图片；2：音频；3：视频；
//					filename: '', //文件名，带后缀；
//					fileStream: '', //base64格式文件流；
//					displayOrder: '' //图片顺序；
//				};

//11.上传文件；逻辑：如果是图片类型，同时生成缩略图
function requestUploadFileTeacher(comData) {
	// 等待的对话框
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	//11.上传文件；逻辑：如果是图片类型，同时生成缩略图
	postDataPro_UploadFile(comData, wd, function(data) {
		wd.close();
		console.log('11.postDataPro_UploadFile:RspCode:' + data.RspCode + ',RspData:' + JSON.stringify(data.RspData) + ',RspTxt:' + data.RspTxt);
		if(data.RspCode == 0) {
			//						“FileId”：1，       //文件id
			//						“FileName”：”xxx.png”,       //文件名
			//						“FileType”：1,       //文件类型
			//						“Url”：“xxx/xxx.png”       //文件url
			//						“ThumbUrl”：”xxxxxxxx/xxx.png”，    //缩略图url
			//						“DisplayOrder”：1                //显示顺序
		} else {
			mui.toast(data.RspTxt);
		}
	});
}

//所需参数
//				var comData = {
//					userId: personalUTID, //学生ID
//					fileType: '1', //文件类型，1：图片；2：音频；3：视频；
//					filename: '', //文件名，带后缀；
//					fileStream: '', //base64格式文件流；
//					displayOrder: '' //图片顺序；
//				};

//5.	上传文件；逻辑：如果是图片类型，同时生成缩略图，学生
function UploadFileStudent(comData) {
	// 等待的对话框
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	//5.	上传文件；逻辑：如果是图片类型，同时生成缩略图
	postDataPro_UploadFileStu(comData, wd, function(data) {
		wd.close();
		console.log('5.postDataPro_UploadFileStu:RspCode:' + data.RspCode + ',RspData:' + JSON.stringify(data.RspData) + ',RspTxt:' + data.RspTxt);
		if(data.RspCode == 0) {
			//						“FileId”：1，       //文件id
			//						“FileName”：”xxx.png”,       //文件名
			//						“FileType”：1,       //文件类型
			//						“Url”：“xxx/xxx.png”       //文件url
			//						“ThumbUrl”：”xxxxxxxx/xxx.png”，    //缩略图url
			//						“DisplayOrder”：1                //显示顺序
		} else {
			mui.toast(data.RspTxt);
		}
	});
}

//14.发布答案,只能上传图片；老师
function requestPublishAnswer(comData) {
	// 等待的对话框
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	//14.发布答案,只能上传图片；
	postDataPro_PublishAnswer(comData, wd, function(data) {
		wd.close();
		console.log('14.postDataPro_PublishAnswer:RspCode:' + data.RspCode + ',RspData:' + JSON.stringify(data.RspData) + ',RspTxt:' + data.RspTxt);
		if(data.RspCode == 0) {

		} else {
			mui.toast(data.RspTxt);
		}
	});
}

//6.	提交答案结果，学生
function requestSubmitAnswer(comData) {
	// 等待的对话框
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	//6.	提交答案结果
	postDataPro_SubmitAnswerResult(comData, wd, function(data) {
		wd.close();
		console.log('提交答案||作业界面学生提交作业返回值：'+JSON.stringify(data))
		if(data.RspCode == 0) {
			stuSubmitAnswer=false;
			answerResultId=data.RspData.AnswerResultId
			document.getElementById('post-imgs').innerText='修改答案';
		} else {
			mui.toast(data.RspTxt);
		}
	});
}

//8.修改答案结果；学生
function requestModifyAnswer(comData) {
	// 等待的对话框
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	//8.修改答案结果；
	postDataPro_ModifyAnswerResult(comData, wd, function(data) {
		wd.close();
		console.log('8.postDataPro_ModifyAnswerResult:RspCode:' + data.RspCode + ',RspData:' + JSON.stringify(data.RspData) + ',RspTxt:' + data.RspTxt);
		if(data.RspCode == 0) {

		} else {
			mui.toast(data.RspTxt);
		}
	});
}