

import 'normalize.css';
import 'css/index.less';
import Photos from './photos';

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

	let photos = window.photos = new Photos({
		list: [
			'https://flfwzgl.github.io/static/park.jpg',
			'https://flfwzgl.github.io/static/park2.jpg',
			'https://flfwzgl.github.io/static/qianshuiwan.jpg',
			'https://flfwzgl.github.io/static/seaworld.jpg',
			'https://flfwzgl.github.io/static/shenzhen.jpg',
			'https://flfwzgl.github.io/static/up.jpg',
			'https://flfwzgl.github.io/static/iphone.jpg',
			'https://flfwzgl.github.io/static/wutongshan.jpg',
			'https://flfwzgl.github.io/static/grass.jpg',
			'https://flfwzgl.github.io/static/snail.jpg',
			'https://flfwzgl.github.io/static/shenzhen2.jpg',
			'https://flfwzgl.github.io/static/bridge.jpg',
			'https://flfwzgl.github.io/static/mushroom.jpg',
		]
	});

	$(document).on('click', _ => {
		photos.show();
	})
});



