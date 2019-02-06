

import 'normalize.css';
import 'css/index.less';
import Photos from './photos';

import mainTpl from 'tpl/main';

import * as langMap from '@/lang';

const getLangType = _ => {
	let arr = location.pathname.match(/\/(en)\/?$/);
	return arr && arr[1] || 'zh';
}

const thumbList = [
	'https://flfwzgl.github.io/static/thumb_park.jpg',
	'https://flfwzgl.github.io/static/thumb_qianshuiwan.jpg',
	'https://flfwzgl.github.io/static/thumb_jiuzhaigou.jpg',
	'https://flfwzgl.github.io/static/thumb_seaworld.jpg',
	'https://flfwzgl.github.io/static/thumb_wind.jpg',
	'https://flfwzgl.github.io/static/thumb_shenzhen.jpg',
	'https://flfwzgl.github.io/static/thumb_up.jpg',
	'https://flfwzgl.github.io/static/thumb_iphone.jpg',
	'https://flfwzgl.github.io/static/thumb_wutongshan.jpg',
	'https://flfwzgl.github.io/static/thumb_park2.jpg',
	'https://flfwzgl.github.io/static/thumb_jiuzhaigou2.jpg',
	'https://flfwzgl.github.io/static/thumb_grass.jpg',
	'https://flfwzgl.github.io/static/thumb_snail.jpg',
	'https://flfwzgl.github.io/static/thumb_optimus.jpg',
	'https://flfwzgl.github.io/static/thumb_shenzhen2.jpg',
	'https://flfwzgl.github.io/static/thumb_bridge.jpg',
	'https://flfwzgl.github.io/static/thumb_mushroom.jpg',
]

const urlList = thumbList.map(e => e.replace(/thumb_/, ''));


$(_ => {
	document.body.innerHTML = mainTpl({
		lang: langMap[getLangType()],
		list: thumbList,
	});

	let photos = new Photos({
		list: urlList
	});

	$(document).on('click', '.img', e => {
		let i = +e.currentTarget.dataset.id;
		photos.show(i);
	})
});



