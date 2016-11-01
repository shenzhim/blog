/**
 * router of sub app home
 * @author: Bi Kai<kai.bi@yoho.cn>
 * @date: 2016/05/09
 */

'use strict';

const express = require('express');

const router = express.Router(); // eslint-disable-line
const auth = require('../../doraemon/middleware/auth');

const cRoot = './controllers';
const installment = require(cRoot + '/installment');

const personalController = require(`${cRoot}/qrcode`);
const userQrcode = require(`${cRoot}/myqrcode`);
const homeController = require(`${cRoot}/index`);
const addressController = require(`${cRoot}/address`);
const favorite = require(`${cRoot}/favorite`);
const orderController = require(`${cRoot}/order`);
const orderDetailController = require(`${cRoot}/orderDetail`);
const currencyController = require(`${cRoot}/myCurrency`);
const coupons = require(`${cRoot}/coupons`);
const help = require(`${cRoot}/help`);
const suggest = require(`${cRoot}/suggest`);
const message = require(`${cRoot}/message`);
const onlineService = require(`${cRoot}/onlineService`);

// recommend-for-you controller
const recommendForYou = require(`${cRoot}/recommend-for-you`);


// const myDetail = require(`${cRoot}/myDetail);


// 查看二维码
router.get('/QRcode/:id', personalController.QRcode);
router.get('/user/qrcode', userQrcode.index);

/* 个人中心地址管理相关路由 */
router.get('/address', auth, addressController.address); // 地址管理页面
router.get('/addressAct', auth, addressController.addressAct); // 地址添加页面
router.get('/addressAct/:id', auth, addressController.addressAct); // 地址添加修改页面
router.post('/saveAddress', addressController.saveAddress); // 新增或者保存地址
router.post('/defaultAddress', addressController.defaultAddress); // 设置默认地址
router.post('/delAddress', addressController.delAddress); // 删除地址
router.get('/locationList', auth, addressController.locationList); // 异步获取三级地址数据

/* 个人中心订单相关路由 */
router.get('/orders', auth, orderController.order); // 订单列表
router.get('/getOrders', auth, orderController.getOrders); // 获取订单列表数据
router.get('/orderDetail', auth, orderDetailController.orderDetailData); // 订单详情页
router.get('/orders/detail', auth, orderDetailController.orderDetailData); // 订单详情页兼容老的
router.get('/delOrder', auth, orderDetailController.delOrder); // 删除订单
router.get('/readd', auth, orderDetailController.readdData); // 再次购买
router.get('/cancelOrder', auth, orderDetailController.cancelOrder); // 取消订单

router.get('/', homeController.index); // 个人中心首页
router.get('/mydetails', auth, homeController.myDetails); // 个人基本资料页面

router.get('/grade', auth, homeController.grade); // 会员等级页
router.get('/privilege', homeController.preferential); // 会员特权列表页

router.get('/mycurrency', auth, currencyController.myCurrency); // yoho币总数
router.get('/currencyDetail', auth, currencyController.currencyDetail); // yoho币列表
router.post('/ajaxCurrencyDetail', auth, currencyController.ajaxCurrencyDetail); // yoho币列表

router.get('/record', auth, homeController.record); // 浏览记录
router.get('/recordContent', homeController.recordContent); // 浏览记录
router.get('/delRecord', homeController.delRecord); // 删除浏览记录

router.get('/favorite', auth, favorite.favorite); // 我的收藏
router.get('/favProduct', auth, favorite.favProduct); // 收藏的商品
router.get('/favBrand', auth, favorite.favfavBrand); // 收藏的品牌
router.post('/favoriteDel', auth, favorite.favoriteDelete); // 取消收藏

// 优惠券
router.use('/coupons', auth, coupons.index);

// 帮助中心
router.get('/help', help.index);
router.get('/helpDetail', help.helpDetail);

// 意见反馈
router.get('/suggest', suggest.suggestData);
router.post('/upAndDown', suggest.upAndDown);
router.get('/suggestSub', suggest.suggestSub);
router.post('/savesuggest', suggest.saveSuggest);

// 消息
router.use('/message', auth, message.index);
router.get('/messageDetail', auth, message.index);
router.post('/ajaxDelMes', auth, message.ajaxDelMes);
router.post('/pickCoupon', auth, message.pickCoupon);

// 在线客服
router.get('/onlineservice', onlineService.getOnlineServiceInfo);
router.get('/onlineservicedetail', onlineService.getOnlineServiceDetail);


// 分期付款
router.get('/installment/index', installment.index); // 开通分期首页
router.get('/installment/review', installment.review); // 开通分期首页
router.get('/installment/starting-service', installment.startingService); // 分期付款开通
router.get('/installment/starting-service/verify-code', installment.verifyCode);
router.get('/installment/starting-service/check-verify-code', installment.checkVerifyCode);
router.get('/installment/get-goods', installment.getInstallmentGoods); // ajax请求分期专享商品数据

router.get('/installment/repay/overdue', installment.overdueList); // 逾期未还款列表
router.get('/installment/repay/7daylist', installment.sevenDayList); // 7日待还款列表
router.get('/installment/repay/month', installment.monthRepayList); // 本月待还款列表
router.get('/installment/repay/total', installment.totalRepayList); // 待还总金额列表
router.get('/installment/repay/record', installment.repayRecordPage); // 还款记录
router.get('/installment/repay/get-record', installment.getRepayRecord); // ajax请求还款记录
router.get('/installment/repay/detail', installment.repayDetail); // 还款详情

router.get('/installment/account', installment.account); // 账户管理
router.get('/installment/bind-card', installment.bindCard); // 添加新银行卡
router.get('/installment/post-account', installment.postAccount); // 添加新卡请求
router.get('/installment/bank-info', installment.getBankInfo);
router.post('/installment/activate-service', installment.activateService);
router.get('/installment/order', installment.orderIndex);
router.get('/installment/order.html', installment.orderList);
router.get('/installment/order/:id', installment.orderDetail);
router.get('/installment/total-amount.json', installment.totalAmount);

router.get('/installment/help', installment.help); // 帮助静态页面
router.get('/installment/agreement', installment.agreement); // 服务协议静态页面

router.get('/installment/server-crash', installment.serverCrash); // 服务器崩溃
router.get('/installment/bank-card', installment.bankCard); // 银行卡列表

router.get('/recommend-for-you/userCenter', recommendForYou.userCenter); // 为你优选

module.exports = router;