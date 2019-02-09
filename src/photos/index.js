
import './css/photos.less';

import {
	Transition,
	Event,
	Drag,
	bind,
	unbind,
	rm,
	hide,
	show,
	hasCls,
	loadImg,
	isArr,
} from './util';

const mainTpl = `
	<i class="photos_icon--close"></i>
	<div class="photos_img-matte" style="left: 0; height: 100%; width: 0"></div>
	<div class="photos_img-matte" style="top: 0; width: 100%; height: 0"></div>
	<div class="photos_img-matte" style="right: 0; height: 100%; width: 0"></div>
	<div class="photos_img-matte" style="bottom: 0; width: 100%; height: 0"></div>
`

const loadingTpl = `
	<div class="photos_loading">
		<svg viewBox="25 25 50 50" class="circular">
			<circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
		</svg>
	</div>
`

const operateTpl = `
	<i class="photos_icon--clockwise"></i>
	<i class="photos_icon--anticlockwise"></i>
	<i class="photos_icon photos_icon--reset" style="font-size: 12px">还原</i>
	<i class="photos_icon photos_icon--origin" style="font-size: 12px">原图</i>
`

const switchTpl = `
	<i class="photos_icon--arrow-left"></i>
	<i class="photos_icon--arrow-right"></i>
	<div class="photos_switch_serial"></div>
`

const isMobile = /android|iphone|ipad/i.test(navigator.userAgent);


module.exports = class Photos extends Event {
	constructor (opt = {}) {
		super();

		let {
			list,
			inteceptor,
			zIndex = 10000
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
		});

		this._inteceptor = inteceptor;
		this.zIndex = zIndex;

		this.version = process.env.version;

		this._init();
	}

	_init () {
		let box = this.box = document.createElement('div');
		box.style.zIndex = this.zIndex;
		box.className = 'photos-box';
		box.innerHTML = mainTpl;

		let iswitch = this.iswitch = document.createElement('div');
		iswitch.className = 'photos_switch';
		iswitch.innerHTML = switchTpl;

		let operate = document.createElement('div');
		operate.className = 'photos_operate';
		operate.innerHTML = operateTpl;

		this.dom = {
			box,
			iswitch,
			serial: iswitch.getElementsByClassName('photos_switch_serial')[0],
			// wrap: box.getElementsByClassName('photos_img-wrap')[0],
			operate,
			iconOrigin: operate.getElementsByClassName('photos_icon--origin')[0],
			matteList: [].slice.call(box.getElementsByClassName('photos_img-matte'))
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

		document.documentElement.style.overflow = 'hidden';

		this._tr.show('photos-drop');

		n = /^-?\d+$/.test(n) ? +n : this.index || 0;

		setTimeout(_ => {
			this.trigger('visible');
			this.showImg(n, false);
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

	_preLoadImg () {
		let n = this.index - 1;
		let i = 0;

		while (i < 6)
			this._loadImg(this._getObj(n + i++));
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
		el.innerHTML = loadingTpl;

		obj.adapted = {width: 500, height: 500};
		obj.transition = new Transition(el);
	
		let self = this;
		obj.transition
			// .on('visible', function () {
			// 	// console.log(this.el, '+++');
			// 	// if (self.index === obj.index) {
			// 	// 	// self._setDrag(obj);
			// 	// 	console.log(123);
			// 	// }
			// })
			.on('hidden', function () {
				// obj.el.__drag__ && obj.el.__drag__.reset().stop();
			})

	}

	async showImg (i, animating = true) {
		let n = this._getIndex(i);
		if (this.index === n) return;

		this.dom.serial.innerHTML = `${n + 1} / ${this.length}`;

		this._index = n;
		let obj = this.list[n];
		this._initPhotoImg(obj);

		let cur = this.cur;
		if (cur && animating) {
			let name = i > cur.index ? 'photos-slide-left' : 'photos-slide-right';
			cur.transition.hide(name);
			obj.transition.show(name, this.box);
		} else {
			cur && cur.transition.remove();
			obj.transition.appendTo(this.box);
			// this.box.appendChild(obj.el);
		}
		this._setMatte(obj);

		this.trigger('change', obj.index);

		this._operateTr.hide();
		await this._loadImg(this.cur = obj);
		this._preLoadImg();
	}

	hide () {
		let tr = this._tr;
		tr && tr.hide('photos-drop');
	}

	_setDrag (obj) {
		// if (!this._is(obj)) return;

		// obj.el.onmousedown = obj.el.ontouchstart = _ => this._toggleMatte(0);
		new Drag(obj.el, 3);
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
				this._resetImg(obj);
				this.showImg(this.index - 1);
			} else if (hasCls(e, 'photos_icon--arrow-right')) {
				this._resetImg(obj);
				this.showImg(this.index + 1);
			} else if (hasCls(e, 'photos_icon--clockwise')) {
				this._toggleMatte(0);
				el.__drag__.rotate(90).start();
			} else if (hasCls(e, 'photos_icon--anticlockwise')) {
				this._toggleMatte(0);
				el.__drag__.rotate(-90).start();
			} else if (hasCls(e, 'photos_icon--reset')) {
				this._setMatte(obj);
				this._resetImg(obj);
			} else if (hasCls(e, 'photos_icon--origin')) {
				let {width, height} = origin;
				this._toggleMatte(0);
				el.style.width = width + 'px';
				el.style.height = height + 'px';
				el.style.marginLeft = -width / 2 + 'px';
				el.style.marginTop = -height / 2 + 'px';
				el.__drag__.start();
			}

		});

		this.box.onselectstart = e => e.preventDefault();
	}

	_bindEventToBox () {
		let keyupFn;
		this._tr
			.on('visible', _ => {
				// console.log('photos show');
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

				bind(this.box, 'touchmove', this._preventScroll = e => e.preventDefault());

				bind(window, 'resize', _ => {
					this._resetImg(this.cur);
				});

				this.length > 1 && this._switchTr.show('photos-drop', this.box);
			})
			.on('hidden', _ => {
				unbind(document, 'keyup', keyupFn);
				unbind(this.box, 'touchmove', this._preventScroll);

				document.documentElement.style.overflow = '';
			})

	}

	_resetImg (obj) {
		let {el} = obj;
		el.__drag__ && el.__drag__.reset().stop();
		this._setImgStyle(obj);
	}

	_setImgStyle (obj) {
		if (!obj.origin) return;

		let {width, height} = obj.origin;
		let {w, h} = getAdaptedSize(width, height);

		let adapted = obj.adapted = {width: w, height: h};
		obj.el.style.cssText = `width: ${w}px; height: ${h}px; margin-left: ${-w/2}px; margin-top: ${-h/2}px`;

		this._setMatte(obj);

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

	_setMatte (obj) {
		if (this.index !== obj.index) return;
		let {width, height} = obj.adapted;

		let hw = document.documentElement.clientWidth / 2;
		let hh = document.documentElement.clientHeight / 2;

		this._toggleMatte();
		this.dom.matteList[0].style.width = this.dom.matteList[2].style.width = hw - width / 2 + 'px';
		this.dom.matteList[1].style.height = this.dom.matteList[3].style.height = hh - height / 2 + 'px';

	}

	_toggleMatte (flag = true) {
		return this.dom.matteList.forEach(e => e.style.display = flag ? 'block' : 'none');
	}
}


const getAdaptedSize = (w, h) => {
	let r = w / h;
	let cw = document.documentElement.clientWidth;
	let ch = document.documentElement.clientHeight;

	let ratio = cw / ch;

	let padding = isMobile || cw <= 500 || ch <= 500
		? 0
		: cw <= 700 || ch <= 700
			? 50 : 100;

	if (r > ratio && w > cw - padding * 2) {
		w = cw - padding;
		h = w / r;
	} else if (r < ratio && h > ch - padding * 2) {
		h = ch - padding;
		w = h * r;
	}

	return {w, h};
}

