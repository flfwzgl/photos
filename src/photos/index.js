
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
				show: false,
				loaded: false,
				// el: ''
			}
		})

		this._inteceptor = inteceptor;

		this._init();
	}

	_init () {
		let box = this.box = document.createElement('div');
		box.className = 'photos-box';

		box.innerHTML = mainTpl();

		box.__transition__ = new Transition(box);
		this._bindEvent();
	}

	get length () {
		return this._list.length;
	}

	show (n = 0) {
		if (!this.length) return console.error('opt.list 是空数组!');

		this.box.__transition__.show(document.body, 'photos-drop');
		this.trigger('show');

		this.showImage(n);

		return this;
	}

	async showImage (n) {
		let l = this.length;

		if (n >= l) {
			n %= l;
		} else if (n < 0) {
			n = l + n % l;
		}

		this.index = n;
		let prev = this.cur;
		prev && prev.el.__transition__.hide();

		let obj = this.cur = this._list[n];

		// if (obj.show) return;
		// obj.show = true;

		if (!obj.el) {
			let el = obj.el = document.createElement('div');
			el.__transition__ = new Transition(el);
			el.className = 'photos_img';
			el.innerHTML = `
				<div class="photos_loading">
					<svg viewBox="25 25 50 50" class="circular">
						<circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
					</svg>
				</div>
			`
		}


		if (obj.loaded) {
			obj.el.__transition__.show(this.box);
		} else {
			this.box.appendChild(obj.el);
		}


		let url = obj.url;
		if (this._inteceptor)
			url = obj.url = await this._inteceptor(obj.key);

		try {
			let {img, width, height} = await loadImg(url);
			let {w, h} = getAppropriateSize(width, height);

			obj.el.__origin__ = {width, height};
			obj.el.style.cssText = `width: ${w}px; height: ${h}px; margin-left: ${-w/2}px; margin-top: ${-h/2}px`;

			obj.el.innerHTML = '';
			obj.el.appendChild(img);
			obj.loaded = true;
		} catch (e) {}

	}

	hide () {
		let tr = this.box.__transition__;
		tr && tr.hide();
	}

	_bindEvent () {
		bind(this.box, 'click', e => {
			e.stopPropagation();

			e = e.target;
			if (hasCls(e, 'photos_icon--close')) {
				this.hide();
			} else if (hasCls(e, 'photos_icon--arrow-right')) {
				this.showImage(++this.index);
			} else if (hasCls(e, 'photos_icon--arrow-left')) {
				this.showImage(--this.index);
			}

		});

		this.box.onselectstart = e => e.preventDefault();
	}
}


const getAppropriateSize = (w, h) => {
	let r = w / h;
	let cw = document.documentElement.clientWidth;
	let ch = document.documentElement.clientHeight;

	let ratio = cw / ch;

	let padding = ch > 700 ? 100 : 50;

	if (r > ratio && w > cw - padding * 2) {
		w = cw - padding;
		h = w / r;
	} else if (r < ratio && h > ch - padding * 2) {
		h = ch - padding;
		w = h * r;
	}

	return {w, h};
}



