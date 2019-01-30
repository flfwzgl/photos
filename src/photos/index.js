
import './css/photos.less';


import {
	Transition,
	Event,
	bind,
	hasCls,
	loadImg
} from './util';

import mainTpl from './tpl/main';

export default class Photos extends Event {
	constructor (opt = {}) {
		super();

		let {
			list,
			inteceptor
		} = opt;

		if (!Array.isArray(list))
			throw new TypeError('opt.list must be an array!');
		
		if (inteceptor && typeof inteceptor !== 'function')
			throw new TypeError('opt.inteceptor must be a function!');

		this._list = list.map((k, i) => {
			return {
				index: i,
				key: k,
				url: k,
				loaded: false,
			}
		})

		this._inteceptor = inteceptor;

		this._init();
	}

	_init () {
		let el = this.el = document.createElement('div');
		el.className = 'photos-box';

		el.innerHTML = mainTpl();

		el.__transition__ = new Transition(el);
		this._bindEvent();
	}

	get length () {
		return this._list.length;
	}

	show (n = 0) {
		if (!this.length) return console.error('opt.list 是空数组!');

		this.el.__transition__.show(document.body, 'photos-drop');
		this.trigger('show');

		this._showImage(n);

		return this;
	}

	async _showImage (n) {
		n = Math.max(0, n);
		n = Math.min(n, this._list.length - 1);
		let obj = this._list[n];

		let url = obj.url;
		if (this._inteceptor)
			url = obj.url = await this._inteceptor(obj.key);

		try {
			await loadImg(url);
			obj.loaded = true;
		} catch (e) {}

	}

	hide () {
		let tr = this.el.__transition__;
		tr && tr.hide();
	}

	_bindEvent () {
		bind(this.el, 'click', e => {
			e.stopPropagation();

			e = e.target;
			if (hasCls(e, 'photos_icon--close')) {
				this.hide();
			}

		});

		this.el.onselectstart = e => e.preventDefault();
	}
}
