// ==UserScript==
// @name        绯月表情增强插件
// @namespace   https://greasyfork.org/users/5415
// @version     4.1.0.1
// @author      eddie32
// @modifier    喵拉布丁
// @description KF论坛专用的回复表情，插图扩展插件，在发帖时快速输入自定义表情和论坛BBCODE
// @icon        https://blog.nekohand.moe/favicon.ico
// @homepage    https://github.com/liu599/KF-Emotion-UserScript
// @include     http://*2dkf.com/*
// @include     http://*9moe.com/*
// @include     http://*kfgal.com/*
// @copyright   2014-2017, eddie32
// @grant       none
// @license     MIT
// @run-at      document-end
// ==/UserScript==
'use strict';

// 灰企鹅

var KfSmileList = [];
var KFSmileCodeList = [];
var kfImgPath = typeof imgpath !== 'undefined' ? imgpath : '';
if (typeof Info !== 'undefined' && typeof Info.imgPath !== 'undefined') kfImgPath = Info.imgPath;
for (var i = 0; i < 48; i++) {
    KfSmileList.push('/' + kfImgPath + '/post/smile/em/em' + (i >= 9 ? i + 1 : '0' + (i + 1)) + '.gif');
    KFSmileCodeList.push('[s:' + (i + 10) + ']');
}

// AC娘表情
var AcSmileList = [];
for (var _i = 0; _i < 50; _i++) {
    AcSmileList.push('http://smile.nekohand.moe/blogAcc/LoveliveEmotion01/EmCol/ACFUN/New/' + (_i + 1) + '.png');
}
for (var _i2 = 50; _i2 < 90; _i2++) {
    AcSmileList.push('http://smile.nekohand.moe/blogAcc/LoveliveEmotion01/EmCol/ACFUN/Niming/' + (_i2 - 50 >= 9 ? _i2 - 49 : '0' + (_i2 - 49)) + '.gif');
}

// 常用表情
var CommonSmileList = [];
for (var _i3 = 0; _i3 < 62; _i3++) {
    CommonSmileList.push('http://nekohand.moe/spsmile/01Sora/0xx' + (_i3 + 2) + '.png');
}
for (var _i4 = 0; _i4 < 19; _i4++) {
    CommonSmileList.push('http://ss.nekohand.moe/Asource/EmotionPic/KFEM (' + (_i4 + 1) + ').gif');
}

// 阿卡林表情
var AkarinSmileList = [];
for (var _i5 = 0; _i5 < 71; _i5++) {
    AkarinSmileList.push('http://smile.nekohand.moe/blogAcc/LoveliveEmotion01/EmCol/akari/akari' + (_i5 + 1) + '.png');
}
for (var _i6 = 0; _i6 < 20; _i6++) {
    AkarinSmileList.push('http://smile.nekohand.moe/blogAcc/LoveliveEmotion01/EmCol/Dynamic/akari' + (_i6 + 1) + '.gif');
}

// B站和tora酱表情
var BiliBiliSmileList = [];
for (var _i7 = 0; _i7 < 16; _i7++) {
    BiliBiliSmileList.push('http://smile.nekohand.moe/blogAcc/LoveliveEmotion01/EmCol/BiliBili/2233 (' + (_i7 + 1) + ').gif');
}
for (var _i8 = 16; _i8 < 30; _i8++) {
    BiliBiliSmileList.push('http://smile.nekohand.moe/blogAcc/LoveliveEmotion01/EmCol/BiliBili/bilibiliTV (' + (_i8 + 1 - 17) + ').png');
}
for (var _i9 = 0; _i9 < 14; _i9++) {
    BiliBiliSmileList.push('http://smile.nekohand.moe/blogAcc/LoveliveEmotion01/EmCol/tora/0' + (_i9 >= 9 ? _i9 + 1 : '0' + (_i9 + 1)) + '.jpg');
}

// lovelive表情（小）
var LoveliveSmallSmileList = [];
for (var _i10 = 0; _i10 < 40; _i10++) {
    LoveliveSmallSmileList.push('http://smile.nekohand.moe/blogAcc/LoveliveEmotion02/Small/Lovelive2nd' + (_i10 + 1) + '.png');
    LoveliveSmallSmileList.push('http://smile.nekohand.moe/blogAcc/LoveliveEmotion01/Small/Lovelive' + (_i10 + 1) + '.png');
}

/**
 * 表情菜单
 */
var MenuList = {
    KfSmile: { datatype: 'imageLink', title: 'KF自带', addr: KfSmileList, ref: KFSmileCodeList },
    Shortcut: {
        datatype: 'plain',
        title: '快捷',
        addr: ['[sell=100][/sell]', '[quote][/quote]', '[hide=100][/hide]', '[code][/code]', '[strike][/strike]', '[fly][/fly]', '[color=#00FF00][/color]', '[b][/b]', '[u][/u]', '[i][/i]', '[hr]', '[backcolor=][/backcolor]', '[img][/img]'],
        ref: ['出售贴sell=售价', '引用', '隐藏hide=神秘等级', '插入代码', '删除线', '跑马灯', '文字颜色', '粗体', '下划线', '斜体', '水平线', '背景色', '插入图片']
    },
    Emoji: {
        datatype: 'plain',
        title: '颜文字',
        addr: ['(●・ 8 ・●)', '╰(๑◕ ▽ ◕๑)╯', '(﹡ˆˆ﹡)', '〜♪♪', '(ﾟДﾟ≡ﾟДﾟ)', '(＾o＾)ﾉ', '(|||ﾟДﾟ)', '(`ε´ )', '(╬ﾟдﾟ)', '(|||ﾟдﾟ)', '(￣∇￣)', '(￣3￣)', '(￣ｰ￣)', '(￣ . ￣)', '(￣︿￣)', '(￣︶￣)', '(*´ω`*)', '(・ω・)', '(⌒▽⌒)', '(￣▽￣）', '(=・ω・=)', '(｀・ω・´)', '(〜￣△￣)〜', '(･∀･)', '(°∀°)ﾉ', '(￣3￣)', '╮(￣▽￣)╭', '( ´_ゝ｀)', '←_←', '→_→', '(&lt;_&lt;)', '(&gt;_&gt;)', '(;¬_¬)', '(▔□▔)/', '(ﾟДﾟ≡ﾟдﾟ)!?', 'Σ(ﾟдﾟ;)', 'Σ( ￣□￣||)', '(´；ω；`)', '（/TДT)/', '(^・ω・^ )', '(｡･ω･｡)', '(●￣(ｴ)￣●)', 'ε=ε=(ノ≧∇≦)ノ', '(´･_･`)', '(-_-#)', '（￣へ￣）', '(￣ε(#￣) Σ', 'ヽ(`Д´)ﾉ', '(╯°口°)╯(┴—┴', '（#-_-)┯━┯', '_(:3」∠)_', '(笑)', '(汗)', '(泣)', '(苦笑)', '(´・ω・`)', '(╯°□°）╯︵ ┻━┻', '(╯‵□′)╯︵┻━┻', '( ´ρ`)', '( ﾟωﾟ)', '(oﾟωﾟo)', '(　^ω^)', '(｡◕∀◕｡)', '/( ◕‿‿◕ )\\', 'ε٩( º∀º )۶з', '(￣ε(#￣)☆╰╮(￣▽￣///)', '（●´3｀）~♪', '_(:з」∠)_', 'хорошо!', '＼(^o^)／', '(•̅灬•̅ )', '(ﾟДﾟ)', 'まったく、小学生は最高だぜ！！', 'ε=ε=ε=┏(゜ロ゜;)┛', '(；°ほ°)', 'もうこの国は駄目だぁ', 'ヽ(✿ﾟ▽ﾟ)ノ', '焔に舞い上がるスパークよ、邪悪な異性交際に、天罰を与え！', 'お疲れ様でした']
    },
    Acfun: { datatype: 'image', title: 'ACFUN', addr: AcSmileList },
    Common: { datatype: 'image', title: '常用', addr: CommonSmileList },
    Akari: { datatype: 'image', title: 'Akari', addr: AkarinSmileList },
    BiliBili: { datatype: 'image', title: 'BiliBili', addr: BiliBiliSmileList },
    LoveLive: { datatype: 'image', title: 'LoveLive', addr: LoveliveSmallSmileList }
};

/**
 * 添加BBCode
 * @param textArea 文本框
 * @param {string} code BBCode
 * @param {string} selText 选择文本
 */
var addCode = function addCode(textArea, code) {
    var selText = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    var startPos = !selText ? code.indexOf('[img]') > -1 ? code.length : code.indexOf(']') + 1 : code.indexOf(selText);
    if (typeof textArea.selectionStart !== 'undefined') {
        var prePos = textArea.selectionStart;
        textArea.value = textArea.value.substring(0, prePos) + code + textArea.value.substring(textArea.selectionEnd);
        textArea.selectionStart = prePos + startPos;
        textArea.selectionEnd = prePos + startPos + selText.length;
    } else {
        textArea.value += code;
    }
};

/**
 * 获取表情面板内容
 * @param {string} key 菜单关键字
 * @returns {string} 表情面板内容
 */
var getSmilePanelContent = function getSmilePanelContent(key) {
    var content = '';
    var data = MenuList[key];
    if (!data) return content;
    for (var _i11 = 0; _i11 < data.addr.length; _i11++) {
        if (data.datatype === 'image') {
            content += '<img class="kfe-smile" src="' + data.addr[_i11] + '" alt="[\u8868\u60C5]">';
        } else if (data.datatype === 'imageLink') {
            var ref = typeof data.ref !== 'undefined' && typeof data.ref[_i11] !== 'undefined' ? data.ref[_i11] : '';
            content += '<img class="kfe-smile" data-code="' + ref + '" src="' + data.addr[_i11] + '" alt="[\u8868\u60C5]">';
        } else if (data.datatype === 'plain') {
            var _ref = typeof data.ref !== 'undefined' && typeof data.ref[_i11] !== 'undefined' ? data.ref[_i11] : data.addr[_i11];
            content += '<a class="kfe-smile-text" data-code="' + data.addr[_i11] + '" href="#">' + _ref + '</a>';
        }
    }
    return '<div class="kfe-smile-panel" data-key="' + key + '">' + content + '</div>';
};

/**
 * 获取子菜单内容
 * @returns {string} 子菜单内容
 */
var getSubMenuContent = function getSubMenuContent() {
    var content = '';
    $.each(MenuList, function (key, data) {
        content += '<a class="kfe-sub-menu" data-key="' + key + '" href="#" title="' + data.title + '">' + data.title + '</a>';
    });
    return content;
};

/**
 * 创建容器
 * @param textArea 文本框
 */
var createContainer = function createContainer(textArea) {
    var $container = $('\n<div class="kfe-container">\n  <div class="kfe-menu">\n    <span title="made by eddie32 version 4.0.0; modified by \u55B5\u62C9\u5E03\u4E01" style="cursor: pointer;"><b>\u56E7\u2468</b></span>\n    ' + getSubMenuContent() + '\n    <span class="kfe-close-panel">[-]</span>\n  </div>\n</div>\n').insertBefore($(textArea));
    $container.on('click', '.kfe-sub-menu', function (e) {
        e.preventDefault();
        var key = $(this).data('key');
        if (!key) return;
        $container.find('.kfe-smile-panel').hide();
        var $panel = $container.find('.kfe-smile-panel[data-key="' + key + '"]');
        if ($panel.length > 0) $panel.show();else $(getSmilePanelContent(key)).appendTo($container).show();
    }).on('click', '.kfe-smile, .kfe-smile-text', function (e) {
        e.preventDefault();
        var $this = $(this);
        var code = $this.data('code');
        if (!code) code = '[img]' + $this.attr('src') + '[/img]';
        addCode(textArea, code);
        if (/(Mobile|MIDP)/i.test(navigator.userAgent)) textArea.blur();else textArea.focus();
    }).find('.kfe-close-panel').click(function () {
        $container.find('.kfe-smile-panel').hide();
    });
};

/**
 * 添加CSS
 */
var appendCss = function appendCss() {
    $('head').append('\n<style>\n  .kfe-container { padding: 5px; vertical-align: middle; font: 12px/1.7em "sans-serif"; }\n  .kfe-menu { margin-bottom: 5px; }\n  .kfe-sub-menu { margin: 0 7px; text-decoration: none; border-bottom: 2px solid transparent; }\n  .kfe-sub-menu:hover { text-decoration: none; border-color: deeppink; }\n  .kfe-smile-panel { display: none; height: 120px; padding: 5px 3px; overflow-y: auto; border-top: 1px solid #ddd; }\n  .kfe-smile-panel[data-key="Shortcut"] { height: 50px; }\n  .kfe-smile { display: inline-block; max-width: 60px; max-height: 60px; cursor: pointer; }\n  .kfe-smile-text { display: inline-block; padding: 3px 5px; }\n  .kfe-smile-text:hover { color: #fff !important; background-color: #2b2b2b; text-decoration: none; }\n  .kfe-close-panel { cursor: pointer; }\n</style>\n');
};

/**
 * 初始化
 */
var init = function init() {
    var $textAreas = $('textarea');
    if (!$textAreas.length) return;
    appendCss();
    $textAreas.each(function () {
        createContainer(this);
    });
};

init();