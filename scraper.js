/**
 * @name scraper
 * @author JungHyunKwon
 * @since 2018-07-10
 */

'use strict';

const fs = require('fs'),
	  URL = require('url'),
	  scrape = require('website-scraper'), // {@link https://github.com/website-scraper/node-website-scraper}
	  phantomHTML = require('website-scraper-phantom'), // {@link https://github.com/website-scraper/node-website-scraper-phantom}
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

/**
 * @param {obejct} options {
       url : string,
	   cookie : string,
	   isDynamic : boolean
   }
 * @param {function} callback {string}
 */
function scraper(options, callback) {
	let callbackIsFunction = typeof callback === 'function',
		result = '';

	//객체일 때
	if(options) {
		let url = options.url,
			saveDirectory = baseDirectory + '/' + getName(URL.parse(url).hostname),
			cookie = options.cookie,
			settings = {
				urls : url,
				directory : saveDirectory,
				updateMissingSources : true,
				//recursive : true, //재귀
				//ignoreErrors : false, //오류 무시
				prettifyUrls : true,
				request : {
					headers : {
						'User-Agent' : userAgent
					}
				}
			};

			//문자일 때
			if(typeof cookie === 'string') {
				settings.request.headers.cookie = cookie;
			}
			
			//동적일 때
			if(options.isDynamic === true) {
				settings.httpResponseHandler = phantomHTML;
			}

			scrape(settings, (err, result) => {
				//오류가 없으면서 저장되었을 때
				if(!err && result[0].saved) {
					result = saveDirectory;
				}

				callback(result);
			});
	//함수일 때
	}else if(callbackIsFunction) {
		callback(result);
	}
}

//질문
rl.question('주소 : ', url => {
	//값이 있을 때
	if(url) {
		rl.question('쿠키 : ', cookie => {
			rl.question('동적입니까? ', isDynamic => {
				scraper({
					url : url,
					isDynamic : isDynamic.toLowerCase() === 'true',
					cookie : (cookie) ? cookie : null
				}, result => {
					//저장했을 때
					if(result) {
						console.log(result + '에 저장했습니다.');
					}else{
						console.error(result + '에 저장하지 못했습니다.');
					}
				});

				rl.close();
			});
		});
	}else{
		console.error('주소를 입력해주세요');

		rl.close();
	}
});