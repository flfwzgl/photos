# Photos
JavaScript 相册, 无任何依赖

[Demo](https://flfwzgl.github.io/photos)

### 用法


###### 安装

```
<script src="https://flfwzgl.github.io/photos/asset/photos.js"></script>
```
或
```
npm i -S node-photos
```

###### 基本用法

```
import Photos from 'node-photos';

const photos = new Photos(opts);
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

photos.show(2); // 打开相册并显示第2(从0开始)张图片

// 关闭相册
photos.hide();
```


###### 使用 interceptor
```
/**
 * 这个key可以是图片的key或其他映射规则, 当切换到一张图时,
 * 在加载图片之前, 它对应的key会被传入到拦截器中, 拦截器可以直接返回图片url
 * 也可以返回一个promise实例, 然后异步获取到图片 url 再将其 resolve 
 */
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


### 协议
MIT



---

# Photos

**JavaScript gallery, no dependencies**

###### Installation

```
<script src="https://flfwzgl.github.io/photos/asset/photos.js"></script>
```
or
```
npm i -S node-photos
```
###### Basics
```
import Photos from 'node-photos';

const photos = new Photos(opts);
photos.show(n);
```

* `opts` {Object}
  * `opts.list` {Array mandatory} Consist of all image url or image key
  * `opts.interceptor` {Function optional}  The interceptor before loading big image, expected to return an instance of Promise or a real image url.

* `n` {Number optional} Display the nth image, starting at 0, default 


###### Default binding
* `esc` close the photos
* `←`、`↑` switch to the previous image
* `→`、`↓` switch to the next image


###### Examples
```
// return a instance of Photos
var photos = new Photos({
  list: [
    'https://flfwzgl.github.io/static/park.jpg',
    'https://flfwzgl.github.io/static/jiuzhaigou.jpg',
    'https://flfwzgl.github.io/static/shenzhen.jpg'
    'https://flfwzgl.github.io/static/up.jpg'
  ]
});

photos.show(2); // open the photos and display the second image(starting at 0)

// close the photos
photos.hide();
```


###### Interceptor usage
```
/**
 * This key may be an image key or other mapping rules,
 * when switching to one image, before loading the image,
 * its corresponding key will be passed to the inteceptor,
 * the inteceptor may return an image url directly or return a Promise instance
 * which get image url asynchrously and resolve it.
 */
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

### License
MIT








