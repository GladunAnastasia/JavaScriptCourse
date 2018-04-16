'use strict';

const LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('./input/dataSet.csv');

const data = [];
let length = 0;
let str = '';
let flag = false;


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
        str = !str ? str+ ' ' + line : line;
        let tempAr = str.split(';');
        if(tempAr.length == length) {
            data.push(tempAr);
            str = '';
        } else if(tempAr.length > length) {
            let arr = new Array(length);
            for(let i = 0; i < 6; i++) {
                arr[i] = tempAr[i];
            }
            let j = 6 + 1;
            for(let i = tempAr.length - (length - 6) + 1; i < tempAr.length; i++) {
                arr[j++] = tempAr[i];
            }
            let str = '';
            for(let i = 6; i < tempAr.length - (length - 6) + 1; i++) {
                str += ' ' + tempAr[i];
            }
            arr[6] = str;
            data.push(arr);
        }
        lr.resume();
    }, 1);
});

lr.on('end', function () {
    // All lines are read, file is closed now.
    console.log("Конец загрузки: " + new Date());
    main();
});

function main () {
    let cb = [];
    cb.push(theMostPopularWord);
    cb.push(theMostPopularTwit);
    start(data, cb);
}

function start (arr, cb) {
    for(let callback of cb) {
        callback(arr);
    }
}
function Word(value, count) {
    this.value = value;
    this.count = count;
}
function Twit(twitId, author, RTs) {
    this.twitId = twitId;
    this.author = author;
    this.RTs = Number(RTs);
}


function theMostPopularWord(arr) {
    let str = '';
    let temp = 0;
    for(let part of arr) {
        if(part[6]) {
            str += part[6].replace(/http[^\s\t\v\r\n\f]*/gi,' ').replace(/[.,\/!$%\^&\*;:{}=\-_`~()?"'№']/g,' ').replace(/[\s\t\v\r\n\f]+[\d]+[\s\t\v\r\n\f]+/g,' ').replace(/[\s]+[#]+[\s]+/g,' ').replace(/(RT)(\s)/g,' ');
        }
    }
    let array = str.split(' ');
    array.forEach(function(value){new Word(value, )});
    /*let resultArray = [];
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
        resultArray.push(new Word(element, сount));
        array[i] = undefined;
    }
    resultArray.sort((a, b) => b.count - a.count);*/
    console.log('10 наиболее часто встречающихся слов.');
    for(let i = 0; i < resultArray.length && i < 10; i++) {
        console.log(resultArray[i].value + " : " + resultArray[i].count);
    }
}

function theMostPopularTwit(arr) {
    let twitArray = [];
    for(let part of arr) {
        if(part[8]) {
            twitArray.push(new Twit(part[0],part[3], part[8]));
        }
    }
    twitArray.sort((a, b) => b.RTs - a.RTs);
    console.log('10 наиболее популярных твитов, их авторов и сколько раз они были ретвитнуты.');
    for(let i = 0; i < twitArray.length && i < 10; i++) {
        console.log(twitArray[i].twitId.trim() + ", " + twitArray[i].author.trim() + ", " + twitArray[i].RTs);
    }
}