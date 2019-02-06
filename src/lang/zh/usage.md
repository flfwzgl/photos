**无任何依赖**

###### 安装
```
<script src="https://flfwzgl.github.io/photos/dist/asset/photos.js"><script>
```

或者

```
npm i -S photos
```

###### 基本用法
```
var photos = new Photos(opts);
photos.show(n);
```

* `opts` {Object}
	* `opts.list` (必传) 所有大图 url 或 key 组成的数组
	* `opts.interceptor` (可选) 加载大图之前执行的拦截器, 拦截器执行返回图片url或 `Promise` 实例

* `n` {Number} 显示第 n 张图片(n从0开始, 默认为0)


###### 默认按键绑定
* `esc` 关闭相册
* `←`、`↑` 切换上一张图
* `→`、`↓` 切换下一张图


###### 例子
```
// 返回一个相册实例
var photos = new Photos({
	list: [
		'https://flfwzgl.github.io/static/park.jpg',
		'https://flfwzgl.github.io/static/jiuzhaigou.jpg',
		'https://flfwzgl.github.io/static/shenzhen.jpg'
		'https://flfwzgl.github.io/static/up.jpg'
	]
});

photos.show(2);	// 打开相册并显示第2(从0开始)张图片

// 关闭相册
photos.hide();
```


###### 使用 interceptor
```
// 可以是图片的key或其映射关系, 每次会使用对应图片的 key 传入到 interceptor
const keyList = [
	'190jmknfdsa',
	'ioklmjasbfd',
	'vcznjkdsadw',
	'fdsavcdsebb',
	'fdsv3bdfsbe'
]

var photos = new Photos({
	list: keyList,
	interceptor: function (key) {
		return new Promise(function (resolve, reject) {
			$.get('/api/getImgUrlByKey?key=' + key, function (res) {
				if (res && res.code === 0) {
					resolve(res.data);
				}
			})
		});
	}
});
```




