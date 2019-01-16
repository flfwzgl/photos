

import 'normalize.css';
import 'css/index.less';
import Photos from './lib/photos.js';

import mainTpl from 'tpl/main';

import * as langMap from '@/lang';

const getLangType = _ => {
	let arr = location.pathname.match(/\/(en)\/?$/);
	return arr && arr[1] || 'zh';
}


$(_ => {
	document.body.innerHTML = mainTpl({
		lang: langMap[getLangType()],
	})


	let photos = new Photos({
		list: []
	});

	$(document).on('click', _ => {
		photos.show();
	})
});



