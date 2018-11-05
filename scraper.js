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
	  baseDirectory = './dist/',
	  readline = require('readline'),
	  rl = readline.createInterface({
	      input : process.stdin,
		  output : process.stdout
	  });

/**
 * @name 10미만 0 붙이기
 * @return {number || string}
 * @since 2018-07-13
 */
Number.prototype.pad = function() {
	return (this > 10) ? this : '0' + this;	
};

/**
 * @name 유효한 파일명으로 거르기
 * @return {string}
 * @since 2018-07-13
 */
String.prototype.filterFileName = function() {
	return this.replace(/[\/:"*?"<>|]/g, '');
};

/**
 * @name 이름 얻기
 * @param {string} value
 * @return {string}
 * @since 2018-07-10
 */
function getName(value) {
	let date = new Date(),
		year = date.getFullYear(),
		month = (date.getMonth() + 1).pad(),
		day = date.getDate().pad(),
		hours = date.getHours(),
		hour = (hours % 12 || 12).pad(),
		meridiem = (hours >= 12) ? '오후' : '오전',
		minute = date.getMinutes().pad(),
		second = date.getSeconds().pad();

	return ((typeof value === 'string') ? value.filterFileName() : 'unknown') + ' - ' + year + '년 ' + month + '월 ' + day + '일 ' + meridiem + ' ' + hour + '시 ' + minute + '분 ' + second + '초';
}

/**
 * @name 형태 얻기
 * @since 2017-12-06
 * @param {*} value
 * @return {string || undefined}
 */
function getType(value) {
	var result;
	
	//매개변수가 있을 때
	if(arguments.length) {
		//null일때
		if(value === null) {
			result = 'null';
		
		//undefined일 때
		}else if(value === undefined) {
			result = 'undefined';
		}else{
			result = Object.prototype.toString.call(value).toLowerCase().replace('[object ', '').replace(']', '');
			
			//Invalid Date일 때
			if(result === 'date' && isNaN(new Date(value))) {
				result = 'Invalid Date';
			
			//숫자일 때
			}else if(result === 'number') {
				//NaN일 때
				if(isNaN(value)) {
					result = 'NaN';
				
				//Infinity일 때
				}else if(!isFinite(value)) {
					result = value.toString();
				}
			}
		}
	}

	return result;
}

/**
 * @name 스크랩
 * @param {obejct} options {url : string, cookie : string, isDynamic : boolean}
 * @param {function} callback
 * @since 2018-07-10
 */
function scraper(options, callback) {
	let saveDirectory = baseDirectory + getName(url.parse(options.url).host),
		hasBaseDirectory = false;

	try {
		//폴더일 때
		if(fs.statSync(baseDirectory).isDirectory()) {
			hasBaseDirectory = true;
		}

	//폴더가 없으면 오류발생
	}catch(e) {
		console.error(baseDirectory + '폴더가 없습니다.');
	}

	//baseDirectory 폴더가 없을 때 폴더생성
	if(!hasBaseDirectory) {
		fs.mkdirSync(baseDirectory);
		console.log(baseDirectory + '에 폴더를 생성 하였습니다.');
	}

	//객체가 아닐 때
	if(getType(options) !== 'object') {
		options = {};
	}
	
	scrape({
		urls : options.url,
		directory : saveDirectory,
		updateMissingSources : true,
		//recursive : true,
		//ignoreErrors : false,
		prettifyUrls : true,
		httpResponseHandler : (options.isDynamic) ? phantomHTML : '',
		request : {
			headers : {
				'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0',
				'Cookie' : options.cookie || ''
			}
		}
	}, (error, result) => {
		//오류가 있을 때
		if(error) {
			console.error(error);
		
		//함수일 때
		}else if(typeof callback === 'function') {
			callback(result[0].saved, saveDirectory);
		}
	});
}

//질문
rl.question('주소 : ', (url) => {
	//값이 있을 때
	if(url) {
		rl.question('쿠키 : ', (cookie) => {
			rl.question('동적입니까? ', (isDynamic) => {
				console.log('잠시만 기다려주세요.');

				scraper({
					url : url,
					cookie : cookie,
					isDynamic : isDynamic.toLowerCase() === 'true'
				}, (result, saveDirectory) => {
					//생성했을 때
					if(result) {
						console.log(saveDirectory + '에 생성하였습니다.');
					}else{
						console.error('스크랩에 실패하였습니다.');
					}

					rl.close();
				});
			});
		});
	}else{
		console.error('주소를 입력해주세요.');
		rl.close();
	}
});