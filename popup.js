function parsing(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://learn.dict.naver.com/m/endic/today/words.nhn", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            const body = xhr.responseText;

            const filter_word = /<em class="words">(.+)<\/em>/g
            let words = [];
            body.replace(filter_word, function (match, p1) {
                words.push(p1);
            });

            const filter_translate = /<p class="txt_ct2">\n(.+)\n/g
            body.replace(filter_translate, function (match, p1) {
                words.push(p1.trim());
            });

            if (words.length != 10) throw new Error("");

            callback(words);
        }
    }
    xhr.send();
}

function load() {
    chrome.storage.local.get('daily_words', function (result) {
        const words = result['daily_words'];
        let container = document.getElementById('container');

        let html = `last updated : ${last(words)}\n<table>`;
        for (let i = 0; i < 5; i++) {
            html += `<tr><th width=120>${words[i]}</th><th width=120>${words[i + 5]}</th></tr>`;
        }
        html += '</table>';

        container.innerHTML = html;
    })
}

function getDate() {
    let dt = new Date();
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

function last(a) {
    return a[a.length - 1];
}

chrome.storage.local.get('daily_words', function (result) {
    const today = getDate();
    const words = result['daily_words'];
    if (words == undefined || Object.keys(words).length === 0 || last(words) != today) {
        parsing(function (data) {
            data.push(today);
            chrome.storage.local.set({ 'daily_words': data }, function () {
                console.log('daily_words be updated.');
                load();
            });
        })
    } else {
        console.log('daily_words be cached.');
        load();
    }
});