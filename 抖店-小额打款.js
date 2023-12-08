// ==UserScript==
// @name         抖店-小额打款
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  none
// @author       沐淇
// @match        https://fxg.jinritemai.com/ffa/maftersale/aftersale/part-pay?type=begin
// @icon         https://lf1-fe.ecombdstatic.com/obj/eden-cn/upqphj/homepage/icon.svg
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    // DOM 监视器
    function monitor(element, callback) {
        const config = {attributes: true, childList: true, subtree: true};
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    callback(mutation, observer);
                }
            }
        });
        observer.observe(element, config);
        window.addEventListener('beforeunload', () => {
            observer.disconnect();
        });
    }

    // 修改打款记录元素样式
    function modifyElement(parent) {
        const record = parent.querySelector(`div.styles_tabTitle__2Rc11`);
        monitor(record, (mutation, observer) => {
            const target = mutation.target;
            if (target.matches('span.styles_prompt__1kJY-')) {
                modify(target);
            } else {
                const element = target.querySelector('span.styles_prompt__1kJY-');
                if (element) {
                    modify(element);
                }
            }
            observer.disconnect();
        });

        function modify(element) {
            element.style.paddingLeft = '10px';
            element.style.color = '#FF7F00';
            element.className = 'styles_title__1X-Qt';
        }
    }

    // 异步延时
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 搜索列表
    function searchlist(orderId) {
        const _url = `https://fxg.jinritemai.com/api/order/searchlist?order_id=${orderId}`;

        async function fetchData(url) {
            try {
                const response = await fetch(url);
                const data = await response.json();
                const dataList = data.data[0]
                return {
                    '售后编号': dataList.product_item.map(i => i.after_sale_info.after_sale_id).filter(id => id !== ''),
                    '卖家备注': dataList.remark
                }
            } catch (error) {
                return false;
            }
        }

        return fetchData(_url);
    }

    // 自动填充
    function autoFil(table) {
        // 运费补偿
        document.querySelector('div.auxo-space.auxo-space-vertical>div:nth-child(2)>label').click();
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
        if (table.length === 1) {
            const itemInput = document.querySelector('#product');
            itemInput.focus();
            itemInput.dispatchEvent(mousedownEvent);
            itemInput.dispatchEvent(mouseupEvent);
            document.querySelector('.rc-virtual-list-holder-inner > div').click();
        }
        // 聚焦打款金额框
        const payInput = document.querySelector('#amount');
        payInput.focus();
        payInput.dispatchEvent(mousedownEvent);
        payInput.dispatchEvent(mouseupEvent);
    }

    // 添加备注
    function addNewRemark(parent, text) {
        const reg = /(\d+\.\d+\sZHUAN|\bZHUAN\b)/g;
        const content = text.replace(reg, '<span style="color:#FF7F00;">$&</span>');
        const element = parent.querySelector('div.index_tableRow__2Okoz.mortise-rich-table-row');
        if (element.children.length === 2) {
            const div1 = document.createElement('div');
            div1.style.display = 'flex';
            const div2 = document.createElement('div');
            div2.className = 'index_cell__sscym';
            div2.style.textAlign = 'left';
            div2.innerHTML = content;
            div1.appendChild(div2);
            element.appendChild(div1);
        } else {
            const children = element.lastElementChild;
            children.querySelector('div.index_cell__sscym').innerHTML = content;
        }
    }

    // 主函数
    function main() {
        const parent = document.querySelector('#gar-sub-app-provider');
        const search = parent.querySelector('button.ant-btn.ant-btn-primary');
        search.addEventListener('click', function () {
            const input = parent.querySelector('#shop_order_no');
            const value = input.getAttribute('value');
            const regex = /[0-9]{19}/g;
            const match = regex.exec(value);
            if (match) {
                // 修改打款记录元素样式
                modifyElement(parent);
                let count = false;
                const items = parent.querySelector('div.index_RichTable__1cnKq.mortise-rich-table');
                monitor(items, (mutation, observer) => {
                    if (mutation.type === 'childList') {
                        const target = mutation.target;
                        const button = target.querySelector('a');
                        if (button && !count) {
                            const orderId = match[0];
                            searchlist(orderId)
                                .then(result => {
                                    if (result) {
                                        const remark = result.卖家备注;
                                        addNewRemark(parent, remark)
                                    }
                                });
                            // 项目表
                            const table = items.querySelectorAll('.index_cellRow__2KCzO');
                            button.addEventListener('click', async function () {
                                await delay(2000);
                                // 自动填充
                                autoFil(table);
                                // 确认按钮绑定到回车键
                                const button1 = document.querySelector('button.auxo-btn.auxo-btn-primary');
                                document.addEventListener('keydown', function (event) {
                                    if (event.key === 'Enter') {
                                        button1.click();
                                        const button2 = getButton2();
                                        if (button2) {
                                            button2.click();
                                        }
                                    }
                                });

                                function getButton2() {
                                    return document.querySelector('div.auxo-modal-confirm-btns > .auxo-btn.auxo-btn-primary');
                                }
                            });
                            // 找到第一个 a 标签则退出观察器
                            count = true;
                            observer.disconnect();
                        }
                    }
                });
            }
        });
    }


    // 重新载入 main 函数
    function reLoad() {
        const element = document.querySelector('#rc-tabs-0-tab-begin');
        monitor(element, (mutation) => {
            if (mutation.type === 'attributes') {
                const target = mutation.target;
                const value = target.getAttribute('aria-selected')
                if (value === 'false') {
                    const timerId = setTimeout(() => {
                        target.click();
                        main();
                        clearTimeout(timerId);
                    }, 1000);
                }
            }
        });
    }

    window.addEventListener('load', function () {
        main();
        reLoad();
    })
})();

