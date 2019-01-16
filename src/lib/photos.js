
import './css/photos.less';


import {
	Transition,
	Event,
	bind
} from './util';


export default class Photos extends Event {
	constructor (opt = {}) {
		super();

		let {
			list,
			inteceptor
		} = opt;

		if (!Array.isArray(list))
			throw new TypeError('opt.list must be an array!');
		
		if (inteceptor && typeof inteceptor !== 'function')
			throw new TypeError('opt.inteceptor must be a function!');


		this._list = list;
		this._inteceptor = inteceptor;

		this._init();
	}

	_init () {
		let photosBox = this._photosBox = document.createElement('div');
		photosBox.className = 'photos-box';

		photosBox._transition = new Transition(photosBox);
		bind(photosBox, 'click', e => e.stopPropagation());
	}

	show (n = 0) {
		this._photosBox._transition.show(document.body, 'photos-drop');

		return this;
	}
}
