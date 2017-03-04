jQuery(document).ready(function ($) {
    $(window).on('resize', function () {
        $('.imd-viewer-canvas').each(function () {
            $(this).attr('width', $(this).closest('.imd-viewer-container').width());
            var height = parseFloat($(this).attr('data-height'));
            if (height <= 0) {
                height = 0.5625;
            }
            $(this).attr('height', $(this).attr('width') * height);
        });
    });
    $(window).trigger('resize');
    $('.imd-viewer').each(function () {
        var $imdViewer = $(this);
        var $info = $imdViewer.find('.imd-viewer-info');
        var $canvas = $imdViewer.find('.imd-viewer-canvas');
        var $inputHeight = $imdViewer.find('.imd-viewer-input-height');
        $inputHeight.on('keyup', function () {
            $canvas.attr('data-height', $(this).val());
            $(window).trigger('resize');
        });
        $inputHeight.trigger('keyup');
        var $inputOneScreenTime = $imdViewer.find('.imd-viewer-input-one-screen-time');
        var $inputRate = $imdViewer.find('.imd-viewer-input-rate');
        var canvas = $canvas[0];
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var $audio = $imdViewer.find('.imd-viewer-audio');
        $audio.on('loadedmetadata', function () {
            (function (imdUrl, $info, canvas, audio, $inputOneScreenTime, $inputRate) {
                var xhr = new XMLHttpRequest();
                xhr.responseType = "arraybuffer";
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            var imdFile = new ImdFile();
                            imdFile.fromArrayBuffer(xhr.response);
                            $info.text('键数：' + imdFile.tracksCount + '键，谱面时长：' + imdFile.duration + ' ms，满连连击数：' + imdFile.allCombo() + ' combo');
                            var imdPainter = new ImdPainter(imdFile, canvas);
                            var oneScreenTime = parseFloat($inputOneScreenTime.val());
                            if (Math.abs(oneScreenTime) > 100) {
                                imdPainter.oneScreenTime = oneScreenTime;
                            }
                            $inputOneScreenTime.on('keyup', function () {
                                var oneScreenTime = parseFloat($(this).val());
                                if (Math.abs(oneScreenTime) >= 100) {
                                    imdPainter.oneScreenTime = oneScreenTime;
                                }
                            });
                            var rate = parseFloat($inputRate.val());
                            if (rate <= 0) {
                                rate = 1;
                            }
                            if (rate != 1) {
                                audio.playbackRate = rate;
                                $inputRate.on('keyup', function () {
                                    var rate = parseFloat($(this).val());
                                    if (rate <= 0) {
                                        rate = 1;
                                    }
                                    audio.playbackRate = rate;
                                });
                            }
                            window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
                            var step = function () {
                                var t = audio.currentTime * 1000;
                                imdPainter.setTime(t);
                                imdPainter.paint2d();
                                requestAnimationFrame(step);
                            };
                            requestAnimationFrame(step);
                        } else {
                            $info.text('读取imd文件出错');
                        }
                    }
                };
                xhr.open('GET', imdUrl);
                xhr.send();
            })($imdViewer.attr('data-imd'), $info, $canvas[0], $audio[0], $inputOneScreenTime, $inputRate);
        });
    });
});