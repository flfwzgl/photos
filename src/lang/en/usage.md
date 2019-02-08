**No dependencies**

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




