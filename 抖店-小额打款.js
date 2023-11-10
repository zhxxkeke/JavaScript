// ==UserScript==
// @name         抖店-小额打款
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  none
// @author       沐琪
// @match        https://fxg.jinritemai.com/ffa/maftersale/aftersale/part-pay?type=begin
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jinritemai.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 自动跳转
    function skip() {
        setInterval(() => {
            const element = document.getElementById('rc-tabs-0-tab-begin');
            const value = element.getAttribute('aria-selected');
            if (value === 'false') {
                element.click();
            }
        }, 1000);
    }

    // 小额打款
    function payment() {
        setInterval(() => {
            const parent = document.getElementById('__GARFISH_SSR_ECOM_FXG_ADMIN_DOM');
            // 打款记录
            const child = parent.querySelector('span.styles_prompt__1kJY-');
            if (child) {
                child.style.paddingLeft = '10px';
                child.style.color = '#FF8000';
                child.className = 'styles_title__1X-Qt';
            }
            // 商品信息
            const items = parent.getElementsByClassName('index_cellRow__2KCzO');
            // 发起打款
            const payButton = parent.getElementsByTagName('a')[0];
            if (items && payButton) {
                payButton.addEventListener('click', function () {
                    setTimeout(() => {
                        // 运费补偿
                        document.querySelector('#remit_option > div > div:nth-child(2) > label > span:nth-child(2)').click();
                        // 鼠标点击事件
                        const mousedownEvent = new MouseEvent('mousedown', {
                            bubbles: true,
                            cancelable: true
                        });
                        // 鼠标抬起事件
                        const mouseupEvent = new MouseEvent('mouseup', {
                            bubbles: true,
                            cancelable: true
                        });
                        // 关联商品
                        if (items.length === 1) {
                            const itemInput = document.querySelector('#product');
                            itemInput.focus();
                            itemInput.dispatchEvent(mousedownEvent);
                            itemInput.dispatchEvent(mouseupEvent);
                            // 选择商品
                            setTimeout(() => {
                                document.querySelector('.rc-virtual-list-holder-inner > div').click();
                            }, 400);
                        }
                        // 聚焦打款金额
                        setTimeout(() => {
                            const payInput = document.querySelector('#amount');
                            payInput.focus();
                            payInput.dispatchEvent(mousedownEvent);
                            payInput.dispatchEvent(mouseupEvent);
                        }, 400);
                        // 确认按钮
                        const button = document.querySelector('button.auxo-btn.auxo-btn-primary');
                        // 监听键盘按下事件
                        document.addEventListener('keydown', function(event) {
                            // 检查按下的键是否是空格键（键码为32）
                            if (event.keyCode === 32) {
                                // 阻止默认的空格键行为（比如滚动页面）
                                event.preventDefault();
                                button.click();
                                setTimeout(() => {
                                    document.querySelector('div.auxo-modal-confirm-btns > button.auxo-btn.auxo-btn-primary').click();
                                }, 500);
                            }
                        });
                    }, 2000);
                });
            }
        }, 100);
    }


    // 运行
    window.onload = function () {
        skip();
        payment();
    };
})();