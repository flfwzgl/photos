/**
 * created by flfwzgl
 * github.com/flfwzgl
 */


import '../css/transition.less';

import {
	Event,
	hasCls,
	addCls,
	rmCls,
	bind,
	unbind,
	rm
} from './index';

const VISIBLE = 1;
const HIDDEN = 0;

export default class Transition extends Event {
	constructor (el) {
		super();

		if (!el || el.nodeType !== 1)
			throw new TypeError('The argument el must be an element!');

		this.el = el;
		bind(el, 'transitionend', e => {
			e.stopPropagation();

			if (!this.stateChanged || e.currentTarget !== el) return;

			// console.log(this.stateChanged, '###', this.state, el);
			
			this.stateChanged = false;
			
			if (this.state === VISIBLE) {
				this.trigger('visible');
			} else if (this.state === HIDDEN) {
				rmCls(el, `${this.leaveName}-leave-to`);
				rm(el);
				this.trigger('hidden');
			}

			
		});
	}

	get online () {
		return !!this.el.parentNode;
	}

	show (name, ctn) {
		this.stateChanged = this.state !== VISIBLE;
		this.state = VISIBLE;


		this.ctn = ctn = ctn || document.body;
		this.enterName = name = name || 'photos-drop';

		if (this.online) {
			this.leaveName && rmCls(this.el, `${this.leaveName}-leave-to`);
		} else {
			addCls(this.el, `${name}-enter`);
			ctn.appendChild(this.el);

			this.el.offsetWidth;
			rmCls(this.el, `${name}-enter`);
			// setTimeout(_ => rmCls(this.el, `${name}-enter`));
		}

		return this;
	}

	hide (name) {
		if (!this.online) return;
		this.stateChanged = this.state !== HIDDEN;
		this.state = HIDDEN;
		this.leaveName = name = name || this.enterName || 'photos-drop';

		this.el.offsetWidth;
		addCls(this.el, `${name}-leave-to`);
		// setTimeout(_ => addCls(this.el, `${name}-leave-to`));
		return this;
	}

	remove () {
		this.state = HIDDEN;
		rm(this.el);
	}

	appendTo (ctn) {
		ctn = ctn || dpcument.body;
		this.state = VISIBLE;

		// this._setTransition('initial');
		// this.el.offsetWidth;
		ctn.appendChild(this.el);
		// this._setTransition('');

	}

	// _setTransition (v = '') {
	// 	this.el.style.transition = v;
	// 	this.el.style.webkitTransition = v;
	// 	this.el.style.mozTransition = v;
	// 	this.el.style.msTransition = v;
	// 	this.el.style.oTransition = v;
	// }
}




