'use strict';

const LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('./input/dataSet.csv');

const data = [];
let length = 0;
let str = '';


lr.on('error', function (err) {
    
});
console.log("Начало загрузки: " + new Date());
lr.on('line', function (line) {
    // pause emitting of lines...
    lr.pause();
    if(length == 0) {
        length = line.split(';').length;
        lr.resume();
        return;
    }
    // ...do your asynchronous line processing..
    setTimeout(function () {
        // ...and continue emitting lines.

        //Чтобы колонки не съехали
        let tweetCol = 6;
        str = !str ? str+ ' ' + line : line;
        let tempAr = str.split(';');
        if(tempAr.length == length) {
            data.push(tempAr);
            str = '';
        } else if(tempAr.length > length) {
            let arr = new Array(length);
            for(let i = 0; i < tweetCol; i++) {
                arr[i] = tempAr[i];
            }
            let j = tweetCol + 1;
            for(let i = tempAr.length - (length - tweetCol) + 1; i < tempAr.length; i++) {
                arr[j++] = tempAr[i];
            }
            let str = '';
            for(let i = tweetCol; i < tempAr.length - (length - tweetCol) + 1; i++) {
                str += ' ' + tempAr[i];
            }
            arr[tweetCol] = str;
            data.push(arr);
        }
        lr.resume();
    }, 100);
});

lr.on('end', function () {
    // All lines are read, file is closed now.
    console.log("Конец загрузки: " + new Date());
    main();
});

function main () {
    let promises = [];
    promises.push(theMostPopularWord(data));
    promises.push(theMostPopularTweet(data));
    promises.push(theMostPopularAuthor(data));
    promises.push(countryInfo(data));
    Promises.all(promises).then((result) => print(result));
}

function theMostPopularWord(arr) {
    return new Promise((resolve, reject) => {
        let str = '';
        let temp = 0;
        for(let part of arr) {
            if(part[6]) {
                str += part[6].replace(/http[^\s\t\v\r\n\f]*/gi,' ').replace(/[.,\/!$%\^&\*;:{}=\-_`~()?"'№']/g,' ').replace(/[\s\t\v\r\n\f]+[\d]+[\s\t\v\r\n\f]+/g,' ').replace(/[\s]+[#]+[\s]+/g,' ').replace(/(RT)(\s)/g,' ');
            }
        }
        let array = str.split(' ');
        let resultArray = [];
        let element;    
        let сount;
        for(let i = 0; i < array.length; i++) {
            if(!array[i]) {
                continue;
            }
            let j = i + 1;
            сount = 0;
            let inx;
            while((inx = array.indexOf(array[i], j)) >= 0) {
                j = inx;
                array[j] = undefined;
                сount++;
            }
            element = array[i];
            resultArray.push({value:element,сountParam:сount});
            array[i] = undefined;
        }
        resultArray.sort((a, b) => b.сountParam - a.сountParam);
        resolve(resultArray);
    }
}

function theMostPopularTweet(arr) {
    return  new Promise((resolve, reject) => {
        let tweetArray = [];
        for(let part of arr) {
            if(part[8]) {
                tweetArray.push({tweetId:part[0],author:part[3],RTs:part[8]});
            }
        }
        tweetArray.sort((a, b) => b.RTs - a.RTs);
        resolve(tweetArray);
    }
}

function theMostPopularAuthor(arr) {
    return  new Promise((resolve, reject) => {
        let tweetArray = [];
        for(let part of arr) {
            tweetArray.push({author:part[4], RTs:part[8],followers:part[14], result: 2 * Number(!part[8]?0:part[8]) + Number(!part[14]?0:part[14])});
        }
        tweetArray.sort((a, b) => b.result - a.result);
        resolve(tweetArray);
    }
}

function countryInfo(arr) {
    return  new Promise((resolve, reject) => {
        let tweetArray = arr;
        let countryInfo = [];
        for(let i = 0; i < tweetArray.length; i++) {
        	if(tweetArray[i] && tweetArray[i][6].indexOf('RT ') != 0) {
        		let ob = {tweetId:tweetArray[i][0], nickName:tweetArray[i][4], ownCountry:tweetArray[i][11], arrayCountry : []};
    	        for(let j = i + 1; j < tweetArray.length; j++) {
    	        	if(tweetArray[j] && tweetArray[j][6].indexOf('RT @' + ob.nickName) == 0 && tweetArray[j][6].indexOf(tweetArray[i][6])>0) {
    	        		ob.arrayCountry.push({tweetId:tweetArray[j][0], ownCountry:tweetArray[j][11]});
    	        		tweetArray[j] = undefined;
    	        	}
    	    	}
    	    	tweetArray[i] = undefined;
    	    	countryInfo.push(ob);
    	    }
        }
        resolve(countryInfo);
    }
}
function print(group) {
    console.log();
    console.log('10 наиболее часто встречающихся слов.');
    for(let i = 0; i < group[0].length && i < 10; i++) {
        console.log(group[0][i].value + " : " + group[0][i].сountParam);
    }
    console.log();
    console.log('10 наиболее популярных твитов, их авторов и сколько раз они были ретвитнуты.');
    for(let i = 0; i < group[1].length && i < 10; i++) {
        console.log(group[1][i].tweetId.trim() + ", " + group[1][i].author.trim() + ", " + group[1][i].RTs);
    }
    console.log();
    console.log('10 самых популярных авторов.');
    for(let i = 0; i < group[2].length && i < 10; i++) {
        console.log(group[2][i].author +', '+ group[2][i].RTs + ', '+ group[2][i].followers);
    }
    console.log();
    console.log('Твиты и страны.');
    for(let i = 0; i < 100; i++) {
        if(group[3][i].ownCountry) {
            console.log('---' + group[3][i].tweetId.trim() +' был опубликован в '+ group[3][i].ownCountry.trim());
            for(let j = 0; j < group[3][i].arrayCountry.length; j++) {
                console.log('-----Ретвитнут с ID: ' + group[3][i].arrayCountry[j].tweetId.trim() + group[3][i].ownCountry ? ' из '+ group[3][i].ownCountry.trim():'');
            }
        }
    }
}