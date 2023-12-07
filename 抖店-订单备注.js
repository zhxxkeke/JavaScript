// ==UserScript==
// @name         抖店-订单备注
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  none
// @author       沐琪
// @match        https://fxg.jinritemai.com/ffa/morder/order/list*
// @icon         https://lf1-fe.ecombdstatic.com/obj/eden-cn/upqphj/homepage/icon.svg
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 当前日期
    function _today() {
        const today = new Date();
        const month = String(today.getMonth() + 1);
        const day = String(today.getDate());
        return ` ${month}.${day} ZHUAN `
    }

    // 异步延时
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    function main() {
        const page = document.querySelector('#__GARFISH_SSR_ECOM_FXG_ADMIN_DOM');
        const search = page.querySelector('button[type="submit"]');
        search.addEventListener('click', function () {
            let timerId;
            timerId = setInterval(() => {
                const input = document.querySelector('#seller_words');
                if (input) {
                    const inputValue = input.value + _today();
                    const valueSetter = Object.getOwnPropertyDescriptor(input, 'value').set;
                    const prototype = Object.getPrototypeOf(input);
                    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                    input.onclick = async function () {
                        if (input.value.indexOf('ZHUAN') === -1 && input.value.indexOf('转') === -1) {
                            if (valueSetter && valueSetter !== prototypeValueSetter) {
                                prototypeValueSetter.call(input, inputValue)
                            } else {
                                valueSetter.call(input, inputValue)
                            }
                            await delay(200);
                            document.querySelector('[data-btm="d440734"] > span').click()
                        }
                        clearInterval(timerId)
                    }
                    input.dispatchEvent(new Event('input', {bubbles: true}))
                }
            }, 100);
        });
    }


    window.addEventListener('load', function () {
        main();
    })
})();
