<template>
	<view class="nl-audio-player" :style="audioPlayerStyle" hover-class="none" hover-stop-propagation>
		<view v-if="showPlayBtn" class="nl-audio-player__control" hover-class="none" hover-stop-propagation>
			<view class="nl-audio-player__control--btn" :class="{ playing: isPlaying }" hover-class="none" hover-stop-propagation :style="playBtnStyleStr" @click="togglePlay" show-palyer></view>
		</view>
		<view class="nl-audio-player__progress" :style="dateSideStyle">
			<view v-if="showDate && dateMode === 'top'" class="date-top-wrap" :style="dateStyleStr">{{ currentTime }} / {{ totalTime }}</view>
			<view v-if="showDate && dateMode === 'side'" class="date-side-left-wrap" :style="dateStyleStr">
				{{ currentTime }}
			</view>
			<view id="nlAudioPlayerProgressWrap" class="progress-wrap" :style="barWrapStyle" @click="seek">
				<view class="progress-bar" :style="progressBarStyle"></view>
				<view class="progress-dot" :style="progressDotStyle" @touchstart="startDrag" @touchmove="dragging" @touchend="endDrag"></view>
			</view>
			<view v-if="showDate && dateMode === 'side'" class="date-side-right-wrap" :style="dateStyleStr">
				{{ totalTime }}
			</view>
			<view v-if="showDate && dateMode === 'bottom'" class="date-bottom-wrap" :style="dateStyleStr">
				<text>{{ currentTime }}</text>
				<text>{{ totalTime }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'NlAudioPlayer',
		props: {
			src: {
				type: String,
				required: true,
			},
			duration: {
				type: Number,
			},
			height: {
				type: [String, Number],
				default: '6px',
			},
			size: {
				type: [String, Number],
				default: 16,
			},
			volume: {
				type: Number,
				default: 1,
			},
			loop: {
				type: Boolean,
				default: false,
			},
			autoplay: {
				type: Boolean,
				default: false,
			},
			playbackRate: {
				type: Number,
				default: 1,
			},
			showDate: {
				type: Boolean,
				default: true,
			},
			dateMode: {
				type: String,
				default: 'side',
			},
			showPlayBtn: {
				type: Boolean,
				default: true,
			},
			playBtnStyle: {
				type: Object,
				default: () => {},
			},

			barStyle: {
				type: Object,
				default: () => {},
			},
			barBgStyle: {
				type: Object,
				default: () => {},
			},
			dotStyle: {
				type: Object,
				default: () => {},
			},

			dateStyle: {
				type: Object,
				default: () => {},
			},
			playerStyle: {
				type: Object,
				default: () => ({
					padding: '30rpx',
					backgroundColor: '#fff',
					borderRadius: '16rpx',
					boxShadow: '0 4rpx 20rpx rgba(0, 0, 0, 0.1)',
					margin: '26rpx',
				}),
			},
		},
		data() {
			return {
				innerAudioContext: null,
				isPlaying: false,
				progress: 0,
				currentTime: '00:00',
				totalTime: '00:00',
				isDragging: false,
				progressWidth: 0,
			}
		},
		created() {
			this.initAudio()
		},
		mounted() {
			this.updateProgressWidth()
			uni.onWindowResize(() => this.updateProgressWidth)
		},
		beforeDestroy() {
			this.innerAudioContext && this.innerAudioContext.destroy()
			uni.offWindowResize(this.updateProgressWidth)
		},
		computed: {
			audioPlayerStyle() {
				return this.formatStyle(this.playerStyle)
			},
			progressDotStyle() {
				const size = this.addUnit(this.size)
				return this.formatStyle({ ...this.dotStyle, width: size, height: size, left: this.progress + '%' })
			},
			progressBarStyle() {
				return this.formatStyle({ ...this.barStyle, width: this.progress + '%', height: this.addUnit(this.height) })
			},
			barWrapStyle() {
				const obj = { ...this.barBgStyle, height: this.addUnit(this.height) }
				if (this.dateMode === 'side') {
					obj.flex = 1
				}
				return this.formatStyle(obj)
			},
			dateSideStyle() {
				if (this.dateMode !== 'side') return ''

				return `display: flex;align-items: center`
			},
			playBtnStyleStr() {
				return this.formatStyle(this.playBtnStyle)
			},
			dateStyleStr() {
				return this.formatStyle(this.dateStyle)
			},
		},
		methods: {
			updateProgressWidth() {
				const query = uni.createSelectorQuery().in(this)
				query
					.select('#nlAudioPlayerProgressWrap')
					.boundingClientRect(rect => {
						this.progressWidth = rect.width
					})
					.exec()
			},
			initAudio() {
				this.innerAudioContext = uni.createInnerAudioContext()
				this.innerAudioContext.volume = this.volume
				this.innerAudioContext.playbackRate = this.playbackRate
				this.innerAudioContext.src = this.src
				if (this.duration) {
					this.totalTime = this.formatTime(this.duration)
				}

				this.innerAudioContext.onPlay(() => {
					this.isPlaying = true
				})

				this.innerAudioContext.onPause(() => {
					this.isPlaying = false
				})

				this.innerAudioContext.onStop(() => {
					this.isPlaying = false
				})

				this.innerAudioContext.onEnded(() => {
					this.progress = 0
					this.currentTime = '00:00'

					if (this.loop) {
						this.innerAudioContext.play()
						return
					}
					this.isPlaying = false
				})

				this.innerAudioContext.onError(err => {
					console.error('音频加载错误:', err)
				})

				this.innerAudioContext.onTimeUpdate(() => {
					if (!this.isDragging) {
						this.updateProgress()
					}
					if (this.totalTime === '00:00' && this.innerAudioContext.duration) {
						this.totalTime = this.formatTime(this.innerAudioContext.duration)
						this.$emit('onCanplay', { duration: this.innerAudioContext.duration })
					}
				})

				this.innerAudioContext.onCanplay(e => {
					// 部分安卓机型需要延迟获取duration
					let intervalID = setInterval(() => {
						if (this.innerAudioContext.duration !== 0) {
							clearInterval(intervalID)
							this.totalTime = this.formatTime(this.innerAudioContext.duration)
							this.$emit('onCanplay', { duration: this.innerAudioContext.duration })
							if (this.autoplay) {
								this.innerAudioContext.play()
							}
						}
					}, 200)
				})
			},
			togglePlay() {
				if (this.isPlaying) {
					this.innerAudioContext.pause()
				} else {
					this.innerAudioContext.play()
				}
			},
			updateProgress() {
				const currentTime = this.innerAudioContext.currentTime || 0
				const duration = this.innerAudioContext.duration || 0

				if (duration > 0) {
					this.progress = Math.min(100, (currentTime / duration) * 100)
					this.currentTime = this.formatTime(currentTime)
				}
			},
			formatTime(seconds) {
				const minutes = Math.floor(seconds / 60)
				const secs = Math.floor(seconds % 60)
				return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
			},
			seek(e) {
				if (this.isDragging || !this.progressWidth) return

				const query = uni.createSelectorQuery().in(this)
				query
					.select('#nlAudioPlayerProgressWrap')
					.boundingClientRect(rect => {
						if (rect) {
							const touchX = e.touches ? e.touches[0].clientX - rect.left : e.changedTouches[0].clientX - rect.left
							const percent = Math.max(0, Math.min(100, (touchX / rect.width) * 100))

							this.progress = percent

							if (this.innerAudioContext.duration) {
								const seekTime = (percent / 100) * this.innerAudioContext.duration
								this.innerAudioContext.seek(seekTime)

								if (!this.isPlaying) {
									this.innerAudioContext.play()
								}
							}
						}
					})
					.exec()
			},
			startDrag(e) {
				this.isDragging = true
				this.innerAudioContext.pause()
			},
			dragging(e) {
				if (!this.isDragging || !this.progressWidth) return

				const query = uni.createSelectorQuery().in(this)
				query
					.select('#nlAudioPlayerProgressWrap')
					.boundingClientRect(rect => {
						if (rect) {
							const touchX = e.touches[0].clientX - rect.left
							const percent = Math.max(0, Math.min(100, (touchX / rect.width) * 100))

							this.progress = percent

							if (this.innerAudioContext.duration) {
								const seekTime = (percent / 100) * this.innerAudioContext.duration
								this.currentTime = this.formatTime(seekTime)
							}
						}
					})
					.exec()
			},
			endDrag() {
				if (!this.isDragging) return

				this.isDragging = false

				if (this.innerAudioContext.duration) {
					const seekTime = (this.progress / 100) * this.innerAudioContext.duration
					this.innerAudioContext.seek(seekTime)

					if (this.isPlaying) {
						this.innerAudioContext.play()
					}
				}
			},
			play() {
				this.innerAudioContext.play()
			},
			pause() {
				this.innerAudioContext.pause()
			},
			setVolume(num) {
				if (!/^(0(\.\d+)?|1(\.0+)?)$/.test(num)) {
					throw new Error('音量应为数字，范围 0~1。')
				}
				if (num < 0 || num > 1) {
					return
				}
				this.innerAudioContext.volume = num
			},
			setPlaybackRate(num) {
				this.innerAudioContext.playbackRate = num
			},
			getAudioContext() {
				return this.innerAudioContext
			},
			isNumber(value) {
				return /^[\+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(value)
			},
			addUnit(value = 'auto') {
				value = String(value)
				return this.isNumber(value) ? `${value}px` : value
			},
			formatStyle(styleObj) {
				if (!styleObj) return ''

				return Object.keys(styleObj)
					.map(key => {
						// 将小驼峰转换为中横线命名
						const kebabCaseKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
						const value = styleObj[key]
						return `${kebabCaseKey}: ${value};`
					})
					.join(' ')
			},
		},
	}
</script>

<style scoped>
	.nl-audio-player {
		display: flex;
		align-items: center;
	}
	.nl-audio-player__progress {
		flex: 1;
	}
	.date-bottom-wrap {
		display: flex;
		justify-content: space-between;
		margin-top: 20rpx;
		color: #999;
	}
	.date-top-wrap {
		text-align: right;
		color: #999;
		margin-bottom: 20rpx;
	}
	.date-side-left-wrap {
		color: #999;
		padding-right: 32rpx;
	}
	.date-side-right-wrap {
		color: #999;
		padding-left: 20rpx;
	}

	.control-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}

	.progress-wrap {
		height: 6px;
		background-color: #e4e7ed;
		border-radius: 3px;
		position: relative;
	}

	.progress-bar {
		height: 100%;
		background-color: #409eff;
		border-radius: 3px;
		position: absolute;
		left: 0;
		top: 0;
	}

	.progress-dot {
		width: 16px;
		height: 16px;
		background-color: #fff;
		border-radius: 50%;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		touch-action: none;
	}

	.nl-audio-player__control--btn {
		position: relative;
		width: 30px;
		height: 30px;
		background-color: #d0d0d0;
		border-radius: 50%;
		margin-right: 30rpx;
	}

	/* 播放状态 - 三角形图标 */
	.nl-audio-player__control--btn::before {
		content: '';
		position: absolute;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 12px solid white;
		top: 50%;
		left: 55%;
		transform: translate(-50%, -50%);
	}

	/* 暂停状态 - 两条竖线图标 */
	.nl-audio-player__control--btn::after {
		content: '';
		position: absolute;
		width: 3px;
		height: 14px;
		background: white;
		border-radius: 2px;
		left: 32%;
		top: 50%;
		transform: translateY(-50%);
		opacity: 0;
		box-shadow: 8px 0 0 white;
	}

	/* 播放状态时的样式 */
	.nl-audio-player__control--btn.playing::before {
		opacity: 0;
	}

	.nl-audio-player__control--btn.playing::after {
		opacity: 1;
	}
</style>
