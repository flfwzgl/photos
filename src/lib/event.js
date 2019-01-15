/**
 * created by flfwzgl
 * github.com/flfwzgl
 */


let slice = [].slice;
export default class Event {
	constructor () {
		this._evbus = {};
	}

	on (type) {
		if (typeof type !== 'string') throw new TypeError('type must be a string!');
		let fns = slice.call(arguments, 1);
		if (!fns.length) return this;

		if (fns.some((fn, i) => {
			if (typeof fn !== 'function') {
				throw new TypeError(`the ${i + 1}th argument of Event.on must be a function!`)
			}
		}));

		let _evbus = this._evbus;

		_evbus.hasOwnProperty(type)
			? _evbus[type].push(...fns)
			: _evbus[type] = fns

		return this;
	}

	off (type) {
		if (typeof type !== 'string') throw new TypeError('type must be a string!');
		let fns = this._evbus[type];
		let rmfns = slice.call(arguments, 1);
		let i;

		if (fns && fns.length && rmfns.length) {
			rmfns.forEach(rmfn => {
				i = fns.indexOf(rmfn);
				~i && fns.splice(i, 1);
			})
		} else {
			delete this._evbus[type];
		}

		return this;
	}

	trigger (type) {
		if (typeof type !== 'string') throw new TypeError('type must be a string!');
		let d = slice.call(arguments, 1);
		let fns = this._evbus[type];

		if (fns && fns.length) {
			fns.forEach(fn => fn(...d));
		}

		return this;
	}
}



