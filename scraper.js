/**
 * @name scraper
 * @author JungHyunKwon
 * @since 2018-07-10
 */

'use strict';

const fs = require('fs'),
	  url = require('url'),
	  scrape = require('website-scraper'), // {@link https://github.com/website-scraper/node-website-scraper}
	  PhantomPlugin = require('website-scraper-phantom'), // {@link https://github.com/website-scraper/node-website-scraper-phantom}
	  filenamify = require('filenamify'), // {@link https://github.com/sindresorhus/filenamify}
	  baseDirectory = './dist',
	  userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0',
	  readline = require('readline'),
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
	var result = NaN;
	
	//숫자이면서 0초과이면서 10미만일 때
	if(isNumeric(value)) {
		//0초과이면서 10미만일 때
		if(value > 0 && 10 > value) {
			result = '0' + value;	
		}else{
			result = value;
		}
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
	let date = new Date(),
		year = date.getFullYear(),
		month = pad(date.getMonth() + 1),
		day = pad(date.getDate()),
		hours = date.getHours(),
		hour = pad(hours % 12 || 12),
		meridiem = (hours >= 12) ? '오후' : '오전',
		minute = pad(date.getMinutes()),
		second = pad(date.getSeconds()),
		name = 'unknown';
	
	//문자일 때
	if(typeof value ==='string') {
		name = filenamify(value, {
			replacement : ''
		}) || name;
	}
	
	return name + ' - ' + year + '년 ' + month + '월 ' + day + '일 ' + meridiem + ' ' + hour + '시 ' + minute + '분 ' + second + '초';
}

//질문
rl.question('주소 : ', address => {
	//값이 있을 때
	if(address) {
		rl.question('쿠키 : ', cookie => {
			rl.question('동적입니까? ', isDynamic => {
				let saveDirectory = baseDirectory + '/' + getName(url.parse(address).hostname),
					headers = {
						'User-Agent' : userAgent
					},
					settings = {
						urls : address,
						directory : saveDirectory,
						request : {
							headers : headers
						}
					};

				//값이 있을 때
				if(cookie) {
					headers.cookie = cookie;
				}

				//참일 때
				if(isDynamic === 'true') {
					settings.httpResponseHandler = PhantomPlugin;
				}

				scrape(settings, (err, result) => {
					//오류가 있거나 저장하지 못했을 때
					if(err || !result[0].saved) {
						console.error(saveDirectory + '에 저장하지 못했습니다.');
					}else{
						console.log(saveDirectory + '에 저장했습니다.');
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