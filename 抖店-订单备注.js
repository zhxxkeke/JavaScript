// ==UserScript==
// @name         抖店-订单备注
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  none
// @author       沐琪
// @match        https://fxg.jinritemai.com/ffa/morder/order/list*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jinritemai.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 当前日期
    function getNowFormatDate() {
        const today = new Date();
        const month = String(today.getMonth() + 1);
        const day = String(today.getDate());
        return ` ${month}.${day} ZHUAN `
    }

    // 编辑文本框
    function editTextByReact() {
        setInterval(function () {
            const element = document.querySelector('#seller_words');
            if (element) {
                const inputValue = element.value + getNowFormatDate();
                const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
                const prototype = Object.getPrototypeOf(element);
                const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                element.onclick = function () {
                    if (element.value.indexOf('ZHUAN') === -1 && element.value.indexOf('转') === -1) {
                        if (valueSetter && valueSetter !== prototypeValueSetter) {
                            prototypeValueSetter.call(element, inputValue)
                        } else {
                            valueSetter.call(element, inputValue)
                        }
                        setTimeout(function () {
                            // 保存
                            document.querySelector('[data-btm="d440734"] > span').click()
                        }, 500)
                    }
                }
                element.dispatchEvent(new Event('input', {bubbles: true}))
            }
        }, 100)
    }

    // 运行
    window.onload = function () {
        editTextByReact()
    }
})();