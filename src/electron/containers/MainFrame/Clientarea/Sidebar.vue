<template>
	<aside id="sidebar-wrapper">
		<div id="sidebar">
			<div id="sidebar-background"></div>
			<div id="sidebar-top">
				<button v-for="value in [0, 1]" :key="value" class="sidebar-selection" :class="{'sidebar-selection-selected': $store.state.listSelected == value}" @click="listselect(value)" :aria-label="['任务视图', '指令视图'][value]">
					<div class="sidebar-icon" :style="{ backgroundPositionY: `${value * 100 / 7}%` }"></div>
				</button>
			</div>
			<div id="sidebar-bottom">
				<button v-for="value in [0, 1, 2, 3, 4, 5]" :key="value" class="sidebar-selection" :class="{'sidebar-selection-selected': $store.state.paraSelected == value}" @click="paraselect(value)" :aria-label="['快捷参数', '输入参数', '视频参数', '音频参数', '效果参数', '输出参数'][value]">
					<div class="sidebar-icon" :style="{ backgroundPositionY: `${(value + 2) / 7 * 100}%` }"></div>
				</button>
			</div>
		</div>
	</aside>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	name: 'Sidebar',
	methods: {
		listselect: function (index: number) {
			this.$store.commit('listNparaSelect', index);
		},
		paraselect: function (index: number) {
			this.$store.commit('listNparaSelect', index + 2);
		},
	}
});
</script>

<style scoped>
	#sidebar-wrapper {
		position: absolute;
		height: 100%;
		width: 139px;
		overflow-y: auto;
		overflow-x: hidden;
	}
	#sidebar-wrapper::-webkit-scrollbar {
		width: 12px;
		background: transparent;
	}
	#sidebar-wrapper::-webkit-scrollbar-thumb {
		border-radius: 12px;
		background: rgba(192, 192, 192, 0.3);
	}
	#sidebar-wrapper::-webkit-scrollbar-track {
		background: hsl(210, 40%, 35%);
	}
	#sidebar {
		position: absolute;
		width: 139px;
		height: 100%;
		min-height: 432px;
		background: hsla(210, 40%, 35%, 0.8);
		overflow-x: hidden;
	}
		#sidebar-background {
			position: relative;
			width: 100%;
			height: 100%;
			box-shadow: -16px 0px 16px -16px rgba(0, 0, 0, 0.3) inset;
		}
		#sidebar-top {
			position: absolute;
			top: 0;
			width: 100%;
		}
		#sidebar-bottom {
			position: absolute;
			bottom: 0;
			width: 100%;
		}
			.sidebar-selection {
				padding: 10px 24px 10px 21px;
				/* width: 91px; */
				width: 139px;
				/* height: 28px; */
				height: 48px;
				background: none;
				border: none;
				outline: none;
				box-sizing: border-box;
				border-left: transparent 3px solid;
			}
			.sidebar-selection:hover, .sidebar-selection:focus {
				background: rgba(255, 255, 255, 0.4);
			}
			.sidebar-selection-selected, .sidebar-selection-selected:hover, .sidebar-selection-selected:focus {
				border-left: hsl(130, 75%, 50%) 3px solid;
				background: hsl(0, 0%, 92.5%);
				box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.2);
			}
			.sidebar-selection-selected .sidebar-icon {
				background-image: url('/images/sidebar-icon-colored.png');
				/* background-position-x: -3px; */
			}
			.sidebar-icon {
				width: 100%;
				height: 100%;
				background: url('/images/sidebar-icon-white.png');
				background-size: cover;
			}

</style>
