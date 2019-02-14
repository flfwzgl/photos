

import 'normalize.css';
import 'css/index.less';

import mainTpl from 'tpl/main';
import * as langMap from '@/lang';

import Photos from './photos';

const getLangType = _ => {
	let arr = location.pathname.match(/\/(en)/);
	return arr && arr[1] || 'zh';
}

const thumbList = [
	'https://static.fanlinfeng.com/photos/thumb_park.jpg',
	'https://static.fanlinfeng.com/photos/thumb_qianshuiwan.jpg',
	'https://static.fanlinfeng.com/photos/thumb_jiuzhaigou.jpg',
	'https://static.fanlinfeng.com/photos/thumb_seaworld.jpg',
	'https://static.fanlinfeng.com/photos/thumb_wind.jpg',
	'https://static.fanlinfeng.com/photos/thumb_shenzhen.jpg',
	'https://static.fanlinfeng.com/photos/thumb_up.jpg',
	'https://static.fanlinfeng.com/photos/thumb_iphone.jpg',
	'https://static.fanlinfeng.com/photos/thumb_cod.jpg',
	'https://static.fanlinfeng.com/photos/thumb_wutongshan.jpg',
	'https://static.fanlinfeng.com/photos/thumb_park2.jpg',
	'https://static.fanlinfeng.com/photos/thumb_jiuzhaigou2.jpg',
	'https://static.fanlinfeng.com/photos/thumb_grass.jpg',
	'https://static.fanlinfeng.com/photos/thumb_snail.jpg',
	'https://static.fanlinfeng.com/photos/thumb_optimus.jpg',
	'https://static.fanlinfeng.com/photos/thumb_shenzhen2.jpg',
	'https://static.fanlinfeng.com/photos/thumb_bridge.jpg',
	'https://static.fanlinfeng.com/photos/thumb_mushroom.jpg',
	
	'https://static.fanlinfeng.com/photos/thumb_tokyo.jpg',
	'https://static.fanlinfeng.com/photos/thumb_crysis2.jpg',
	'https://static.fanlinfeng.com/photos/thumb_dolphin.jpg',
	'https://static.fanlinfeng.com/photos/thumb_elephant.jpg',
	'https://static.fanlinfeng.com/photos/thumb_hongkong.jpg',
	'https://static.fanlinfeng.com/photos/thumb_sf5.jpg',
	'https://static.fanlinfeng.com/photos/thumb_panda.jpg',
	'https://static.fanlinfeng.com/photos/thumb_particles.jpg',
	'https://static.fanlinfeng.com/photos/thumb_dirt3.jpg',
	'https://static.fanlinfeng.com/photos/thumb_red_panda.jpg',
	'https://static.fanlinfeng.com/photos/thumb_ropeway.jpg',
	'https://static.fanlinfeng.com/photos/thumb_shanghai.jpg',
	'https://static.fanlinfeng.com/photos/thumb_crysis3.jpg',
	'https://static.fanlinfeng.com/photos/thumb_tiger.jpg',
]

const urlList = thumbList.map(e => e.replace(/thumb_/, ''));


const langType = getLangType();

$(_ => {
	let photos = new Photos({
		list: urlList,
		zIndex: 1000000
	});


	$(document.body)
		.append(mainTpl({
			lang: langMap[langType],
			list: thumbList,
			langType
		}))
		.on('click', '.img', e => {
			let $e = $(e.currentTarget);
			let i = +$e.attr('data-id') || 0;
			photos.show(i);
		})
});



