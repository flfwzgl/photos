function mousedown (ev) {
	let obj = this.__transform__;

	if (!obj.status) return;

	ev.stopPropagation();
	this.onselectstart = _ => false;

	let mx = ev.clientX,
		my = ev.clientY

	let x = obj.x || 0,
		y = obj.y || 0

	transition(this, 'initial');
	this.style.cursor = 'move';

	let mousemoveFn, mouseupFn;

	document.addEventListener('mousemove', mousemoveFn = ev => {
		if (!obj.status) return;
		obj.x = ev.clientX - mx + x;
		obj.y = ev.clientY - my + y;

		transform(this, `translate3d(${obj.x}px, ${obj.y}px, 0) rotate3d(0, 0, 1, ${obj.a}deg)`);
	});

	document.addEventListener('mouseup', mouseupFn = ev => {
		document.removeEventListener('mousemove', mousemoveFn);
		document.removeEventListener('mouseup', mouseupFn);

		transition(this, '');
		this.style.cursor = 'initial';
	});

}

function transform (e, v) {
	e.style.transform = v;
	e.style.webkitTransform = v;
	e.style.mozTransform = v;
	e.style.msTransform = v;
	e.style.oTransform = v;
}

function transition (e, v) {
	e.style.transition = v;
	e.style.webkitTransition = v;
	e.style.mozTransition = v;
	e.style.msTransition = v;
	e.style.oTransition = v;
}

Object.assign(Element.prototype, {
	__initTransform__ () {
		return this.__transform__ = this.__transform__ || {
			x: 0,
			y: 0,
			a: 0,

			status: true,
			mousedownFn: null
		}
	},

	get dragInited () {
		return !!this.__transform__;
	},

	// 旋转指定角度
	rotate (delta = 90) {
		let obj = this.__initTransform__();
		obj.a += delta;
		transform(this, `translate3d(${obj.x}px, ${obj.y}px, 0) rotate3d(0, 0, 1, ${obj.a}deg)`);
		return this;
	},

	// 关闭拖动
	dragStop () {
		if (!this.__transform__) return;

		let obj = this.__transform__;
		obj.status = false;
		return this;
	},

	dragReset () {
		if (!this.__transform__) return;

		let obj = this.__transform__;
		obj.x = obj.y = obj.a = 0;

		transition(this, 'initial');
		// transform(this, `translate3d(0, 0, 0) rotate3d(0, 0, 1, ${obj.a}deg)`);
		transform(this, '');
		this.offsetWidth;
		transition(this, '');
		return this;
	},

	// 打开拖拽
	drag () {
		if (this.dragInited) return;

		let obj = this.__initTransform__();
		this.addEventListener('mousedown', obj.mousedownFn = mousedown);

		// if (obj.mousedownFn) {
		// 	this.dragReset(false);
		// 	obj.status = true;
		// } else {
		// 	this.addEventListener('mousedown', obj.mousedownFn = mousedown);
		// }

		return this;
	}
});