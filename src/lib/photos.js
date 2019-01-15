
import Transition from './transition';
import Event from './event';


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

		photosBox._tansition = new Transition().set(photosBox);
	}

	show (n = 0) {
		this._photosBox._transition.show();
	}
}
