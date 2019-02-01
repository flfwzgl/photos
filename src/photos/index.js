
import './css/photos.less';


import {
	Transition,
	Event,
	bind,
	unbind,
	hasCls,
	noop,
	delay,
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

		this.serial = box.getElementsByClassName('photos_switch_serial')[0];

		box.__transition__ = new Transition(box)//.on('visible', _ => console.log('open')).on('hide', _ => console.log('close'))
		this._bindEventToBox();
		this._bindEvent();
	}

	get list () {
		return this._list;
	}

	get length () {
		return this.list.length;
	}

	get index () {
		return this._index;
	}

	show (n) {
		if (!this.length) return console.error('opt.list 是空数组!');

		this.box.__transition__.show('photos-drop');
		this.trigger('visible');

		this.showImg(n || this.index || 0);

		return this;
	}


	async _loadImg (obj) {
		let url = obj.url;
		if (this._inteceptor)
			url = obj.url = await this._inteceptor(obj.key);

		try {
			let {img, width, height} = await loadImg(url);
			obj.el.__origin__ = {width, height};

			setImgStyle(obj.el);

			obj.el.innerHTML = '';
			obj.el.appendChild(img);
			obj.loaded = true;
		} catch (e) {
			console.log(e);
			// console.error(`${obj.url} load error!`)
		}
	}

	async _preLoadImg () {
		var i = 1;
		while (i <= 5) {
			let n = this._getAppropriateIndex(this.index + i++);
			let obj = this.list[n];
			this._initPhotoImg(obj);
			await this._loadImg(obj);
		}
	}

	_getAppropriateIndex (i) {
		let l = this.length;
		return i >= l
			? i % l
			: (i < 0 ? l + i % l : i)
	}

	_initPhotoImg (obj) {
		if (!obj.el) {
			let el = obj.el = document.createElement('div');
			el.__transition__ = new Transition(el);
			el.className = 'photos_img';
			el.dataset.id = obj.index;
			el.innerHTML = `
				<div class="photos_loading">
					<svg viewBox="25 25 50 50" class="circular">
						<circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
					</svg>
				</div>
			`
		}

		// obj.el.__transition__
		// 	.on('visible', _ => {
		// 		obj.el.drag();
		// 	})
		// 	.on('hidden', _ => {
		// 		obj.el.dragReset();
		// 	})
	}

	async showImg (i) {
		let n = this._getAppropriateIndex(i);

		this.serial.innerHTML = `${n + 1} / ${this.length}`;

		if (this.index === n) return;

		this._index = n;
		let obj = this.list[n];
		this._initPhotoImg(obj);

		let cur = this.cur;
		if (cur) {
			let name = i > cur.index ? 'photos-slide-left' : 'photos-slide-right';
			cur.el.__transition__.hide(name);
			console.log(cur.index, 'hide', cur.el.outerHTML);

			obj.el.__transition__.show(name, this.box);
			console.log(obj.index, 'show')
		} else {
			this.box.appendChild(obj.el);
			// obj.el.drag();
		}

		

		await this._loadImg(this.cur = obj);
		this._preLoadImg();
	}

	hide () {
		let tr = this.box.__transition__;
		tr && tr.hide('photos-drop');
	}

	_bindEvent () {
		bind(this.box, 'click', e => {
			e.stopPropagation();

			e = e.target;
			if (hasCls(e, 'photos_icon--close')) {
				this.hide();
			} else if (hasCls(e, 'photos_icon--arrow-left')) {
				this.showImg(this.index - 1);
			} else if (hasCls(e, 'photos_icon--arrow-right')) {
				this.showImg(this.index + 1);
			}

		});

		this.box.onselectstart = e => e.preventDefault();
	}

	_bindEventToBox () {
		let keyupFn;
		this.box.__transition__
			.on('visible', _ => {
				bind(document, 'keyup', keyupFn = e => {
					switch (e.keyCode) {
						case 37:
						case 38:
							this.showImg(this.index - 1);
							break;

						case 39:
						case 40:
							this.showImg(this.index + 1);
							break;
					}
				});

				bind(window, 'resize', _ => setImgStyle(this.cur.el));
			})
			.on('hidden', _ => {
				unbind(document, 'keyup', keyupFn);
			})

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

const setImgStyle = el => {
	if (!el.__origin__) return;

	let {width, height} = el.__origin__;
	let {w, h} = getAppropriateSize(width, height);
	el.style.cssText = `width: ${w}px; height: ${h}px; margin-left: ${-w/2}px; margin-top: ${-h/2}px`;
}



