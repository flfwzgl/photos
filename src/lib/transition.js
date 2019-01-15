/**
 * created by flfwzgl
 * github.com/flfwzgl
 */

const SHOW = Symbol('show');
const HIDDEN = Symbol('hidden');


export default class Transition {
	set (dom) {
		if (dom) {
			if (typeof dom === 'string' || dom.nodeType === 1) {
				this.$el = $(dom);
			} else if (dom instanceof $) {
				this.$el = dom;
			}
		}

		if (!(this.$el && this.$el.length))
			throw new Error('the arguments[0] must be an element, a jquery instance or a string that can be parsed as dom');

		return this;
	}

	show (ctn, name, fn) {
		if (!this.$el) return;
		this.ctn = ctn = ctn || document.body;
		name = name || 'fade';

		this.state = SHOW;
		this.$el.removeClass(`${this.name}-leave-to`).addClass(`${name}-enter`).appendTo(ctn);

		// this.$el[0].offsetWidth;
		setTimeout(_ => {
			this.$el.removeClass(`${name}-enter`);
		});

		this.name = name;
		return this;
	}

	hide (fn) {
		if (!this.$el) return;
		this.state = HIDDEN;
		name = this.name;
		this.$el.addClass(`${name}-leave-to`).on('transitionend webkitAnimationEnd', ev => {
			if (this.state === HIDDEN) {
				this.$el.removeClass(`${name}-leave-to`).remove();
				typeof fn === 'function' && fn();
			}
		})
		return this;
	}
}
