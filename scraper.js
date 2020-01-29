/**
 * @name scraper
 * @author JungHyunKwon
 * @since 2018-07-10
 */

'use strict';

const fs = require('fs'),
	  {parse} = url,
	  scrape = require('website-scraper'), // {@link https://github.com/website-scraper/node-website-scraper}
	  PhantomPlugin = require('website-scraper-phantom'), // {@link https://github.com/website-scraper/node-website-scraper-phantom}
	  filenamify = require('filenamify'), // {@link https://github.com/sindresorhus/filenamify}
	  readline = require('readline'),
  	  baseDir = './dist',
	  uA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0',
	  rl = readline.createInterface({
	      input : process.stdin,
		  output : process.stdout
	  });

/**
 * @name 숫자 확인
 * @since 2017-12-06
 * @param {*} value
 * @return {boolean}
 */
function isNumeric(value) {
	return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * @name 10미만 0 붙이기
 * @param {number} value
 * @return {number || string}
 * @since 2018-07-13
 */
function pad(value) {
	let result = NaN;
	
	//숫자일 때
	if(isNumeric(value)) {
		//0 보다 크면서 10 보다 작을 때
		result = (value > 0 && 10 > value) ? result = '0' + value : value;
	}

	return result;
}

/**
 * @name 이름 얻기
 * @param {string} value
 * @return {string}
 * @since 2018-07-10
 */
function getName(value) {
	let result = '';
	
	//문자일 때
	if(typeof value ==='string') {
		let date = new Date(),
			hours = date.getHours();

		result = filenamify(value, {
			replacement : ''
		}) + ' - ' + date.getFullYear() + '년 ' + pad(date.getMonth() + 1) + '월 ' + pad(date.getDate()) + '일 ' + ((hours >= 12) ? '오후' : '오전') + ' ' + pad(hours % 12 || 12) + '시 ' + pad(date.getMinutes()) + '분 ' + pad(date.getSeconds()) + '초';
	}

	return result;
}

//질문
rl.question('주소 : ', url => {
	//값이 있을 때
	if(url) {
		rl.question('쿠키 : ', cookie => {
			rl.question('동적입니까? ', dynamic => {
				let saveDir = baseDir + '/' + getName(parse(url).hostname),
					headers = {
						'User-Agent' : uA
					},
					settings = {
						urls : url,
						directory : saveDir,
						request : {
							headers : headers
						}
					};

				//값이 있을 때
				if(cookie) {
					headers.cookie = cookie;
				}

				//참일 때
				if(dynamic === 'true') {
					settings.httpResponseHandler = PhantomPlugin;
				}

				scrape(settings, (err, result) => {
					//오류가 있거나 저장하지 못했을 때
					if(err || !result[0].saved) {
						console.error(saveDir + '에 저장하지 못했습니다.');
					}else{
						console.log(saveDir + '에 저장하였습니다.');
					}

					rl.close();
				});
			});
		});
	}else{
		console.error('주소를 입력해주세요');

		rl.close();
	}
});