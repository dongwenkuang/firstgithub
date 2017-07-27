;
(function ($, window, document, undefined) {
    $.extend({
        // 图片手势操作
        imgGesture: function(option) {
            var reqAnimationFrame = (function () {
                return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
                    window.setTimeout(callback,1000 / 60);//1000 / 60
                };
            })();

            var log = null;
            var flag = option.imgID ? 1 : 0;
            var el = document.querySelector('#'+option.opID); //获取你想要操作区块的id
            if (flag) var img = document.querySelector('#'+option.imgID); //获取实际变换图片的id
            //var START_X = Math.round((window.innerWidth - el.offsetWidth) / 2);//居中
           // var  START_Y = Math.round((window.innerHeight - el.offsetHeight) / 2);
            var START_X =0;//后来发现，出现位置设为0才居中
            var START_Y=0;
            var ticking = false;
            var transform;
            var timer;
            var mc = new Hammer.Manager(el);

            mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));

            mc.add(new Hammer.Swipe()).recognizeWith(mc.get('pan'));
            mc.add(new Hammer.Rotate({ threshold: 0 })).recognizeWith(mc.get('pan'));
            mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([mc.get('pan'), mc.get('rotate')]);

            mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
            mc.add(new Hammer.Tap());

            mc.on("panstart panmove", onPan);//拖动事件
            //mc.on("rotatestart rotatemove", onRotate);//旋转事件
            mc.on("pinchstart pinchmove", onPinch);//放大缩小事件
            mc.on("swipe", onSwipe);
            mc.on("tap", onTap);//单击
            //mc.on("doubletap", onDoubleTap);//双击

            mc.on("hammer.input", function(ev) {
                if(ev.isFinal) {//判断是否离开，或者事件结束
                    //resetElement();//�ָ�
                    START_X=transform.translate.x;//把当前拖动到的坐标赋值给中间变量
                    START_Y=transform.translate.y;
                }
            });

            function resetElement() {
                el.className = 'animate';
                transform = {
                    translate: { x: START_X, y: START_Y },
                    scale: 1,
                    angle: 0,
                    rx: 0,
                    ry: 0,
                    rz: 0
                };

                requestElementUpdate();
            }

            function updateElementTransform() {
                var value = [
                            'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)',
                            'scale(' + transform.scale + ', ' + transform.scale + ')',
                            'rotate3d('+ transform.rx +','+ transform.ry +','+ transform.rz +','+  transform.angle + 'deg)'
                ];

                value = value.join(" ");
                if (flag) {
                    img.textContent = value;
                    img.style.webkitTransform = value;
                    img.style.mozTransform = value;
                    img.style.transform = value;
                } else {
                    el.textContent = value;
                    el.style.webkitTransform = value;
                    el.style.mozTransform = value;
                    el.style.transform = value;
                }

                ticking = false;
            }

            function requestElementUpdate() {
                if(!ticking) {
                    reqAnimationFrame(updateElementTransform);
                    ticking = true;
                }
            }

            function logEvent(str) {
                //log.insertBefore(document.createTextNode(str +"\n"), log.firstChild);
            }

            function onPan(ev) {
                el.className = '';
                transform.translate = {
                    x: START_X + ev.deltaX,
                    y: START_Y + ev.deltaY
                };

                requestElementUpdate();
                logEvent(ev.type);
            }

            var initScale = 1;
            function onPinch(ev) {
                if(ev.type == 'pinchstart') {
                    initScale = transform.scale || 1;
                }
                el.className = '';
                transform.scale = initScale * ev.scale;

                requestElementUpdate();
                logEvent(ev.type);
            }

            var initAngle = 0;
            function onRotate(ev) {
                if(ev.type == 'rotatestart') {
                    initAngle = transform.angle || 0;
                }
                el.className = '';
                transform.rz = 1;
                transform.angle = initAngle + ev.rotation;
                requestElementUpdate();
                logEvent(ev.type);
            }

            function onSwipe(ev) {
                var angle = 0;
                transform.ry = (ev.direction & Hammer.DIRECTION_HORIZONTAL) ? 1 : 0;
                transform.rx = (ev.direction & Hammer.DIRECTION_VERTICAL) ? 1 : 0;
                transform.angle = (ev.direction & (Hammer.DIRECTION_RIGHT | Hammer.DIRECTION_UP)) ? angle : -angle;

                clearTimeout(timer);
                timer = setTimeout(function () {
                    resetElement();
                }, 300);
                requestElementUpdate();
                logEvent(ev.type);
            }

            function onTap(ev) {
                $('#changeImgBtn,#changeimg').toggleClass('show');
            }

            function onDoubleTap(ev) {
                transform.rx = 1;
                transform.angle = 80;

                clearTimeout(timer);
                timer = setTimeout(function () {
                    resetElement();
                }, 500);
                requestElementUpdate();
                logEvent(ev.type);
            }

            resetElement();
        },

        // 裁剪用户头像
        clipPortrait: function(option) {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var img = new Image;
            var clipImg = new Image;
            var callback = option.callback ? option.callback : function() {};

            img.onload = function () {
                var styleArray = (option.style).match(/\([^\)]+\)/g),
                    translate = styleArray[0].substring(1,styleArray[0].length-1).split(','),
                    scale = styleArray[1].substring(1,styleArray[1].length-1).split(','),
                    rotate = styleArray[2].substring(1,styleArray[2].length-1).split(' '),
                    imgRatio = 1,
                    radii = option.height/2;

                if (img.height > option.height) imgRatio =  img.height/option.height;

                canvas.width = img.width < option.height*imgRatio ? option.height*imgRatio : img.width;
                canvas.height = img.height > option.height*imgRatio ? img.height : option.height*imgRatio;

                ctx.beginPath();
                //ctx.drawImage(img,-(img.width-option.height)/2,0,img.width, img.height)
                ctx.arc(radii*imgRatio,radii*imgRatio,radii*imgRatio,0,2*Math.PI);
                ctx.clip();

                // 控制图片位移
                if (img.width < option.height*imgRatio) ctx.translate(parseInt(translate[0])*imgRatio+radii*imgRatio-img.width/2, parseInt(translate[1].trim())*imgRatio-canvas.height/2+radii*imgRatio);
                else ctx.translate(parseInt(translate[0])*imgRatio-canvas.width/2+radii*imgRatio, parseInt(translate[1].trim())*imgRatio-canvas.height/2+radii*imgRatio);

                // 控制图片缩放
                ctx.scale(scale[0],scale[1]);

                // 控制图片旋转
                //ctx.rotate(parseFloat(rotate[3])*Math.PI/180);

                ctx.drawImage(img, 0, 0, img.width, img.height);
                clipImg.src = canvas.toDataURL('image/png');

                clipImg.onload = function() {
                    canvas.width = radii*imgRatio*2;
                    canvas.height = radii*imgRatio*2;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(clipImg, 0, 0);
                    callback(canvas.toDataURL('image/png'));
                }
            }

            img.src = option.url;
        }
    });
})(jQuery, window, document);
