/**
 * created by flfwzgl
 * github.com/flfwzgl
 */


import '../css/transition.less';

import {
	addCls,
	rmCls,
	bind,
	unbind,
	rm
} from './index';

const SHOW = Symbol('show');
const HIDDEN = Symbol('hidden');

export default class Transition {
	constructor (el) {
		if (!el || el.nodeType !== 1)
			throw new TypeError('the argument el must be an element!');

		this.el = el;
	}

	show (ctn, name) {
		if (!this.el) return;
		this.ctn = ctn = ctn || document.body;
		name = name || 'photos-slide-right';

		this.state = SHOW;

		rmCls(this.el, `${this.name}-leave-to`);
		addCls(this.el, `${name}-enter`);
		ctn.appendChild(this.el);

		// this.$el[0].offsetWidth;
		setTimeout(_ => {
			rmCls(this.el, `${name}-enter`);
		});

		this.name = name;
		return this;
	}

	hide (fn) {
		if (!this.el) return;
		this.state = HIDDEN;
		name = this.name;

		addCls(this.el, `${name}-leave-to`);
		bind(this.el, 'transitionend webkitAnimationEnd', ev => {
			if (this.state === HIDDEN) {
				rmCls(this.el, `${name}-leave-to`);
				rm(this.el);
				typeof fn === 'function' && fn();
			}
		});

		return this;
	}
}




