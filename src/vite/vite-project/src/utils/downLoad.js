import { saveAs } from 'file-saver';
import JSZip from 'jszip';

function download(basePic, name) {
  const zip = new JSZip(); // 实例化zip
  const img = zip.folder('qrCode'); // zip包内的文件夹名字
  img.file(
    name + '的二维码.png',
    basePic.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
    { base64: true }
  ); // 将图片文件加入到zip包内

  zip
    .generateAsync({ type: 'blob' }) // zip下载
    .then(function (content) {
      // see FileSaver.js
      saveAs(content, '二维码.zip'); // zip下载后的名字
    });
}
// 参数src为图片地址，name为下载时图片的名称
function downloadIamge(src, name) {
  var image = new Image();
  image.src = src + '?v=' + Math.random();

  // 解决跨域 Canvas 污染问题
  image.crossOrigin = 'anonymous';
  image.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, image.width, image.height);
    var url = canvas.toDataURL('image/jpeg');
    console.log(url);
    download(url, name);
  };
}
export function downLoad(src, name) {
  console.log(src, name);
  downloadIamge(src, name);
}
