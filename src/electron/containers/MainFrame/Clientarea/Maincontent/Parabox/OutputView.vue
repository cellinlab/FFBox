<template>
	<div id="output-view">
		<combobox title="容器/格式" :text="$store.state.globalParams.output.format" :list="formatsList" @change="onChange('combo', 'format', $event)"></combobox>
		<checkbox title="元数据前移" :checked="$store.state.globalParams.output.moveflags" @change="onChange('checkbox', 'moveflags', $event)"></checkbox>
		<inputbox title="剪辑起点" :value="$store.state.globalParams.output.begin" @change="onChange('output', 'begin', $event)" type="duration"></inputbox>
		<inputbox title="剪辑终点" :value="$store.state.globalParams.output.end" @change="onChange('output', 'end', $event)" type="duration"></inputbox>
		<inputbox title="输出文件名" :value="$store.state.globalParams.output.filename" @change="onChange('output', 'filename', $event)" long=true placeholder="[filedir]：文件所在目录；[filebasename]：文件基础名；[fileext]：文件扩展名" notNull=true></inputbox>
	</div>
</template>

<script>
import { formats, generator } from '@/common/formats'
import Combobox from '@/electron/components/parabox/Combobox'
import Checkbox from '@/electron/components/parabox/Checkbox'
import Inputbox from '@/electron/components/parabox/Inputbox'

export default {
	name: 'OutputView',
	components: {
		Combobox, Checkbox, Inputbox
	},
	props: {		
	},
	computed: {
		// 用途是给 template 读取，因为它不能直接读取 import 的变量
		formatsList: function () {
			return formats
		},
	},
	methods: {
		// 由子组件发生变化所触发的事件（mode 为组件类型，sName 为参数名，value 为参数值）
		onChange: function (mode, sName, value) {
			this.$store.commit('changePara', {
				type: 'output',
				key: sName,
				value
			})
		},
	}
}
</script>

<style scoped>
	#output-view {
		position: absolute;
		width: 100%;
		height: 100%;
		overflow-y: auto;
		display: flex;
		flex-wrap: wrap;
		align-items: center;	/* 一行 */
		/* align-content: space-between;	 多行 */
		justify-content: space-around;
	}

</style>
