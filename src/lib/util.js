



export const hasCls = (e, cls) => {
	return (' ' + (e && e.className || '') + ' ').indexOf(' ' + cls + ' ') > -1;
}

export const rmCls = (e, cls) => {
	let map = cls.trim().split(/\s+/).reduce((p, c) => (p[c] = 1, p), {});
	e.className = (e.className || '').trim().split(/\s+/).filter(c => !(c in map)).join(' ');
}

export const addCls = (e, cls) => {
	rmCls(e, cls);
	e.className += ' ' + cls;
}


const _bind = e.attachEvent
	? (e, type, fn) => e.attachEvent('on' + type, (...args) => e.call(fn, ...args))
	: (e, type, fn) => e.addEventListener(type, fn, false);

const _unbind = e.detachEvent
	? (e, type, fn) => e.detachEvent('on' + type, fn)
	: (e, type, fn) => e.removeEventListener(type, fn, false);

export const bind = (e, type, fn) => {
	e.__evt__ = e.__evt__ || {};
	
	type.split(/\s+/).forEach(tp => {
		let queue = e.__evt__[type] = e.__evt__[type] || [];
		queue.push(fn);

		_bind(e, tp, fn);
	});
}

export const unbind = (e, type, fn) => {
	e.__evt__ = e.__evt__ || {};
	type.split(/\s+/).forEach(tp => {
		if (fn) {
			_unbind(e, tp, fn);
		} else {
			let queue = e.__evt__[tp];
			queue && queue.forEach(fn => _unbind(e, tp, fn));
			delete e.__evt__[tp];
		}
	});
}

export const remove = el => el && el.parentNode && el.parentNode.removeChild(el);