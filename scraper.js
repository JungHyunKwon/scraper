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
	return (10 > this) ? '0' + this : this;	
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
 * @param {obejct} options {url : string, cookie : string, isDynamic : boolean}
 * @param {function} callback
 */
function scraper(options, callback) {
	//객체일 때
	if(options) {
		//문자일 때
		if(typeof options.url === 'string') {
			let hasBaseDirectory = false,
				saveDirectory = baseDirectory + getName(url.parse(options.url).host);

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
			
			scrape({
				urls : options.url,
				directory : saveDirectory,
				updateMissingSources : true,
				//recursive : true, //재귀
				//ignoreErrors : false, //오류 무시
				prettifyUrls : true,
				httpResponseHandler : (options.isDynamic === true) ? phantomHTML : '',
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
		}else{
			console.error('options.url : 문자가 아닙니다.');
		}
	}else{
		console.error('options : 객체가 아닙니다.');
	}
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