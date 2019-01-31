

export {default as Event} from './event';
export {default as Transition} from './transition';

export const noop = _ => _;

export const hasCls = (e, cls) => {
	return (' ' + (e && e.className || '') + ' ').indexOf(' ' + cls + ' ') > -1;
}

export const rmCls = (e, cls) => {
	let map = cls.trim().split(/\s+/).reduce((p, c) => (p[c] = 1, p), {});
	e.className = (e.className || '').trim().split(/\s+/).filter(c => !(c in map)).join(' ');
}

export const addCls = (e, cls) => {
	hasCls(e, cls) && rmCls(e, cls);
	e.className += ' ' + cls;
}

export const bind = (e, type, fn) => {
	e.__evt__ = e.__evt__ || {};
	
	type.split(/\s+/).forEach(tp => {
		let queue = e.__evt__[type] = e.__evt__[type] || [];
		queue.push(fn);

		e.addEventListener(tp, fn);
	});
}

export const unbind = (e, type, fn) => {
	e.__evt__ = e.__evt__ || {};
	type.split(/\s+/).forEach(tp => {
		if (fn) {
			e.removeEventListener(tp, fn);
		} else {
			let queue = e.__evt__[tp];
			queue && queue.forEach(fn => e.removeEventListener(tp, fn));
			delete e.__evt__[tp];
		}
	});
}

export const rm = el => el && el.parentNode && el.parentNode.removeChild(el);

export const loadImg = url => {
	return new Promise((r, j) => {
		let img = new Image();
		img.onload = function () {
			r({
				width: img.width,
				height: img.height,
				src: url,
				url,
				img
			});
		}

		img.onerror = j;
		img.src = url;
	})
}


export const delay = (fn, t = 0) => {
	let flag = false;
	return function delay (...args) {
		if (flag) return;
		flag = true;
		setTimeout(_ => {
			fn.call(this, ...args);
			flag = false;
		}, t);
	}
}












