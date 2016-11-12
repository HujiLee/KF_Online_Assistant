/* 日志对话框模块 */
'use strict';
import * as Util from './Util';
import * as Dialog from './Dialog';
import * as Func from './Func';
import {
    read as readConfig,
    write as writeConfig,
} from './Config';
import * as Log from './Log';
import * as Item from './Item';

/**
 * 显示日志对话框
 */
export const show = function () {
    const dialogName = 'pd_log';
    if ($('#' + dialogName).length > 0) return;
    readConfig();
    Func.run('LogDialog.show_before_');
    let html = `
<div class="pd_cfg_main">
  <div class="pd_log_nav">
    <a class="pd_disabled_link" href="#">&lt;&lt;</a>
    <a style="padding: 0 7px;" class="pd_disabled_link" href="#">&lt;</a>
    <h2 class="pd_custom_tips">暂无日志</h2>
    <a style="padding: 0 7px;" class="pd_disabled_link" href="#">&gt;</a>
    <a class="pd_disabled_link" href="#">&gt;&gt;</a>
  </div>
  <fieldset>
    <legend>日志内容</legend>
    <div>
      <strong>排序方式：</strong>
      <label title="按时间顺序排序"><input type="radio" name="sortType" value="time" checked> 按时间</label>
      <label title="按日志类别排序"><input type="radio" name="sortType" value="type"> 按类别</label>
    </div>
    <div class="pd_stat pd_log_content">暂无日志</div>
  </fieldset>
  <fieldset>
    <legend>统计结果</legend>
    <div>
      <strong>统计范围：</strong>
      <label title="显示当天的统计结果"><input type="radio" name="statType" value="current" checked> 当天</label>
      <label title="显示距该日N天内的统计结果"><input type="radio" name="statType" value="custom"></label>
      <label title="显示距该日N天内的统计结果"><input name="statDays" type="text" style="width: 22px;" maxlength="3"> 天内</label>
      <label title="显示全部统计结果"><input type="radio" name="statType" value="all"> 全部</label>
    </div>
    <div class="pd_stat" data-name="stat">暂无日志</div>
  </fieldset>
</div>
<div class="pd_cfg_btns">
  <span class="pd_cfg_about"><a data-name="openImOrExLogDialog" href="#">导入/导出日志</a></span>
  <button>关闭</button> <button>清除日志</button>
</div>`;
    let $dialog = Dialog.create(dialogName, 'KFOL助手日志', html);

    let log = Log.read();
    let dateList = [];
    let curIndex = 0;
    if (!$.isEmptyObject(log)) {
        dateList = Util.getObjectKeyList(log, 1);
        curIndex = dateList.length - 1;
        $dialog.find('.pd_log_nav h2').attr('title', `总共记录了${dateList.length}天的日志`).text(dateList[curIndex]);
        if (dateList.length > 1) {
            $dialog.find('.pd_log_nav > a:eq(0)').attr('title', dateList[0]).removeClass('pd_disabled_link');
            $dialog.find('.pd_log_nav > a:eq(1)').attr('title', dateList[curIndex - 1]).removeClass('pd_disabled_link');
        }
    }
    $dialog.find('.pd_log_nav a').click(function (e) {
        e.preventDefault();
        if ($(this).is('.pd_log_nav a:eq(0)')) {
            curIndex = 0;
        }
        else if ($(this).is('.pd_log_nav a:eq(1)')) {
            if (curIndex > 0) curIndex--;
            else return;
        }
        else if ($(this).is('.pd_log_nav a:eq(2)')) {
            if (curIndex < dateList.length - 1) curIndex++;
            else return;
        }
        else if ($(this).is('.pd_log_nav a:eq(3)')) {
            curIndex = dateList.length - 1;
        }
        $dialog.find('.pd_log_nav h2').text(dateList[curIndex]);
        showLogContent(log, dateList[curIndex], $dialog);
        showLogStat(log, dateList[curIndex], $dialog);
        if (curIndex > 0) {
            $dialog.find('.pd_log_nav > a:eq(0)').attr('title', dateList[0]).removeClass('pd_disabled_link');
            $dialog.find('.pd_log_nav > a:eq(1)').attr('title', dateList[curIndex - 1]).removeClass('pd_disabled_link');
        }
        else {
            $dialog.find('.pd_log_nav > a:lt(2)').removeAttr('title').addClass('pd_disabled_link');
        }
        if (curIndex < dateList.length - 1) {
            $dialog.find('.pd_log_nav > a:eq(2)').attr('title', dateList[curIndex - 1]).removeClass('pd_disabled_link');
            $dialog.find('.pd_log_nav > a:eq(3)').attr('title', dateList[dateList.length - 1]).removeClass('pd_disabled_link');
        }
        else {
            $dialog.find('.pd_log_nav > a:gt(1)').removeAttr('title').addClass('pd_disabled_link');
        }
    }).end().find('[name="sortType"]').click(function () {
        let value = $(this).val();
        if (Config.logSortType !== value) {
            Config.logSortType = value;
            writeConfig();
            showLogContent(log, dateList[curIndex], $dialog);
        }
    }).end().find('[name="statType"]').click(function () {
        let value = $(this).val();
        if (Config.logStatType !== value) {
            Config.logStatType = value;
            writeConfig();
            showLogStat(log, dateList[curIndex], $dialog);
        }
    }).end().find('[name="statDays"]').keyup(function () {
        let days = parseInt($(this).val());
        if (days > 0 && Config.logStatDays !== days) {
            Config.logStatDays = days;
            writeConfig();
            $dialog.find('[name="statType"][value="custom"]:not(:checked)').click();
            showLogStat(log, dateList[curIndex], $dialog);
        }
    }).end().find(`[name="sortType"][value="${Config.logSortType}"]`).click()
        .end().find(`[name="statType"][value="${Config.logStatType}"]`).click()
        .end().find('[name="statDays"]').val(Config.logStatDays);

    $dialog.find('.pd_cfg_btns > button:first')
        .click(() => Dialog.close(dialogName))
        .next('button')
        .click(function (e) {
            e.preventDefault();
            if (confirm('是否清除所有日志？')) {
                Log.clear();
                alert('日志已清除');
                location.reload();
            }
        });

    $dialog.find('[data-name="openImOrExLogDialog"]').click(function (e) {
        e.preventDefault();
        showImportOrExportLogDialog();
    });

    showLogContent(log, dateList[curIndex], $dialog);
    showLogStat(log, dateList[curIndex], $dialog);

    if ($(window).height() <= 750) $dialog.find('.pd_log_content').css('height', '216px');
    Dialog.show(dialogName);
    $dialog.find('input:first').focus();
    Func.run('LogDialog.show_after_');
};

/**
 * 显示指定日期的日志内容
 * @param {{}} log 日志对象
 * @param {string} date 日志对象关键字
 * @param {jQuery} $dialog 日志对话框对象
 */
const showLogContent = function (log, date, $dialog) {
    if (!Array.isArray(log[date])) return;
    $dialog.find('.pd_log_content').html(getLogContent(log, date, Config.logSortType))
        .parent().find('legend:first-child').text(`日志内容 (共${log[date].length}项)`);
};

/**
 * 获取指定日期的日志内容
 * @param {{}} log 日志对象
 * @param {string} date 日志对象关键字
 * @param {string} logSortType 日志内容的排序方式
 * @returns {string} 指定日期的日志内容
 */
const getLogContent = function (log, date, logSortType) {
    let logList = log[date];
    if (logSortType === 'type') {
        const sortTypeList = ['捐款', '领取争夺奖励', '批量攻击', '试探攻击', '抽取神秘盒子', '抽取道具或卡片', '使用道具', '恢复道具', '循环使用道具',
            '将道具转换为能量', '将卡片转换为VIP时间', '购买道具', '统计道具购买价格', '出售道具', '神秘抽奖', '统计神秘抽奖结果', '神秘等级升级',
            '神秘系数排名变化', '批量转账', '购买帖子', '自动存款'];
        logList.sort((a, b) => sortTypeList.indexOf(a.type) > sortTypeList.indexOf(b.type));
    }
    else {
        logList.sort((a, b) => a.time > b.time);
    }

    let content = '', curType = '';
    for (let {time, type, action, gain, pay} of logList) {
        if (typeof time === 'undefined' || typeof type === 'undefined' || typeof action === 'undefined') continue;
        let d = new Date(time);
        if (logSortType === 'type') {
            if (curType !== type) {
                content += `<h3>【${type}】</h3>`;
                curType = type;
            }
            content += `<p><b>${Util.getTimeString(d)}：</b>${action.replace(/`([^`]+?)`/g, '<b style="color: #f00;">$1</b>')}`;
        }
        else {
            content += `<p><b>${Util.getTimeString(d)} (${type})：</b>${action.replace(/`([^`]+?)`/g, '<b style="color: #f00;">$1</b>')}`;
        }

        let stat = '';
        if ($.type(gain) === 'object' && !$.isEmptyObject(gain)) {
            stat += '，';
            for (let k of Object.keys(gain)) {
                if (k === 'item') {
                    for (let itemName of Object.keys(gain[k])) {
                        stat += `<i>${itemName}<em>+${gain[k][itemName].toLocaleString()}</em></i> `;
                    }
                }
                else {
                    stat += `<i>${k}<em>+${gain[k].toLocaleString()}</em></i> `;
                }
            }
        }
        if ($.type(pay) === 'object' && !$.isEmptyObject(pay)) {
            if (!stat) stat += '，';
            for (let k of Object.keys(pay)) {
                if (k === 'item') {
                    for (let itemName of Object.keys(pay[k])) {
                        stat += `<i>${itemName}<ins>${pay[k][itemName].toLocaleString()}</ins></i> `;
                    }
                }
                else {
                    stat += `<i>${k}<ins>${pay[k].toLocaleString()}</ins></i> `;
                }
            }
        }

        content += stat + '</p>';
    }

    return content;
};

/**
 * 显示指定日期的日志统计结果
 * @param {{}} log 日志对象
 * @param {string} date 日志对象关键字
 * @param {jQuery} $dialog 日志对话框对象
 */
const showLogStat = function (log, date, $dialog) {
    if (!Array.isArray(log[date])) return;
    $dialog.find('[data-name="stat"]').html(getLogStat(log, date, Config.logStatType));
};

/**
 * 获取指定日期的日志统计结果
 * @param {{}} log 日志对象
 * @param {string} date 日志对象关键字
 * @param {string} logStatType 日志统计范围类型
 * @returns {string} 指定日期的日志统计结果
 */
const getLogStat = function (log, date, logStatType) {
    let rangeLog = {};

    if (logStatType === 'custom') {
        let minDate = new Date(date);
        minDate.setDate(minDate.getDate() - Config.logStatDays + 1);
        minDate = Util.getDateString(minDate);
        for (let d of Util.getObjectKeyList(log, 1)) {
            if (d >= minDate && d <= date) rangeLog[d] = log[d];
        }
    }
    else if (logStatType === 'all') {
        rangeLog = log;
    }
    else {
        rangeLog[date] = log[date];
    }

    let income = {}, expense = {}, profit = {};
    let validItemNum = 0, highValidItemNum = 0, validItemStat = {}, invalidItemNum = 0, highInvalidItemNum = 0, invalidItemStat = {};
    let buyItemTotalNum = 0, buyItemTotalPrice = 0, totalBuyItemPricePercent = 0, minBuyItemPricePercent = 0,
        maxBuyItemPricePercent = 0, buyItemStat = {};
    let invalidKeyList = ['item', '夺取KFB', 'VIP小时', '神秘', '燃烧伤害', '命中', '闪避', '暴击比例', '暴击几率', '防御', '有效道具', '无效道具'];
    for (let d in rangeLog) {
        for (let {type, action, gain, pay, notStat} of rangeLog[d]) {
            if (typeof type === 'undefined' || typeof notStat !== 'undefined') continue;
            if ($.type(gain) === 'object') {
                for (let k of Object.keys(gain)) {
                    if (invalidKeyList.includes(k)) continue;
                    if (typeof income[k] === 'undefined') income[k] = gain[k];
                    else income[k] += gain[k];
                }
            }
            if ($.type(pay) === 'object') {
                for (let k of Object.keys(pay)) {
                    if (invalidKeyList.includes(k)) continue;
                    if (typeof expense[k] === 'undefined') expense[k] = pay[k];
                    else expense[k] += pay[k];
                }
            }

            if ((type === '使用道具' || type === '循环使用道具') && $.type(gain) === 'object') {
                let matches = /【`Lv.(\d+)：(.+?)`】/.exec(action);
                if (matches) {
                    let itemLevel = parseInt(matches[1]);
                    let itemName = matches[2];
                    if (gain['有效道具'] > 0) {
                        validItemNum += gain['有效道具'];
                        if (itemLevel >= 3) highValidItemNum += gain['有效道具'];
                        if (typeof validItemStat[itemName] === 'undefined') validItemStat[itemName] = 0;
                        validItemStat[itemName] += gain['有效道具'];
                    }
                    if (gain['无效道具'] > 0) {
                        invalidItemNum += gain['无效道具'];
                        if (itemLevel >= 3) highInvalidItemNum += gain['无效道具'];
                        if (typeof invalidItemStat[itemName] === 'undefined') invalidItemStat[itemName] = 0;
                        invalidItemStat[itemName] += gain['无效道具'];
                    }
                }
            }
            else if (type === '统计道具购买价格' && $.type(pay) === 'object' && typeof pay['KFB'] !== 'undefined') {
                let matches = /共有`(\d+)`个【`Lv.\d+：(.+?)`】道具统计成功，总计价格：`[^`]+?`，平均价格：`[^`]+?`\(`(\d+)%`\)，最低价格：`[^`]+?`\(`(\d+)%`\)，最高价格：`[^`]+?`\(`(\d+)%`\)/.exec(action);
                if (matches) {
                    let itemNum = parseInt(matches[1]);
                    let itemName = matches[2];
                    if (typeof buyItemStat[itemName] === 'undefined') {
                        buyItemStat[itemName] = {
                            '道具数量': 0,
                            '总计价格': 0,
                            '总计价格比例': 0,
                            '最低价格比例': 0,
                            '最高价格比例': 0,
                        };
                    }
                    buyItemTotalNum += itemNum;
                    buyItemStat[itemName]['道具数量'] += itemNum;
                    buyItemTotalPrice += Math.abs(pay['KFB']);
                    buyItemStat[itemName]['总计价格'] += Math.abs(pay['KFB']);
                    totalBuyItemPricePercent += parseInt(matches[3]) * itemNum;
                    buyItemStat[itemName]['总计价格比例'] += parseInt(matches[3]) * itemNum;
                    if (minBuyItemPricePercent <= 0 || parseInt(matches[4]) < minBuyItemPricePercent) minBuyItemPricePercent = parseInt(matches[4]);
                    if (parseInt(matches[5]) > maxBuyItemPricePercent) maxBuyItemPricePercent = parseInt(matches[5]);
                    if (buyItemStat[itemName]['最低价格比例'] <= 0 || parseInt(matches[4]) < buyItemStat[itemName]['最低价格比例'])
                        buyItemStat[itemName]['最低价格比例'] = parseInt(matches[4]);
                    if (parseInt(matches[5]) > buyItemStat[itemName]['最高价格比例']) buyItemStat[itemName]['最高价格比例'] = parseInt(matches[5]);
                }
            }
        }
    }

    let content = '';
    let sortStatTypeList = ['KFB', '经验值', '能量', '贡献', '道具', '已使用道具', '卡片'];
    content += '<strong>收获：</strong>';
    for (let key of Util.getSortedObjectKeyList(sortStatTypeList, income)) {
        profit[key] = income[key];
        content += `<i>${key}<em>+${income[key].toLocaleString()}</em></i> `;
    }
    content += '<br><strong>付出：</strong>';
    for (let key of Util.getSortedObjectKeyList(sortStatTypeList, expense)) {
        if (typeof profit[key] === 'undefined') profit[key] = expense[key];
        else profit[key] += expense[key];
        content += `<i>${key}<ins>${expense[key].toLocaleString()}</ins></i> `;
    }
    content += '<br><strong>结余：</strong>';
    for (let key of Util.getSortedObjectKeyList(sortStatTypeList, profit)) {
        content += `<i>${key}${Util.getStatFormatNumber(profit[key])}</i> `;
    }

    content += '<div style="margin: 5px 0; border-bottom: 1px dashed #ccccff;"></div>';

    const sortItemTypeList = ['零时迷子的碎片', '被遗弃的告白信', '学校天台的钥匙', 'TMA最新作压缩包', 'LOLI的钱包', '棒棒糖', '蕾米莉亚同人漫画',
        '十六夜同人漫画', '档案室钥匙', '傲娇LOLI娇蛮音CD', '整形优惠卷', '消逝之药'];
    content += `\n<strong>有效道具统计：</strong><i>有效道具<span class="pd_stat_extra"><em>+${validItemNum.toLocaleString()}</em>` +
        `(<em title="3级以上有效道具">+${highValidItemNum.toLocaleString()}</em>)</i></span> `;
    for (let itemName of Util.getSortedObjectKeyList(sortItemTypeList, validItemStat)) {
        content += `<i>${itemName}<em>+${validItemStat[itemName].toLocaleString()}</em></i> `;
    }
    content += `<br><strong>无效道具统计：</strong><i>无效道具<span class="pd_stat_extra"><em>+${invalidItemNum.toLocaleString()}</em>` +
        `(<em title="3级以上无效道具">+${highInvalidItemNum.toLocaleString()}</em>)</i></span> `;
    for (let itemName of Util.getSortedObjectKeyList(sortItemTypeList, invalidItemStat)) {
        content += `<i>${itemName}<em>+${invalidItemStat[itemName].toLocaleString()}</em></i> `;
    }

    let buyItemStatContent = '';
    let buyItemStatKeyList = Util.getObjectKeyList(buyItemStat, 0);
    buyItemStatKeyList.sort((a, b) => Item.getLevelByName(a) > Item.getLevelByName(b));
    for (let key of buyItemStatKeyList) {
        let item = buyItemStat[key];
        buyItemStatContent += `<i class="pd_custom_tips" title="总价：${item['总计价格'].toLocaleString()}，` +
            `平均价格比例：${item['道具数量'] > 0 ? Util.getFixedNumLocStr(item['总计价格比例'] / item['道具数量'], 2) : 0}%，` +
            `最低价格比例：${item['最低价格比例']}%，最高价格比例：${item['最高价格比例']}%">${key}<em>+${item['道具数量']}</em></i> `;
    }
    content += `<br><strong>购买道具统计：</strong><i>道具<em>+${buyItemTotalNum}</em></i> ` +
        `<i>道具价格<span class="pd_stat_extra"><em title="道具总价">+${buyItemTotalPrice.toLocaleString()}</em>` +
        `(<em title="平均价格比例">${buyItemTotalNum > 0 ? Util.getFixedNumLocStr(totalBuyItemPricePercent / buyItemTotalNum, 2) : 0}%</em>|` +
        `<em title="最低价格比例">${minBuyItemPricePercent}%</em>|<em title="最高价格比例">${maxBuyItemPricePercent}%</em>)</span></i> ${buyItemStatContent}`;

    return content;
};

/**
 * 显示导入或导出日志对话框
 */
const showImportOrExportLogDialog = function () {
    const dialogName = 'pd_im_or_ex_log';
    if ($('#' + dialogName).length > 0) return;
    let log = Log.read();
    let html = `
<div class="pd_cfg_main">
  <div style="margin-top: 5px;">
    <label style="color: #f00;"><input type="radio" name="logType" value="setting" checked> 导入/导出日志</label>
    <label style="color: #00f;"><input type="radio" name="logType" value="text"> 导出日志文本</label>
  </div>
  <div data-name="logSetting">
    <strong>导入日志：</strong>将日志内容粘贴到文本框中并点击合并或覆盖按钮即可<br>
    <strong>导出日志：</strong>复制文本框里的内容并粘贴到文本文件里即可<br>
    <textarea name="setting" style="width: 600px; height: 400px; word-break: break-all;"></textarea>
  </div>
  <div data-name="logText" style="display: none;">
    <strong>导出日志文本</strong>：复制文本框里的内容并粘贴到文本文件里即可
    <div>
      <label title="按时间顺序排序"><input type="radio" name="sortType2" value="time" checked> 按时间</label>
      <label title="按日志类别排序"><input type="radio" name="sortType2" value="type"> 按类别</label>
      <label title="在日志文本里显示每日以及全部数据的统计结果"><input type="checkbox" name="showStat" checked> 显示统计</label>
    </div>
    <textarea name="text" style="width: 600px; height: 400px;" readonly></textarea>
  </div>
</div>
<div class="pd_cfg_btns">
  <button name="merge">合并日志</button>
  <button name="overwrite" style="color: #f00;">覆盖日志</button>
  <button>关闭</button>
</div>`;

    let $dialog = Dialog.create(dialogName, '导入或导出日志', html);
    $dialog.find('[name="sortType2"], [name="showStat"]').click(function () {
        showLogText(log, $dialog);
        $dialog.find('[name="text"]').select();
    }).end().find('[name="logType"]').click(function () {
        let type = $(this).val();
        $dialog.find(`[data-name="log${type === 'text' ? 'Setting' : 'Text'}"]`).hide();
        $dialog.find(`[data-name="log${type === 'text' ? 'Text' : 'Setting'}"]`).show();
        $dialog.find(`[data-name="log${type === 'text' ? 'Text' : 'Setting'}"]`).select();
    }).end().find('.pd_cfg_btns > button').click(function (e) {
        e.preventDefault();
        let name = $(this).attr('name');
        if (name === 'merge' || name === 'overwrite') {
            if (!confirm(`是否将文本框中的日志${name === 'overwrite' ? '覆盖' : '合并'}到本地日志？`)) return;
            let newLog = $.trim($dialog.find('[name="setting"]').val());
            if (!newLog) return;
            try {
                newLog = JSON.parse(newLog);
            }
            catch (ex) {
                alert('日志有错误');
                return;
            }
            if (!newLog || $.type(newLog) !== 'object') {
                alert('日志有错误');
                return;
            }
            if (name === 'merge') log = Log.getMergeLog(log, newLog);
            else log = newLog;
            Log.write(log);
            alert('日志已导入');
            location.reload();
        }
        else {
            return Dialog.close(dialogName);
        }
    });
    Dialog.show(dialogName);
    $dialog.find('[name="setting"]').val(JSON.stringify(log)).select();
    $dialog.find(`[name="sortType2"][value="${Config.logSortType}"]`).prop('checked', true).triggerHandler('click');
    Func.run('LogDialog.showImportOrExportLogDialog_after_');
};

/**
 * 显示日志文本
 * @param {{}} log 日志对象
 * @param {jQuery} $dialog 导入或导出日志对话框对象
 */
const showLogText = function (log, $dialog) {
    let logSortType = $dialog.find('input[name="sortType2"]:checked').val();
    let isShowStat = $dialog.find('[name="showStat"]').prop('checked');
    let content = '', lastDate = '';
    for (let date of Object.keys(log)) {
        if (!Array.isArray(log[date])) continue;
        if (lastDate > date) lastDate = date;
        content += `【${date}】(共${log[date].length}项)\n${logSortType === 'type' ? '' : '\n'}` +
            getLogContent(log, date, logSortType)
                .replace(/<h3>/g, '\n')
                .replace(/<\/h3>/g, '\n')
                .replace(/<\/p>/g, '\n')
                .replace(/(<.+?>|<\/.+?>)/g, '')
                .replace(/`/g, '');
        if (isShowStat) {
            content += `${'-'.repeat(46)}\n合计：\n${getLogStat(log, date, 'current')
                .replace(/<br\s*\/?>/g, '\n')
                .replace(/(<.+?>|<\/.+?>)/g, '')}\n`;
        }
        content += '='.repeat(46) + '\n';
    }
    if (content && isShowStat) {
        content += '\n总计：\n' + getLogStat(log, lastDate, 'all').replace(/<br\s*\/?>/g, '\n').replace(/(<.+?>|<\/.+?>)/g, '');
    }
    $dialog.find('[name="text"]').val(content);
};
