/**
 * ImdPainter构造器
 * @param {ImdFile} imdFile
 * @param {HTMLCanvasElement} canvas 画布元素
 * @constructor
 */
function ImdPainter(imdFile, canvas) {
    this.imdFile = imdFile;
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.oneScreenTime = 900;
    this.setTime(0);
    this.setPaintType('2d');
}
ImdPainter.prototype.CONSTANT = {
    COLOR: {
        BACKGROUND: '#000000',
        TRACK_LINE: '#999999',
        BEAT_LINE: '#ff0000',
        BEAT_SUB_LINE: '#330000',
        RECT_SINGLE: '#3399ff',
        RECT_LINE: '#00ff00',
        LINE: '#ffffcc',
        POINT: '#99ff00',
        ARROW: '#99ff00'
    },
    WIDTH: {
        TRACK_LINE: .05,
        RECT_SINGLE: .9,
        RECT_LINE: .9,
        LINE: .1,
        POINT: .15,
        ARROW: .3
    },
    HEIGHT: {
        BEAT_LINE: .02,
        RECT_SINGLE: 1,
        RECT_LINE: 1,
        LINE: .15,
        POINT: .3,
        ARROW: .7
    }
};
ImdPainter.prototype.setTime = function (time) {
    this.time = time;
};
ImdPainter.prototype.setPaintType = function (type) {
    switch (type) {
        case '2d': // Plain 2D, 简单的2D
            this.timeToY = function (time) {
                return this.canvas.height - (time - this.time) * this.canvas.height / this.oneScreenTime;
            }.bind(this);
            break;
        case '3d': // True 3D, 真·3D
            break;
        case 'AP': // Arithmetic progression, 等差级数（乐动时代“三维”算法）
            break;
        case 'GP': // Graphic progression, 等比级数（节奏大师“三维”算法）
            break;

    }
};
ImdPainter.prototype.paint2d = function () {
    var ctx = this.canvas.getContext('2d');
    // 基础宽度高度
    var trackWidth = this.canvas.width / this.imdFile.tracksCount;
    var baseHeight = trackWidth / 4;
    // 填充背景
    ctx.fillStyle = this.CONSTANT.COLOR.BACKGROUND;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    var beatLineHeight = trackWidth * this.CONSTANT.HEIGHT.BEAT_LINE;
    // 画节拍
    for (var i = 0; i < this.imdFile.beats.length; ++i) {
        var beatTime = 60000 / this.imdFile.beats[i].bpm / 4;
        for (var j = 0; ; ++j) {
            var time = this.imdFile.beats[i].millis + j * beatTime;
            var startY = this.timeToY(time);
            if (i < this.imdFile.beats.length - 1) {
                if (time >= this.imdFile.beats[i + 1].millis) {
                    break;
                }
            } else {
                if (time >= this.imdFile.duration) {
                    break;
                }
            }
            if (startY < 0 || startY > this.canvas.height) {
                continue;
            }
            if (j <= 0) {
                // 画主节拍线
                ctx.fillStyle = this.CONSTANT.COLOR.BEAT_LINE;
            } else {
                // 画子节拍线
                ctx.fillStyle = this.CONSTANT.COLOR.BEAT_SUB_LINE;
            }
            ctx.fillRect(0, startY - beatLineHeight / 2, this.canvas.width, beatLineHeight);
        }
    }
    // 画轨道
    ctx.fillStyle = this.CONSTANT.COLOR.TRACK_LINE;
    var trackLineWidth = trackWidth * this.CONSTANT.WIDTH.TRACK_LINE;
    for (var i = 0; i <= 6; ++i) {
        ctx.fillRect(i * trackWidth - trackLineWidth / 2, 0, trackLineWidth, this.canvas.height);
    }
    // 画音符
    var rectSingleWidth = trackWidth * this.CONSTANT.WIDTH.RECT_SINGLE;
    var rectLineWidth = trackWidth * this.CONSTANT.WIDTH.RECT_LINE;
    var lineWidth = trackWidth * this.CONSTANT.WIDTH.LINE;
    var pointWidth = trackWidth * this.CONSTANT.WIDTH.POINT;
    var arrowWidth = trackWidth * this.CONSTANT.WIDTH.ARROW;
    var rectSingleHeight = baseHeight * this.CONSTANT.HEIGHT.RECT_SINGLE;
    var rectLineHeight = baseHeight * this.CONSTANT.HEIGHT.RECT_LINE;
    var lineHeight = baseHeight * this.CONSTANT.HEIGHT.LINE;
    var pointHeight = baseHeight * this.CONSTANT.HEIGHT.POINT;
    var arrowHeight = baseHeight * this.CONSTANT.HEIGHT.ARROW;
    for (var i = 0; i < this.imdFile.notes.length; ++i) {
        var note = this.imdFile.notes[i];
        var startY = this.timeToY(note.millis);
        var startX = (note.track + .5) * trackWidth;
        var type1 = note.type & 0x0f;
        var type2 = note.type & 0xf0;
        switch (type1) {
            case 0:
                // 单点矩形
                if (startY < 0 || startY > this.canvas.height) {
                    continue;
                }
                ctx.fillStyle = this.CONSTANT.COLOR.RECT_SINGLE;
                ctx.fillRect(startX - rectSingleWidth / 2, startY - rectSingleHeight / 2, rectSingleWidth, rectSingleHeight);
                break;
            case 1:
                // 水平线
                if (startY < 0 || startY > this.canvas.height) {
                    continue;
                }
                var endX = startX + note.action * trackWidth;
                ctx.fillStyle = this.CONSTANT.COLOR.LINE;
                ctx.fillRect(startX, startY - lineHeight / 2, trackWidth * note.action, lineHeight);
                // 水平线开始处
                switch (type2) {
                    case 0x00:
                    case 0x60:
                        // 矩形
                        ctx.fillStyle = this.CONSTANT.COLOR.RECT_LINE;
                        ctx.fillRect(startX - rectLineWidth / 2, startY - rectLineHeight / 2, rectLineWidth, rectLineHeight);
                        break;
                    case 0x20:
                    case 0xa0:
                        // 端点
                        ctx.fillStyle = this.CONSTANT.COLOR.POINT;
                        ctx.fillRect(startX - pointWidth / 2, startY - pointHeight / 2, pointWidth, pointHeight);
                        break;
                }
                // 水平线结束处
                switch (type2) {
                    case 0x00:
                    case 0xa0:
                        // 箭头
                        ctx.fillStyle = this.CONSTANT.COLOR.ARROW;
                        ctx.beginPath();
                        var direction = (note.action > 0) ? 1 : -1;
                        ctx.moveTo(endX + direction * arrowWidth / 2, startY);
                        ctx.lineTo(endX - direction * arrowWidth / 2, startY - arrowHeight / 2);
                        ctx.lineTo(endX - direction * arrowWidth / 2, startY + arrowHeight / 2);
                        ctx.closePath();
                        ctx.fill();
                        break;
                    case 0x60:
                    case 0x20:
                        // 端点
                        ctx.fillStyle = this.CONSTANT.COLOR.POINT;
                        ctx.fillRect(endX - pointWidth / 2, startY - pointHeight / 2, pointWidth, pointHeight);
                        break;
                }
                break;
            case 2:
                // 竖直线
                var endY = this.timeToY(note.millis + note.action);
                if ((startY < 0 && endY < 0) || (startY > this.canvas.height && endY > this.canvas.height)) {
                    continue;
                }
                ctx.fillStyle = this.CONSTANT.COLOR.LINE;
                ctx.fillRect(startX - lineWidth / 2, startY, lineWidth, endY - startY);
                // 竖直线开始处
                switch (type2) {
                    case 0x00:
                    case 0x60:
                        // 矩形
                        ctx.fillStyle = this.CONSTANT.COLOR.RECT_LINE;
                        ctx.fillRect(startX - rectLineWidth / 2, startY - rectLineHeight / 2, rectLineWidth, rectLineHeight);
                        break;
                    case 0x20:
                    case 0xa0:
                        // 端点
                        ctx.fillStyle = this.CONSTANT.COLOR.POINT;
                        ctx.fillRect(startX - pointWidth / 2, startY - pointHeight / 2, pointWidth, pointHeight);
                        break;
                }
                // 竖直线结束处端点
                ctx.fillStyle = this.CONSTANT.COLOR.POINT;
                ctx.fillRect(startX - pointWidth / 2, endY - pointHeight / 2, pointWidth, pointHeight);
                break;
        }
    }
};