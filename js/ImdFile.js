function ImdFile() {
    this.duration = 0;
    this.beats = [];
    this.notes = [];
    this.tracksCount = 6;
}
/**
 * 读取ArrayBuffer，用于打开文件
 * @param {ArrayBuffer} arrayBuffer
 * @return {ImdFile}
 */
ImdFile.prototype.fromArrayBuffer = function (arrayBuffer) {
    // DataView，支持机器无关字节序读取
    var dv = new DataView(arrayBuffer);
    // 文件指针
    var byteOffset = 0;
    // 歌曲时长：使用小端序取4字节无符号整数
    this.duration = dv.getUint32(byteOffset, true);
    byteOffset += 4;
    // 节拍数：使用小端序取4字节无符号整数
    var beatsCount = dv.getUint32(byteOffset, true);
    byteOffset += 4;
    // 防止出错
    if (beatsCount > 32767) {
        return this;
    }
    // 初始化节拍数组
    this.beats = [];
    // 读取每一个小节的信息
    for (var i = 0; i < beatsCount; ++i) {
        // 此小节起始时间：使用小端序取4字节无符号整数
        var millis = dv.getUint32(byteOffset, true);
        byteOffset += 4;
        // 此小节bpm：使用小端序取8字节双精度浮点数
        var bpm = dv.getFloat64(byteOffset, true);
        byteOffset += 8;
        this.beats.push({millis: millis, bpm: bpm});
    }
    // 跳过 03 03
    byteOffset += 2;
    // note数：使用小端序取4字节无符号整数
    var notesCount = dv.getUint32(byteOffset, true);
    byteOffset += 4;
    // 防止出错
    if (notesCount > 32767) {
        return this;
    }
    var maxTrack = 0;
    // 初始化note数组
    this.notes = [];
    // 读取每一个note
    for (var i = 0; i < notesCount; ++i) {
        // note类型：使用小端序取2字节无符号整数
        var type = dv.getUint16(byteOffset, true);
        byteOffset += 2;
        // note起始时间：使用小端序取4字节无符号整数
        var millis = dv.getUint32(byteOffset, true);
        byteOffset += 4;
        // note起始轨道：使用小端序取1字节无符号整数
        var track = dv.getUint8(byteOffset);
        byteOffset += 1;
        // note操作：使用小端序读取4字节有符号整数
        var action = dv.getInt32(byteOffset, true);
        byteOffset += 4;
        this.notes.push({type: type, millis: millis, track: track, action: action});
    }
    this.tracksCount = this.countTracks();
    return this;
};
/**
 * 转换为ArrayBuffer，可以用于保存
 * @return {ArrayBuffer}
 */
ImdFile.prototype.toArrayBuffer = function () {
    var arrayBuffer = new ArrayBuffer(4 + 4 + this.beats.length * (4 + 8) + 2 + 4 + this.notes.length * (2 + 4 + 1 + 4));
    var dv = new DataView(arrayBuffer);
    var byteOffset = 0;
    dv.setUint32(byteOffset, this.duration, true);
    byteOffset += 4;
    dv.setUint32(byteOffset, this.beats.length, true);
    byteOffset += 4;
    for (var i = 0; i < this.beats.length; ++i) {
        dv.setUint32(byteOffset, this.beats[i].millis, true);
        byteOffset += 4;
        dv.setFloat64(byteOffset, this.beats[i].bpm, true);
        byteOffset += 8;
    }
    dv.setUint8(byteOffset, 0x03);
    ++byteOffset;
    dv.setUint8(byteOffset, 0x03);
    ++byteOffset;
    dv.setUint32(byteOffset, this.notes.length, true);
    byteOffset += 4;
    for (var i = 0; i < this.notes.length; ++i) {
        dv.setUint16(byteOffset, this.notes[i].type, true);
        byteOffset += 2;
        dv.setUint32(byteOffset, this.notes[i].millis, true);
        byteOffset += 4;
        dv.setUint8(byteOffset, this.notes[i].track);
        byteOffset += 1;
        dv.setInt32(byteOffset, this.notes[i].action, true);
        byteOffset += 4;
    }
    return arrayBuffer;
};
/**
 * 找到指定时间所在的小节所在小节的bpm
 * @param {int} millis 指定时间（毫秒）
 * @return {number} 所在小节的bpm
 */
ImdFile.prototype.getBpm = function (millis) {
    // 找到第一个小于指定时间的小节
    for (var i = this.beats.length - 1; i >= 0; --i) {
        if (this.beats[i].millis <= millis) {
            return this.beats[i].bpm;
        }
    }
};
/**
 * 获取满连连击数
 * @return {number} 满连连击数
 */
ImdFile.prototype.allCombo = function () {
    var combo = 0;
    for (var i = 0; i < this.notes.length; ++i) {
        switch (this.notes[i].type) {
            case 0x00:
            case 0x01:
            case 0xa1:
                // 单点
                ++combo;
                break;
            case 0x02:
            case 0x62:
            case 0xa2:
            case 0x22:
                // 长键
                combo += 1 + parseInt(this.notes[i].action / parseInt(15000 / this.getBpm(this.notes[i].millis)));
                break;
        }
    }
    return combo;
};
/**
 * 计算轨道数
 * @return {number}
 */
ImdFile.prototype.countTracks = function () {
    var maxTrack = -1;
    for (var i = 0; i < this.notes.length; ++i) {
        // 比较最大起始轨道
        if (this.notes[i].track > maxTrack) {
            maxTrack = this.notes[i].track;
        }
        if ((this.notes[i].type & 0x0f) == 0x01) {
            // 如果是划键，另外比较最大结束轨道
            var endTrack = this.notes[i].track + this.notes[i].action;
            if (endTrack > maxTrack) {
                maxTrack = endTrack;
            }
        }
    }
    // 轨道数
    return maxTrack + 1;
};
/**
 * 镜面翻转
 * @return {ImdFile}
 */
ImdFile.prototype.mirror = function () {
    for (var i = 0; i < this.notes.length; ++i) {
        if ((this.notes[i].type & 0x0f) == 0x01) {
            this.notes[i].action = -this.notes[i].action;
        }
        this.notes[i].track = this.tracksCount - 1 - this.notes[i].track;
    }
    return this;
};
