<template>
	<div id="titlebar" role="标题栏" :aria-label="titlebarText">
		<div id="titlebar-background" :class="progressColor" :style="{width: progressWidth, opacity: progressOpacity}"></div>
		<div id="titlebar-icons" :style="{left: iconsLeft}">
			<div id="icon-long" :style="{opacity: -progressOpacity + 1}"></div>
			<div id="icon-square" :style="{opacity: progressOpacity}"></div>
		</div>
		<div id="title" :style="{left: titleLeft}">{{ titlebarText }}</div>
		<button id="updatecheck-button" aria-label="点击更新" v-if="newVersion" :style="{ left: newVersionLeft }" @mouseenter="handleMouseEnter($event, newVersionText)" @mouseleave="handleMouseLeave()" @click="gotoWebsite">
			有新版本
		</button>
		<div id="titlebar-control">
			<button @click="minimum()" aria-label="最小化" @mouseenter="handleMouseEnter($event, '最小化')" @mouseleave="handleMouseLeave()">
				<div id="minimum"></div>
			</button>
			<button @click="windowmode()" aria-label="最大化/还原" @mouseenter="handleMouseEnter($event, '最大化/还原')" @mouseleave="handleMouseLeave()">
				<div id="windowmode"></div>
			</button>
			<button @click="close()" aria-label="关闭窗口" @mouseenter="handleMouseEnter($event, '关闭窗口')" @mouseleave="handleMouseLeave()">
				<div id="close"></div>
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';

import { version, buildNumber } from "@/types/constants";
import { FFBoxVersion, NormalApiWrapper, Server, WorkingStatus } from '@/types/types';
import nodeBridge from "@/electron/bridge/nodeBridge";

interface Data {
	isMaximized: boolean;
	newVersion: null | FFBoxVersion;
}

export default Vue.extend<Data, any, any, any>({
	name: 'Titlebar',
	data: () => { return {
		isMaximized: false,
		newVersion: null,
	}},
	computed: {
		workingStatusNProgress: function () {
			let currentServer: Server = this.$store.getters.currentServer;
			if (!currentServer) {
				return {
					workingStatus: WorkingStatus.stopped,
					progress: 0,
				};
			}
			return {
				workingStatus: currentServer.workingStatus,
				progress: currentServer.progress,
			};
		},
		progressOpacity: function () {	// 暂停、运行状态下输出 1，否则 0
			return this.workingStatusNProgress.workingStatus ? 1 : 0;
		},
		progressColor: function () {	// 暂停状态下为黄色，否则绿色
			return this.workingStatusNProgress.workingStatus == -1 ? 'titlebar-background-yellow' : 'titlebar-background-green';
		},
		progressWidth: function () {	// 暂停、运行状态下输出宽度，否则 0
			let mode: 'indeterminate' | 'normal' | 'paused' | 'none' | 'error' = 'indeterminate';
			switch (this.workingStatusNProgress.workingStatus) {
				case WorkingStatus.running:
					mode = 'normal';
					break;
				case WorkingStatus.paused:
					mode = 'paused';
					break;
				case WorkingStatus.stopped:
					mode = 'none';
					break;
			}
			nodeBridge.remote?.getCurrentWindow().setProgressBar(this.workingStatusNProgress.progress * 0.99 + 0.01, {mode});
			return this.workingStatusNProgress.workingStatus ? this.workingStatusNProgress.progress * 100 + '%' : 0;
		},
		titleLeft: function () {		// 暂停、运行状态下输出左侧，否则中间
			return this.workingStatusNProgress.workingStatus ? '88px' : '50%';
		},
		iconsLeft: function () {		// 暂停、运行状态下输出左侧，否则中间
			return this.workingStatusNProgress.workingStatus ? '24px' : 'calc(50% - 64px)';
		},
		newVersionLeft: function () {
			let extraRight = (version + (process.env.NODE_ENV !== 'production' ? ' (dev)' : '')).length * 8;
			return this.workingStatusNProgress.workingStatus ? `${300 + extraRight}px` : `calc(50% + ${72 + extraRight}px)`;
		},
		titlebarText: function () {		// 暂停、运行状态下输出进度，否则没有
			return (this.workingStatusNProgress.workingStatus ? '进度：' + (this.workingStatusNProgress.progress * 100).toFixed(3) + ' % - ' : '') + '丹参盒 v' + version;
		},
		newVersionText: function () {
			if (this.newVersion) {
				return `发现新版本：${this.newVersion!.version}<br />点击跳转到官网下载`;
			}
		}
	},
	methods: {
		// 最小化按钮
		minimum: function () {
			nodeBridge.remote?.getCurrentWindow().minimize();
		},
		// 窗口模式按钮
		windowmode: function () {
			let currentWindow = nodeBridge.remote?.getCurrentWindow();
			if (!currentWindow) {
				return;
			}
			if (currentWindow.isMaximized() || this.isMaximized == true) {
				currentWindow.unmaximize();
				this.isMaximized = false;
			} else {
				currentWindow.maximize();
				this.isMaximized = true;
			}
		},
		// 关闭按钮
		close: function () {
			this.$store.commit('closeConfirm');
		},
		// 处理 tooltip
		handleMouseEnter: function (event: MouseEvent, text: string) {
			this.$tooltip.show({
				text,
				position: {
					right: `calc(100% - ${event.target!.getBoundingClientRect().left}px)`,
					top: event.target!.offsetTop + event.target!.offsetHeight + 'px',
				},
			});
		},
		handleMouseLeave: function () {
			this.$tooltip.hide();
		},
		gotoWebsite: function () {
			nodeBridge.jumpToUrl('http://FFBox.ttqf.tech/');
		}
	},
	mounted: function () {
		fetch('http://ffbox.ttqf.tech/update/check', {
			method: 'GET',
		}).then((response) => {
			response.text().then((data_s) => {
				let data = JSON.parse(data_s) as NormalApiWrapper<FFBoxVersion>;
				if (data.status === 200 && data.data.buildNumber > buildNumber) {
					console.log('发现新版本：' + data.data.version);
					this.newVersion = data.data;
				}
			})
		})
	}
});

</script>

<style scoped>
	#titlebar {
		position: relative;
		top: 0;
		width: 100%;
		height: 28px;
		z-index: 50;
		background: linear-gradient(180deg, hsl(0deg, 0%, 100%), hsl(0, 0%, 92.5%));
		box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1 ),
					0  4px  8px -3px rgba(0, 0, 0, 0.1 );
		-webkit-app-region: drag;
	}
		#titlebar-background {
			transition: width 0.5s ease-out, opacity 0.7s linear;
			position: absolute;
			height: 100%;
		}
		.titlebar-background-green {
			background: linear-gradient(180deg, hsl(120, 100%, 85%), hsl(120, 100%, 80%));
			box-shadow: 0px 15px 30px -7.5px hsla(120, 100%, 80%, 0.7);
		}
		.titlebar-background-yellow {
			background: linear-gradient(180deg, hsl(50, 100%, 85%), hsl(50, 100%, 80%));
			box-shadow: 0px 15px 30px -7.5px rgba(255, 238, 153, 0.7);
		}
			#titlebar-icons {
				position: absolute;
				transition: left 0.3s;
				height: 28px;
				width: 56px;
			}
			#icon-long, #icon-square {
				transition: opacity 0.25s;
				position: absolute;
				top: 0;
				height: 28px;
				width: 56px;
			}
			#icon-long {
				background: url(/images/icon-long.png) center/contain no-repeat;
			}
			#icon-square {
				background: url(/images/icon-square.png) center/contain no-repeat;
			}

		#title {
			position: absolute;
			top: 3px;
			width: 320px;
			font-size: 16px;
			text-align: left;
			transition: left 0.3s;
		}

		#updatecheck-button {
			position: absolute;
			top: 4px;
			height: 18px;
			left: calc(50% + 88px);
			width: 72px;
			font-size: 12px;
			line-height: 18px;
			border-radius: 9px;
			border: hsl(45deg, 100%, 50%) 1px solid;
			color: hsl(45deg, 100%, 50%);
			outline: none;
			box-sizing: content-box;
			font-family: inherit;
			background: white;
			-webkit-app-region: no-drag;
			cursor: pointer;
			transition: left 0.3s, box-shadow 0.1s;
		}
		#updatecheck-button:hover, #updatecheck-button:focus {
			box-shadow: 0px 0px 5px hsla(45deg, 100%, 50%, 0.4);
		}
		#updatecheck-button:active {
			border: hsl(40deg, 100%, 45%) 1px solid;
			color: hsl(40deg, 100%, 45%);
			box-shadow: 0px 0px 5px hsla(40deg, 100%, 45%, 0.4);
		}

		#titlebar-control {
			position: absolute;
			top: 0;
			right: 0;
			width: 90px;
			height: 28px;
			margin-right: 10px;
			display: flex;
		    justify-content: space-around;
		    align-items: center;
			-webkit-app-region: no-drag;
		}
			button {
				width: 28px;
				height: 28px;
				padding: 0;
				border: none;
				background: none;
				outline: none;
				display: flex;
				justify-content: center;
				align-items: center;
				text-align: center;
			}
			button>div {
				width: 14px;
				height: 14px;
				border-radius: 14px;
				border: solid 1px;
				font-size: 0;
			}
			button>#minimum {
				background: #29cc44;
				border-color: #21a336;
			}
			button>#windowmode {
				background: #ffcc33;				
				border-color: #cca329;
			}
			button>#close {
				background: #ff5959;
				border-color: #cc4747;
			}
			button:hover>#minimum, button:focus>#minimum {
				background: linear-gradient(180deg, #4df880, #29cc44);
			}
			button:active>#minimum {
				background: #21a336;
			}
			button:hover>#windowmode, button:focus>#windowmode {
				background: linear-gradient(180deg, #fff860, #ffcc33);
			}
			button:active>#windowmode {
				background: #cca329;
			}
			button:hover>#close, button:focus>#close {
				background: linear-gradient(180deg, #ffa3a3, #ff5959);
			}
			button:active>#close {
				background: #cc4747;
			}


</style>
