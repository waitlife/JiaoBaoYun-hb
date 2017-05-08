/**
 * 显示音频的播放
 * @author 莫尚霖
 */
var ShowAudioUtil = (function(mod) {

	/**
	 * 音频播放器
	 */
	mod.AudioPlayer = null;
	/**
	 * 遮罩
	 */
	mod.Mask = null;
	/**
	 * 音频文件的路径和时间
	 */
	mod.fOption;

	/**
	 * 计时器id
	 */
	mod.intervalId = null;

	/**
	 * 计时
	 */
	mod.timeCount = 0;

	/**
	 * 初始化音频显示
	 */
	mod.initAudioPopover = function() {
		audio_show.style.height = plus.screen.resolutionHeight / 2 + 'px';
		audio_show.style.marginTop = plus.screen.resolutionHeight / 5 + 'px';
		//麦克风图标
		audio_icon.style.fontSize = plus.screen.resolutionWidth * 0.25 + 'px';
		audio_icon.style.lineHeight = plus.screen.resolutionHeight / 3 + 'px';
		//画布
		audio_canvas.setAttribute('width', plus.screen.resolutionWidth * 2.8 + 'px');
		audio_canvas.setAttribute('height', plus.screen.resolutionHeight / 3 * 4 + 'px');
		audio_canvas.style.width = plus.screen.resolutionWidth * 0.7 + 'px';
		audio_canvas.style.height = plus.screen.resolutionHeight / 3 + 'px';
		//初始化进度和时间
		mod.initCircle();
		//初始化监听
		mod.initListener();
	}

	/**
	 * 初始化进度和时间
	 */
	mod.initCircle = function() {
		//开始一个新的绘制路径
		audio_canvastx.beginPath();
		//设置弧线的颜色
		audio_canvastx.strokeStyle = "#808080";
		audio_canvastx.lineWidth = plus.screen.resolutionWidth * 0.25 * 0.15;
		audio_canvastx.arc(audio_option.x, audio_option.y, audio_option.r, Math.PI * (-0.5), Math.PI * 2, false);
		//按照指定的路径绘制弧线
		audio_canvastx.stroke();
		audio_canvastx.closePath();
		audio_time.innerText = '00:00';
	}

	/**
	 * 初始化播放暂停按钮
	 */
	mod.initButton = function() {
		audio_play.style.display = 'none';
		audio_pause.style.display = 'inline-block';
	}

	/**
	 * 初始化监听
	 */
	mod.initListener = function() {
		//关闭按钮
		mui('.audio-show').on('tap', '.icon-guanbi', function() {
			mod.Mask.close();
		});

		//暂停
		mui('.audio-control').on('tap', '.audio-control-pause', function() {
			this.style.display = 'none';
			mod.AudioPlayer.pause();
			clearInterval(mod.intervalId);
			mod.intervalId = null;
			audio_play.style.display = 'inline-block';
		});

		//继续播放
		mui('.audio-control').on('tap', '.audio-control-play', function() {
			this.style.display = 'none';
			mod.AudioPlayer.resume();
			mod.AudioSetInterval();
			audio_pause.style.display = 'inline-block';
		});
	}

	/**
	 * 播放音频
	 */
	mod.initAudio = function(data) {
		document.activeElement.blur();
		mui('#audioPopover').popover('show');
		document.querySelector('.mui-backdrop').style.background = 'rgba(255,255,255,0.5)';
		mod.Mask = mui.createMask(function() {
			console.log('createMaskcallback');
			if(mod.Mask != null) {
				mod.Mask = null;
				mod.closeAudio();
			}
		});
		mod.Mask.show();
		plus.key.addEventListener('backbutton', mod.closeAudio);
		mod.fOption = data;
		mod.createPlayer();
		mod.AudioControlPlay();
	}

	/**
	 * 创建音频播放器
	 */
	mod.createPlayer = function() {
		if(mod.AudioPlayer) {
			mod.AudioPlayer.stop();
		}
		mod.AudioPlayer = plus.audio.createPlayer(mod.fOption.fpath);
	}

	/**
	 * 播放音频
	 */
	mod.AudioControlPlay = function() {
		mod.AudioPlayer.play(function() {
			console.log('播放完成');
			mod.Mask.close();
		}, function(e) {
			console.log('播放失败 ' + JSON.stringify(e));
			mui.toast('播放失败 ' + e.message);
			mod.Mask.close();
		});
		mod.AudioSetInterval();
	}

	/**
	 * 计时器
	 */
	mod.AudioSetInterval = function() {
		if(mod.intervalId) {
			clearInterval(mod.intervalId);
			mod.intervalId = null;
		}
		mod.intervalId = setInterval(function() {
			var audioTime = mod.AudioPlayer.getDuration();
			if(!isNaN(audioTime) && audioTime != -1) {
				mod.fOption.time = audioTime;
			}
			//console.log('audioTime ' + audioTime);
			mod.showAudioTime(parseInt(mod.fOption.time));
		}, 1000);
	}

	/**
	 * 显示进度和时间
	 * @param {Object} count
	 */
	mod.showAudioTime = function(count) {
		mod.timeCount = mod.timeCount + 1;
		var min = (parseInt(mod.timeCount / 60)).toString(); //分钟
		var sec = (mod.timeCount - min * 60).toString(); //秒
		if(min.length == 1) {
			min = '0' + min;
		}
		if(sec.length == 1) {
			sec = '0' + sec;
		}
		mod.audioProgressBar(mod.timeCount, count);
		audio_time.innerHTML = min + ':' + sec;
	}

	/**
	 * 显示进度条
	 * @param {Object} sec
	 * @param {Object} count
	 */
	mod.audioProgressBar = function(sec, count) {
		var begin = Math.PI * (-0.5);
		var now = Math.PI * (-0.5 + 2 * (sec / count));
		audio_canvastx.beginPath();
		audio_canvastx.strokeStyle = "#1DB8F1";
		audio_canvastx.arc(audio_option.x, audio_option.y, audio_option.r, begin, now, false);
		audio_canvastx.stroke();
		audio_canvastx.closePath();
	}

	/**
	 * 关闭audio
	 */
	mod.closeAudio = function() {
		console.log('closeAudio');
		mui('#audioPopover').popover('hide');
		plus.key.removeEventListener('backbutton', ShowAudioUtil.closeAudio);
		if(mod.Mask != null) {
			mod.Mask.close();
			mod.Mask = null;
		}
		if(mod.AudioPlayer != null) {
			mod.AudioPlayer.stop();
			mod.AudioPlayer = null;
		}
		if(mod.intervalId != null) {
			clearInterval(mod.intervalId);
			mod.intervalId = null;
		}
		//初始化进度和时间
		mod.initCircle();
		//初始化按键
		mod.initButton();
		mod.timeCount = 0;
		mod.intervalId = null;
	}

	return mod;
})(window.ShowAudioUtil || {});