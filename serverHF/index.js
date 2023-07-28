let express = require(`express`);
let app = express();
let axios = require('axios');
const port = process.env.PORT || 3001;
const mainServer = 'http://localhost:3000';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

app.listen(port, function () {
    console.log(`http://localhost:${port}`);
});

let cors = require('cors');
app.use(cors({
    origin: mainServer
}));

app.use(express.json());

app.get('/', function (req, res) {
    res.send("<h1>Привет! Этот сервер работает!</h1>");
});



//API этого сервера
app.post('/farmFire', function (req, res) {
    if (countWork < totalCountWork) {
        let session = req.body.session;
        let getCount = clamp(req.body.count, 1, totalCountWork - countWork);
        let token = req.body.token;

        onFarmFireStart(res, session, token, getCount);
        console.log('--запрос получен и передан в обработку');
    } else
        res.send('Я занят, позвоните попозже!');
});

app.post('/farmUsers', function (req, res) {
    let session = req.body.session;
    let getCount = clamp(req.body.count, 1, 20);
    let nickname = req.body.nickname;
    let name = req.body.name;
    let secondName = req.body.secondName;
    let phone = req.body.phone;

    farmUsers(res, session, getCount, nickname, name, secondName, phone);
    console.log('--запрос получен и передан в обработку');
});

app.post('/farmMessages', function (req, res) {
    let session = req.body.session;
    let getCount = clamp(req.body.count, 1, 20);
    let message = req.body.message;
    let sessionId = req.body.sessionId;

    farmMessages(res, session, sessionId, getCount, message);
    console.log('--запрос получен и передан в обработку');
});

app.post('/stopAll', function (req, res) {
    stopServer();
    res.send('Я остановил всю свою работу!');
});

app.post('/getWorkloadLevel', function (req, res) {
    let percentWorkload = Math.round(countWork / totalCountWork * 100);
    let message = ''
    switch (true) {
        case percentWorkload >= 75:
            message = 'bg-danger'
            break;
        case percentWorkload >= 50:
            message = 'bg-warning'
            break;
        case percentWorkload >= 25:
            message = 'bg-info'
            break;
        default:
            message = 'bg-success'
            break;
    }
    let reply = {
        countWork: countWork,
        totalCountWork: totalCountWork,
        percent: percentWorkload + '%',
        message: message
    }
    res.send(reply);
});






// Функции (система)
let countWork = 0;
const totalCountWork = 10;

async function onFarmFireStart(res, session, token, getCount) {
    countWork += getCount;

    console.log('Начинаю процесс запуска...');
    for (let i = 0; i < getCount; i++) {
        farmFire(session, token);
        console.log((i + 1) + ' процесс запущен!');
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('===Всё запущено!===');
    res.send('Я всё запустил!');
}

async function farmFire(session, tokenStart) {
    let statusError = null;
    let thisToken = tokenStart;
    while (countWork > 0) {
        await axios.post('https://events.webinar.ru/api/light/reactions/eventsessions/' + session + '/likes', null, {
            headers: { 'authorization': 'Bearer ' + thisToken }
        }).catch(err => {
            try { statusError = err.response.status; } catch { }
        });
        if (statusError == 401) {
            await axios.post(mainServer + '/getUpdatedToken', {
                token: thisToken
            }).then(response => {
                if (thisToken != response.data) {
                    thisToken = response.data;
                    console.log('--Я получил обновлённый токен!');
                    statusError = null;
                } else
                    console.log('--Я в очереди на получение обновлённого токена...');
            }).catch(error => {
                stopServer();
                console.log(error);
                console.log('мне не удалось обновить токен. Сервер остановлен!');
                console.log('================================');
            });
        }
        await new Promise(resolve => setTimeout(resolve, 5 * countWork));
    }
}

async function farmUsers(res, session, getCount, nickname, name, secondName, phone) {
    let isError = false;
    for (let i = 0; i < getCount; i++)
        await axios.post('https://events.webinar.ru/api/eventsessions/' + session + '/guestlogin', {
            nickname: nickname,
            name: name,
            secondName: secondName,
            phone: phone
        }).catch(() => {
            console.log('произошёл сбой создания гостей');
            console.log('================================');
            isError = true;
        });
    if (isError)
        res.send('Произошёл сбой! Мне не удалось создать гостей. Скорее всего ошибка на стороне Webinar.ru');
    else
        res.send('Я создал гостей! Теперь админы могут их увидеть.');
}

async function farmMessages(res, session, sessionId, getCount, message) {
    let isError = false;
    let headers = {
        Cookie: 'sessionId=' + sessionId
    }
    for (let i = 0; i < getCount; i++)
        await axios.post('https://events.webinar.ru/api/eventsessions/' + session + '/chat', {
            text: message
        }, { headers }).catch(error => {
            console.log('произошёл сбой отправки сообщений');
            console.log('================================');
            isError = true;
        });
    if (isError)
        res.send('Произошёл сбой! Мне не удалось отправить сообщения. Скорее всего ошибка на стороне Webinar.ru');
    else
        res.send('Я отправил сообщения! Теперь их видно в чате.');
}

function stopServer(res) {
    countWork = 0;
    console.clear();
}