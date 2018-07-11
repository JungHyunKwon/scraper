/**
 * @name scraper
 * @author JungHyunKwon
 * @since 2018-07-10
 */

'use strict';

const fs = require('fs'),
	  url = require('url'),
	  scrape = require('website-scraper'), // {@link https://github.com/website-scraper/node-website-scraper}
	  phantomHTML = require('website-scraper-phantom'), // {@link https://github.com/website-scraper/node-website-scraper-phantom}
	  baseDirectory = './dist/';

/**
 * @name 10미만 0붙이기
 * @param {number} value
 * @return {*}
 * @since 2018-07-10
 */
function pad(value) {
	return (value < 10) ? '0' + value : value;
}

/**
 * @name 네임스페이스 얻기
 * @param {string} value
 * @return {string}
 * @since 2018-07-10
 */
function getNamespace(value) {
	let date = new Date(),
		year = date.getFullYear(),
		month = pad(date.getMonth() + 1),
		day = pad(date.getDate()),
		hours = date.getHours(),
		hour = pad(hours % 12 || 12),
		meridiem = (hours >= 12) ? '오후' : '오전',
		minute = pad(date.getMinutes()),
		second = pad(date.getSeconds());

	return value + ' - ' + year + '년 ' + month + '월 ' + day + '일 ' + meridiem + ' ' + hour + '시 ' + minute + '분 ' + second + '초';
}

/**
 * @name 네임스페이스 얻기
 * @param {obejct {url : string, cookie : string, isDynamic : boolean}} option
 * @param {function} callback
 * @since 2018-07-10
 */
function scraper(option, callback) {
	let savePath = baseDirectory + getNamespace(url.parse(option.url).host || 'unknown'),
		isDist = false;

	try {
		//폴더일때
		if(fs.statSync(baseDirectory).isDirectory()) {
			isDist = true;
		}

	//폴더가 없으면 오류발생
	}catch(e) {
		console.error(baseDirectory + '폴더가 없습니다.');
	}

	//dist 폴더가 없을때 폴더생성
	if(!isDist) {
		fs.mkdirSync(baseDirectory);
		console.log(baseDirectory + '에 폴더를 생성 하였습니다.');
	}

	//객체가 아닐때
	if(!option instanceof Object) {
		option = {};
	}
	
	scrape({
		urls : [option.url],
		directory : savePath,
		updateMissingSources : true,
		//recursive : true,
		//ignoreErrors : false,
		prettifyUrls : true,
		httpResponseHandler : (option.isDynamic) ? phantomHTML : '',
		request : {
			headers : {
				'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0',
				'Cookie' : option.cookie || ''
			}
		}
	}, (error, result) => {
		//오류가 있을때
		if(error) {
			console.error(error);
		
		//함수일때
		}else if(typeof callback === 'function') {
			callback(result[0].saved, savePath);
		}
	});
}

/*scraper({
	url : string,
	cookie : string,
	isDynamic : boolean
}, (result, savePath) => {
	if(result) {
		console.log(savePath + '에 생성하였습니다.');
	}else{
		console.error('스크랩에 실패하였습니다.');
	}
});*/