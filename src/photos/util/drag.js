

export default class Drag {
	constructor (el) {
		if (!(el instanceof Element))
			throw new Error('el must be an Element');

		this.el = el;
		el.__drag__ = this;

		this._initTransform();
	}

	_initTransform () {
		return this._transform = this._transform || {
			x: 0,
			y: 0,
			a: 0,

			status: true,
			mousedownFn: null
		}
	}

	rotate (delta = 90) {
		let obj = this._transform;
		obj.a += delta;
		this._setTransform(`translate3d(${obj.x}px, ${obj.y}px, 0) rotate3d(0, 0, 1, ${obj.a}deg)`);
		return this;
	}

	start () {
		this.el.addEventListener('mousedown', this._mousedown.bind(this));
		return this;
	}

	stop () {
		let obj = this._transform;
		obj.status = false;
		this.el.removeEventListener('mousedown', this._mousedown);
		return this;
	}

	reset () {
		let obj = this._transform;
		obj.x = obj.y = obj.a = 0;

		this._setTransition('initial');
		this._setTransform();
		this.el.offsetWidth;
		this._setTransition('');
		return this;
	}

	_mousedown (ev) {
		let obj = this._transform;

		if (!obj.status) return;

		ev.stopPropagation();
		this.onselectstart = _ => false;

		let mx = ev.clientX,
			my = ev.clientY

		let x = obj.x || 0,
			y = obj.y || 0

		this._setTransition('initial');
		this.el.style.cursor = 'move';

		let mousemoveFn, mouseupFn;

		document.addEventListener('mousemove', mousemoveFn = ev => {
			if (!obj.status) return;
			obj.x = ev.clientX - mx + x;
			obj.y = ev.clientY - my + y;

			this._setTransform(`translate3d(${obj.x}px, ${obj.y}px, 0) rotate3d(0, 0, 1, ${obj.a}deg)`);
		});

		document.addEventListener('mouseup', mouseupFn = ev => {
			document.removeEventListener('mousemove', mousemoveFn);
			document.removeEventListener('mouseup', mouseupFn);

			this._setTransition();
			this.el.style.cursor = 'initial';
		});
	}

	_setTransform (v = '') {
		this.el.style.transform = v;
		this.el.style.webkitTransform = v;
		this.el.style.mozTransform = v;
		this.el.style.msTransform = v;
		this.el.style.oTransform = v;
	}

	_setTransition (v = '') {
		this.el.style.transition = v;
		this.el.style.webkitTransition = v;
		this.el.style.mozTransition = v;
		this.el.style.msTransition = v;
		this.el.style.oTransition = v;
	}
}