
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
	<div class="photos_img-matte photos_img-matte--left" style="left: 0; height: 100%; width: 0"></div>
	<div class="photos_img-matte photos_img-matte--top" style="top: 0; width: 100%; height: 0"></div>
	<div class="photos_img-matte photos_img-matte--right" style="right: 0; height: 100%; width: 0"></div>
	<div class="photos_img-matte photos_img-matte--bottom" style="bottom: 0; width: 100%; height: 0"></div>
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


const LOAD_ERROR = -1;
const UNLOADED = 0;
const LOADING = 1;
const LOADED = 2;

module.exports = class Photos extends Event {
	constructor (opt = {}) {
		super();

		let {
			list,
			inteceptor,
			zIndex = 10000
		} = opt;

		if (!isArr(list)) {
			throw new TypeError('opt.list must be an array!');
		} else if (!list.length) {
			throw new Error('opt.list 是空数组!');
		}
		
		if (inteceptor && typeof inteceptor !== 'function')
			throw new TypeError('opt.inteceptor must be a function!');

		this._list = list.map((k, i) => {
			return {
				index: i,
				key: k,
				url: k,
				show: false,
				state: UNLOADED,
				// el: ''
			}
		});

		window.p = this;

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
		document.documentElement.style.overflow = 'hidden';

		this._tr.show('photos-drop');
		// this._tr.show('photos-fade');

		n = /^-?\d+$/.test(n) ? +n : this.index || 0;

		setTimeout(_ => {
			this.trigger('visible');
			this.showImg(n, false);
		});

		return this;
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
			let {el, index} = cur;
			let name = i > index ? 'photos-slide-left' : 'photos-slide-right';

			// 如果已经拖拽过, 让其淡出, 以提升交互体验
			let leaveName = el.__drag__ && el.__drag__.status
				? 'photos-fade'
				: name

			// let corg = cur.origin;
			// if (corg && corg.width * corg.height >= 4000000) {
			// 	cur.transition.hide('photos-fade');
			// } else {
			// 	cur.transition.hide(leaveName);
			// }

			// let org = obj.origin;
			// if (org && org.width * org.height >= 4000000) {
			// 	obj.transition.show('photos-fade', this.box);
			// } else {
			// 	obj.transition.show(name, this.box);
			// }

			cur.transition.hide(leaveName);
			obj.transition.show(name, this.box);
		} else {
			cur && cur.transition.remove();
			obj.transition.appendTo(this.box);
		}

		this._setMatte(obj);

		this.cur = obj;
		this.trigger('change', obj.index, obj);

		this._operateTr.hide();
		if (obj.state === LOADED) {
			this._operateTr.show('photos-drop', this.box);
			this._setImgStyle(obj);

			/**
			 * 即使当前图片已加载, 也要预加载, 填补之前预加载因网络问题漏掉的
			 * eg.
			 * 	当显示图2时, 会预加载 1, 3, 4, 5, 6, 若中途 4 加载 error,
			 * 	当切换到图3时, 会重新预加载 4
			 */
			this._preLoadImg();
		} else if (obj.state === LOAD_ERROR || obj.state === UNLOADED) {
			await this._loadImg(obj);
			this._preLoadImg();
		}
	}

	async _loadImg (obj) {
		// 避免重复加载
		if (obj.state !== LOAD_ERROR && obj.state !== UNLOADED) return;
		
		obj.state = LOADING;

		let url = obj.url;
		try {
			if (this._inteceptor) {
				let p = this._inteceptor(obj.key);
				url = obj.url = p instanceof Promise ? await p : p;	
			}
		} catch (e) {
			obj.state = LOAD_ERROR;
			console.error(`The ${obj.index}th inteceptor error!\n`, e);
		}

		try {
			let {img, width, height} = await loadImg(url);
			obj.origin = {width, height};

			obj.state = LOADED;

			// 预加载时, el还不存在
			this._initPhotoImg(obj);
			this._setImgStyle(obj);
			obj.el.innerHTML = '';
			obj.el.appendChild(img);
			this._addDrag(obj);

			if (this._is(obj)) {
				this._operateTr.show('photos-drop', this.box);
			}
		} catch (e) {
			obj.state = LOAD_ERROR;
			console.error(`${obj.url} load error!\n`, e);
		}
	}

	_preLoadImg () {
		let n = this.index - 1;
		let i = 0;

		while (i < 6) {
			let obj = this._getObj(n + i++);
			this._loadImg(obj);
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
		el.innerHTML = loadingTpl;

		obj.adapted = {width: 500, height: 500};
		obj.transition = new Transition(el);
	
		let self = this;
		obj.transition
			// .on('visible', function () {
			// 	console.log(this.el, '+++');
			// 	if (self.index === obj.index) {
			// 		// self._addDrag(obj);
			// 		console.log(123);
			// 	}
			// })
			.on('hidden', _ => {
				this._resetImg(obj);
			})

	}

	hide () {
		let tr = this._tr;
		tr && tr.hide('photos-drop');
		// tr && tr.hide('photos-fade');
	}

	_addDrag (obj) {
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
				this.showImg(this.index - 1);
			} else if (hasCls(e, 'photos_icon--arrow-right')) {
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

				this._resetImg(this.cur);
			})

	}

	_resetImg (obj) {
		let {el} = obj;
		if (obj.state === LOADED) {
			el.__drag__ && el.__drag__.reset().stop();
			this._setImgStyle(obj);
		}
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

			adapted.width >= origin.width && adapted.height >= origin.height
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

