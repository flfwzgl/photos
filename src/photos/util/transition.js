/**
 * created by flfwzgl
 * github.com/flfwzgl
 */


import '../css/transition.less';

import {
	Event,
	addCls,
	rmCls,
	bind,
	unbind,
	noop,
	delay,
	rm
} from './index';

const SHOW = Symbol('show');
const HIDDEN = Symbol('hidden');

export default class Transition extends Event {
	constructor (el) {
		super();

		if (!el || el.nodeType !== 1)
			throw new TypeError('The argument el must be an element!');

		this.el = el;
		bind(el, 'transitionend', delay(e => {
			e.stopPropagation();

			if (this.state === SHOW) {
				e.target === el && this.trigger('show');
			} else if (this.state === HIDDEN) {
				rmCls(el, `${this.leaveName}-leave-to`);
				rm(el);
				e.target === el && this.trigger('hidden');
			}
		}));
	}

	get online () {
		return !!this.el.parentNode;
	}

	show (name, ctn) {
		this.state = SHOW;

		this.ctn = ctn = ctn || document.body;
		this.enterName = name = name || 'photos-drop';

		if (this.online) {
			this.leaveName && rmCls(this.el, `${this.leaveName}-leave-to`);
		} else {
			addCls(this.el, `${name}-enter`);
			ctn.appendChild(this.el);
			setTimeout(_ => rmCls(this.el, `${name}-enter`));
		}

		return this;
	}

	hide (name) {
		this.state = HIDDEN;
		this.leaveName = name = name || this.enterName || 'photos-drop';

		addCls(this.el, `${name}-leave-to`);
		return this;
	}
}




