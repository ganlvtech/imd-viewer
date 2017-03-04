# imd谱面预览器

WordPress插件：imd谱面预览器

**此代码可以独立于WordPress单独使用**

## 安装

1. 解压到`wp-content/plugins/`文件夹
2. 在WordPress后台插件管理页面启用插件

## 更新日志

* 2017-02-16 新增2个参数：“高度与宽度的比值”“一屏时间”
* 2017-03-02 新增1个参数：“播放速率”

## 说明

* 点击播放按钮才开始加载mp3和imd，所以，如果不点击播放，是不会消耗加载MP3的流量的。

## 使用方法

### imd短标签格式

```text
最简单形式：
[imd mp3="/wp-content/plugins/imd-viewer/tests/test.mp3" imd="/wp-content/plugins/imd-viewer/tests/test.imd"]

设置全部参数：
[imd mp3="/wp-content/plugins/imd-viewer/tests/test.mp3" imd="/wp-content/plugins/imd-viewer/tests/test.imd" height="0.5625" one_screen_time="500" rate="1.5"]
```

### 参数含义

| 参数 | 含义 | 默认值 | 其他说明 |
| :---: | :---: | :---: | :---: |
| mp3 | MP3链接 | （空）| 前面需要有http或https。<br>没有MP3谱面也不能正常播放 |
| imd | imd文件链接 | （空） | 前面需要有http或https。<br>受浏览器同源策略限制，不可以随意引用imd文件。<br>没有谱面MP3可以正常播放 |
| height | 表示高度与宽度的比值 | 0.5625 | 可以省略。<br>0.5625 == 9/16 |
| one_screen_time | 表示一屏时间（毫秒） | 900 | 可以省略，至少100 |
| rate | 表示播放速率（倍率） | 1 | 可以省略，1表示原速。 |

## 文件说明

    imd-viewer                  插件目录
    ├─README.md                 README文件
    ├─imd-viewer.php            WordPress插件入口文件
    │
    ├─css                       样式表文件夹
    │  └─style.css              样式表
    │
    └─js                        JavaScript文件夹
       ├─script.js              DOM操作
       ├─ImdFile.js             imd解码器
       └─ImdPainter.js          imd绘制类

## LICENSE

[AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)

    Copyright (C) 2017 Ganlv

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
