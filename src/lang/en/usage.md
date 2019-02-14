**No dependencies**

##### Installation

```
<script src="https://flfwzgl.github.io/photos/asset/photos.js"></script>
```
or
```
npm i -S node-photos
```
##### Basics
```
import Photos from 'node-photos';

const photos = new Photos(opts);
photos.show(n);
```

* `opts` {Object}
  * `opts.list` {Array mandatory} Consist of all image urls or image keys
  * `opts.zIndex` {Number optional}  The `z-index` of `photos`, default `10000`
  * `opts.interceptor` {Function optional}  The interceptor before loading a big image, expected to return an instance of Promise or a real image url.


* `photos` instance
  * `hide` {Function} Close photos
  * `show(n)` {Number optional} Open photos and display the nth image, starting at 0, default 0
  * `showImg(n)`, `n` {Number optional} Display the nth image


##### Default binding
* `esc` close the photos
* `←`、`↑` switch to the previous image
* `→`、`↓` switch to the next image


##### Examples
```
// return an instance of Photos
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


##### Interceptor usage
```
/**
 * This key may be an image key or other mapping rules,
 * when switching to an image, before loading the image,
 * its corresponding key will be passed to the inteceptor,
 * the inteceptor may return an image url directly or return a Promise instance
 * which get the image url asynchrously and resolve it.
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