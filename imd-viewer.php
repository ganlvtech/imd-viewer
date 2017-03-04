<?php
/*
Plugin Name: Imd Viewer
Plugin URI: http://www.dreamimd.com/
Description: 节奏大师谱面在线预览
Version: 0.1
Author: Ganlv
Author URI: https://github.com/ganlvtech
License: AGPL-3.0 (https://www.gnu.org/licenses/agpl-3.0.en.html)

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
*/

/**
 * 节奏大师谱面在线预览
 *
 * imd短标签格式：
 * [imd mp3="/wp-content/plugins/imd-viewer/tests/test.mp3" imd="/wp-content/plugins/imd-viewer/tests/test.imd" height="0.5625" one_screen_time="500" rate="1.5"]
 * height表示高度与宽度的比值（可以省略，默认是0.5625（即9:16））
 * one_screen_time表示一屏时间（毫秒）（可以省略，默认是900）
 * rate表示播放速率（可以省略，默认是1）
 *
 * @param array $atts
 *
 * @return mixed|void
 */
function imd_viewer_shortcode_parser($atts)
{
    wp_enqueue_style('imd-viewer', plugins_url('css/style.css', __FILE__), array(), '0.1.3');
    wp_enqueue_script('jquery', 'https://code.jquery.com/jquery-1.4.2.min.js', array(), '1.4.2');
    wp_enqueue_script('ImdFile', plugins_url('js/ImdFile.js', __FILE__), array(), '0.1');
    wp_enqueue_script('ImdPainter', plugins_url('js/ImdPainter.js', __FILE__), array('ImdFile'), '0.1.1');
    wp_enqueue_script('imd-viewer', plugins_url('js/script.js', __FILE__), array('jquery', 'ImdFile', 'ImdPainter'), '0.1.5');

    $a = shortcode_atts(array(
        'mp3' => '',
        'imd' => '',
        'height' => '0.5625',
        'one_screen_time' => '900',
        'rate' => '1',
    ), $atts);

    $html = '
<div class="imd-viewer" data-imd="' . htmlentities($a['imd']) . '" data-one-screen-time="' . htmlentities($a['one_screen_time']) . '">
    <div class="imd-viewer-info">谱面预览，点击下方播放按钮开始加载mp3和imd。</div>
    <div class="imd-viewer-settings">
        <div><label>预览窗口高度：</label>预览窗口宽度×<input class="imd-viewer-input-height" value="' . htmlentities($a['height']) . '">。</div>
        <div><label>一屏时间：</label><input class="imd-viewer-input-one-screen-time" value="' . htmlentities($a['one_screen_time']) . '">毫秒(最小100)。</div>
        <div><label>播放速率：</label><input class="imd-viewer-input-rate" value="' . htmlentities($a['rate']) . '">倍（1表示原速）。</div>
    </div>
    <div class="imd-viewer-container">
        <canvas class="imd-viewer-canvas" width="864" height="480" data-height="' . htmlentities($a['height']) . '"></canvas>
    </div>
    <div>
        <audio class="imd-viewer-audio" src="' . htmlentities($a['mp3']) . '" preload="none" controls="controls"></audio>
    </div>
</div>';

    return apply_filters('imd_viewer_html', $html);
}

add_shortcode('imd', 'imd_viewer_shortcode_parser');