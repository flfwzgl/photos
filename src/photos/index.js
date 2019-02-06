
import './css/photos.less';


import {
	Transition,
	Event,
	Drag,
	bind,
	unbind,
	hide,
	show,
	hasCls,
	loadImg,
	isArr,
} from './util';

import mainTpl from './tpl/main';
import loadingTpl from './tpl/loading';
import operateTpl from './tpl/operate';
import switchTpl from './tpl/switch';

export default class Photos extends Event {
	constructor (opt = {}) {
		super();

		let {
			list,
			inteceptor
		} = opt;

		if (!isArr(list))
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


		let iswitch = this.iswitch = document.createElement('div');
		iswitch.className = 'photos_switch';
		iswitch.innerHTML = switchTpl();


		let operate = document.createElement('div');
		operate.className = 'photos_operate';
		operate.innerHTML = operateTpl();

		this.dom = {
			serial: iswitch.getElementsByClassName('photos_switch_serial')[0],
			wrap: box.getElementsByClassName('photos_img-wrap')[0],
			operate,
			iconOrigin: operate.getElementsByClassName('photos_icon--origin')[0],
		};

		this._switchTr = new Transition(iswitch);
		this._operateTr = new Transition(operate);

		this._tr = new Transition(box)//.on('visible', _ => console.log('open')).on('hide', _ => console.log('close'))
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

		this._tr.show('photos-drop');

		// n = Math.random() * this.length | 0;

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

			obj.loaded = true;

			if (obj.el) {
				this._setImgStyle(obj);
				obj.el.innerHTML = '';
				obj.el.appendChild(img);
			}

			if (this._is(obj)) {
				// console.log(123);
				this._operateTr.show('photos-drop', this.box);
				this._setDrag(obj);
				// console.log(obj.index, this.index, '+++', );
			}
		} catch (e) {
			throw e;
			console.log(e);
			// console.error(`${obj.url} load error!`)
		}
	}

	async _preLoadImg () {
		let i = 1;
		while (i <= 6) {
			let n = this.index;
			await Promise.all([
				this._loadImg(this._getObj(n + i++)),
				this._loadImg(this._getObj(n + i++)),
			])
		}
	}

	_getObj (i) {
		return this._list[this._getIndex(i)];
	}

	_getIndex (i) {
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
			// .on('visible', function () {
			// 	console.log(this.el, '+++');
			// 	if (self.index === obj.index) {
			// 		// self._setDrag(obj);
			// 		console.log(123);
			// 	}
			// })
			.on('hidden', function () {
				obj.el.__drag__ && obj.el.__drag__.reset();
			})

	}

	async showImg (i) {
		let n = this._getIndex(i);
		if (this.index === n) return;

		this.dom.serial.innerHTML = `${n + 1} / ${this.length}`;

		this._index = n;
		let obj = this.list[n];
		this._initPhotoImg(obj);

		let cur = this.cur;
		if (cur) {
			let name = i > cur.index ? 'photos-slide-left' : 'photos-slide-right';
			cur.transition.hide(name);
			obj.transition.show(name, this.dom.wrap);
		} else {
			this.dom.wrap.appendChild(obj.el);
		}

		this._setWrap(obj);

		this._operateTr.hide();
		await this._loadImg(this.cur = obj);
		this._preLoadImg();
	}

	hide () {
		let tr = this._tr;
		tr && tr.hide('photos-drop');
	}

	_setDrag (obj) {
		if (!this._is(obj)) return;

		obj.el.onmousedown = _ => this._showOutOfWrap();
		new Drag(obj.el).start();
	}

	_bindEvent () {
		bind(this.box, 'click', e => {
			e.stopPropagation();
			e = e.target;

			let obj = this.cur;
			let {el, origin} = obj;

			if (hasCls(e, 'photos_icon--close')) {
				this.hide();
			} else if (hasCls(e, 'photos_icon--arrow-left')) {
				this.showImg(this.index - 1);
			} else if (hasCls(e, 'photos_icon--arrow-right')) {
				this.showImg(this.index + 1);
			} else if (hasCls(e, 'photos_icon--clockwise')) {
				this._showOutOfWrap();
				el.__drag__.rotate(90);
			} else if (hasCls(e, 'photos_icon--anticlockwise')) {
				this._showOutOfWrap();
				el.__drag__.rotate(-90);
			} else if (hasCls(e, 'photos_icon--reset')) {
				el.__drag__.reset();
				this._setWrap(obj);
				this._setImgStyle(obj);
			} else if (hasCls(e, 'photos_icon--origin')) {
				let {width, height} = origin;
				this._showOutOfWrap();
				el.style.width = width + 'px';
				el.style.height = height + 'px';
				el.style.marginLeft = -width / 2 + 'px';
				el.style.marginTop = -height / 2 + 'px';
			}

		});

		this.box.onselectstart = e => e.preventDefault();
	}

	_bindEventToBox () {
		let keyupFn;
		this._tr
			.on('visible', _ => {
				console.log('box show');
				bind(document, 'keyup', keyupFn = e => {
					switch (e.keyCode) {
						case 27:
							this.hide();
							break;
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
					this.cur.el.__drag__ && this.cur.el.__drag__.reset();
					this._setImgStyle(this.cur);
				});

				this.length > 1 && this._switchTr.show('photos-drop', this.box);
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

		if (this._is(obj)) {
			let {origin} = obj;

			adapted.width === origin.width && adapted.height === origin.height
				? hide(this.dom.iconOrigin)
				: show(this.dom.iconOrigin)
		}
	}

	_is (obj) {
		return this.index === obj.index;
	}

	_setWrap (obj) {
		if (this.index !== obj.index) return;
		let {width, height} = obj.adapted;
		this.dom.wrap.style.cssText = `width: ${width}px; height: ${height}px; margin-left: ${-width/2}px; margin-top: ${-height/2}px`;
	}

	_showOutOfWrap (flag = false) {
		this.dom.wrap.style.overflow = flag ? 'hidden' : 'visible';
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



