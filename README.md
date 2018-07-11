# scraper v1.0.0
NodeJS로 만들었으며 웹페이지를 스크랩하는 도구입니다.

## website-scrape
<https://github.com/website-scraper/node-website-scraper>
<https://github.com/website-scraper/node-website-scraper-phantom>

## CLI
````javascript
node scraper.js
````

### 옵션

이름 | 형태 | 설명
| :-- | :-- | :-- |
url | string | 주소
cookie | string | 쿠키
isDynamic | boolean | 동적여부

## 사용법
1. scraper.js를 열어 맨 아래 구문을 복사하여 붙여넣는다.
2. url과, cookie와 isDynamic 옵션을 작성한다.
3. 노드로 scraper.js를 실행한다.

````javascript
	scraper({
		url : string,
		cookie : string,
		isDynamic : boolean
	}, (result, savePath) => {
		if(result) {
			console.log(savePath + '에 생성하였습니다.');
		}else{
			console.error('스크랩에 실패하였습니다.');
		}
	});
````