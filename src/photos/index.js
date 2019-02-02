
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
import loadingTpl from './tpl/loading';

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
		this.wrap = box.getElementsByClassName('photos_img-wrap')[0];

		this._transition = new Transition(box)//.on('visible', _ => console.log('open')).on('hide', _ => console.log('close'))
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

		this._transition.show('photos-drop');

		n = Math.random() * this.length | 0;

		setTimeout(_ => {
			this.trigger('visible');
			this.showImg(n || this.index || 0);
		})

		return this;
	}


	async _loadImg (obj) {
		let url = obj.url;
		if (this._inteceptor) {
			let p = this._inteceptor(obj.key);
			url = obj.url = p instanceof Promise ? await p : p;	
		}

		try {
			let {img, width, height} = await loadImg(url);
			obj.origin = {width, height};

			this._setImgStyle(obj);

			obj.loaded = true;
			obj.el.innerHTML = '';
			obj.el.appendChild(img);

			this._setDrag(obj);
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
		if (obj.el) return;

		let el = obj.el = document.createElement('div');
		el.className = 'photos_img';
		el.dataset.id = obj.index;
		el.innerHTML = loadingTpl();

		obj.adapted = {width: 500, height: 500};
		obj.transition = new Transition(el);
	
		let self = this;
		obj.transition
			.on('visible', function () {
				// console.log(this.el, '+++');
				if (self.index === obj.index) {
					// self._setDrag(obj);
					console.log(123);
				}
			})
			.on('hidden', function () {
				obj.el.dragReset();
			})

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
			cur.transition.hide(name);
			obj.transition.show(name, this.wrap);
		} else {
			this.wrap.appendChild(obj.el);
		}

		this._setWrap(obj);

		await this._loadImg(this.cur = obj);
		this._preLoadImg();
	}

	hide () {
		let tr = this._transition;
		tr && tr.hide('photos-drop');
	}

	_setDrag (obj) {
		if (this.index !== obj.index) return;

		obj.el.onmousedown = _ => this.wrap.style.overflow = 'visible';
		obj.el.drag();
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
			} else if (hasCls(e, 'photos_icon--clockwise')) {
				this.wrap.style.overflow = 'visible';
				this.cur.el.rotate(90);
			} else if (hasCls(e, 'photos_icon--anticlockwise')) {
				this.wrap.style.overflow = 'visible';
				this.cur.el.rotate(-90);
			} else if (hasCls(e, 'photos_icon--reset')) {
				this.cur.el.dragReset();
				this._setImgStyle(this.cur);
			}

		});

		this.box.onselectstart = e => e.preventDefault();
	}

	_bindEventToBox () {
		let keyupFn;
		this._transition
			.on('visible', _ => {
				console.log('box show');
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

				bind(window, 'resize', _ => {
					this._setImgStyle(this.cur)
				});
			})
			.on('hidden', _ => {
				unbind(document, 'keyup', keyupFn);
			})

	}

	_setImgStyle (obj) {
		if (!obj.origin) return;

		let {width, height} = obj.origin;
		let {w, h} = getAdaptedSize(width, height);

		let adapted = obj.adapted = {width: w, height: h};
		obj.el.style.cssText = `width: ${w}px; height: ${h}px; margin-left: ${-w/2}px; margin-top: ${-h/2}px`;

		this._setWrap(obj);
		return adapted;
	}

	_setWrap (obj) {
		if (this.index !== obj.index) return;
		let {width, height} = obj.adapted;
		this.wrap.style.cssText = `width: ${width}px; height: ${height}px; margin-left: ${-width/2}px; margin-top: ${-height/2}px`;
	}
}


const getAdaptedSize = (w, h) => {
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



