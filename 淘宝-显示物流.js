// ==UserScript==
// @name         淘宝-快捷指令
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
// @description  淘宝-->已买到的宝贝-->待收货
// @author       沐琪
// @match        https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm?action=itemlist/BoughtQueryAction&event_submit_do_query=1&tabCode=waitConfirm
// ==/UserScript==

(function () {
    'use strict';

    // 新建按钮
    function addNewButton(buttonName) {
        // 父元素
        const parentElement = document.querySelector('.tabs-mod__main___74ZLv');
        // 最后一个子元素
        const lastChildElement = parentElement.lastElementChild;

        const span = document.createElement('span');
        span.className = 'tabs-mod__sep___waJNr';
        span.textContent = '|';
        lastChildElement.appendChild(span);

        const div = document.createElement('div');
        div.className = 'tabs-mod__tab___3vuhD';

        const span1 = document.createElement('span');
        span1.className = 'nav-mod__tab___1PnZ4 nav-mod__small___2yzl8';

        const span2 = document.createElement('span');
        span2.className = 'nav-mod__text___3O7jT';
        span2.textContent = buttonName;

        const span3 = document.createElement('span');
        span3.className = 'nav-mod__count___hc9IJ';

        span1.appendChild(span2);
        span1.appendChild(span3);

        div.appendChild(span1);
        parentElement.appendChild(div);
        return div
    }
    // get 请求
    function getRequest(url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);

            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 400) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = function () {
                reject('发出请求时发生错误。');
            };

            xhr.send();
        });
    }

    // 订单物流记录
    function orderLogisticsRecord() {
        const elementList = document.querySelectorAll('.index-mod__order-container___1ur4-');
        elementList.forEach(element => {
            const firstChildElement = element.firstChild;
            // 订单编号
            const orderNumber = firstChildElement.getAttribute("data-id");
            // 物流记录请求链接
            const url = `https://buyertrade.taobao.com/trade/json/transit_step.do?bizOrderId=${orderNumber}`;
            const p1 = document.createElement('p');
            p1.style = 'margin-bottom:3px; color: red;';

            const p2 = document.createElement('p');
            p2.style = 'margin-bottom:3px; color: red;';
            const div = firstChildElement.getElementsByTagName('div')[11];
            getRequest(url)
                .then(function (response) {
                    const data = JSON.parse(response)
                    // 物流单号
                    if ('expressId' in data) {
                        const today = new Date();
                        const expressId = data.expressId;
                        const record = data.address[0].time.split(' ')[0];
                        const specifiedDate = new Date(record);
                        // 计算相差的天数
                        const timeDiff = today.getTime() - specifiedDate.getTime();
                        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1;
                        p1.textContent = expressId;
                        div.appendChild(p1);
                        const arr = ['签收', '送货上门', '菜鸟驿站'];
                        const address = data.address[0].place
                        const containsObject = arr.some(obj => address.includes(obj));
                        if (containsObject) {
                            p2.textContent = '已签收：' + diffDays + ' 天';
                        } else {
                            p2.textContent = '在途中：' + diffDays + ' 天';
                        }

                        div.appendChild(p2);
                    }
                })
                .catch(function (error) {
                    console.error('错误:', error);
                });
        });
    };

    // 运行
    const button1 = addNewButton('显示物流');
    button1.onclick = function () {
        orderLogisticsRecord();
    };
})();