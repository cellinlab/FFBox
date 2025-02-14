import Vue from 'vue';
import { CombinedVueInstance } from 'vue/types/vue';
import PopupUI from './Popup.vue';
let PopupConstructor = Vue.extend(PopupUI);

export interface PopupOptions {
	message: string,
	level?: number,
}

type Instances = Array<{
	instance: CombinedVueInstance<Record<never, any> & Vue, object, object, object, Record<never, any>>,
	id: number,
}>

let instances: Instances = [];
let seed = 0;

const Popup = function (options: PopupOptions) {
	if (!options.level) {
		options.level = 0;
	}
	let id = seed++;

	let instance = new PopupConstructor({
		propsData: {
			...options,
			verticalOffset: 0,
			onClose: handleOnClose.bind(null, id),
		}
	});
	instance.$mount();
	document.body.appendChild(instance.$el);
	instances.unshift({
		id,
		instance,
	});
	// DOM 渲染完成
	Vue.nextTick(reCalcVerticalOffset);
	return instance;
};

function handleOnClose(id: number) {
	let index = instances.findIndex((item) => {
		return item.id === id;
	});
	instances.splice(index, 1);
	setTimeout(() => {
		reCalcVerticalOffset();
	}, 300);
}

function reCalcVerticalOffset() {
	for (let i = 0, totalHeight = 0; i < instances.length; i++) {
		let instance = instances[i].instance;
		instance.$props.index = i;
		instance.$props.verticalOffset = totalHeight;
		totalHeight += instances[i].instance.$el.clientHeight + 16;
	}		
}

Popup.install = function (Vue: any, options: any) {
	Vue.prototype.$popup = Popup;
}

export default Popup;