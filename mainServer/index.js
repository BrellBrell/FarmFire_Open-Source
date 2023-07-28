let express = require('express');
let app = express();
let axios = require('axios');
let port = process.env.PORT || 3000;

const timeSession = 3600000;
const timeResetServers = 1800000;

app.listen(port, async function () {
    try {
        await updateWorkloadServers();
        resetServersController();
        console.log(`http://localhost:${port}`);
    }
    catch {
        console.log('!!! MongoDB недоступна !!!');
    }
});

let mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/farmfire-app');

let cors = require('cors');
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

//////////////////////////////////////////////////
let versionSchema = new mongoose.Schema({
    app: Number,
    mainServer: Number,
    serverHF: Number
});

let Version = mongoose.model('Version', versionSchema);
//////////////////////////////////////////////////
//////////////////////////////////////////////////
let serverSchema = new mongoose.Schema({
    path: String,
    value: {
        unique: true,
        type: Number
    },
    workload: {
        type: mongoose.ObjectId,
        ref: 'WorkloadServer'
    }
});

let Server = mongoose.model('Server', serverSchema);
//////////////////////////////////////////////////
//////////////////////////////////////////////////
let workloadServerSchema = new mongoose.Schema({
    countWork: Number,
    totalCountWork: Number,
    percent: String,
    message: String
});

let WorkloadServer = mongoose.model('WorkloadServer', workloadServerSchema);
//////////////////////////////////////////////////
//////////////////////////////////////////////////
let sessionSchema = new mongoose.Schema({
    session: {
        unique: true,
        type: Number
    },
    sessionID: String,
    tokenRefresh: String,
    tokenAuthorization: String,
    oldTokenAuthorization: String,
    dataFire: {
        type: mongoose.ObjectId,
        ref: 'DataFire'
    },
    dataChat: {
        type: mongoose.ObjectId,
        ref: 'DataChat'
    },
    dataUser: {
        type: mongoose.ObjectId,
        ref: 'DataUser'
    }
});

let Session = mongoose.model('Session', sessionSchema);
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
let dataFireSchema = new mongoose.Schema({
    fireCount: Number
});

let DataFire = mongoose.model('DataFire', dataFireSchema);
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
let dataChatSchema = new mongoose.Schema({
    message: String,
    messageCount: Number
});

let DataChat = mongoose.model('DataChat', dataChatSchema);
/////////////////////////////////////////////////////////

//////////////////////////////////////////////////////
let dataUserSchema = new mongoose.Schema({
    nickname: String,
    name: String,
    secondName: String,
    phone: String,
    usersCount: Number
});

let DataUser = mongoose.model('DataUser', dataUserSchema);
/////////////////////////////////////////////////////////

const templateDataFire = {
    fireCount: 1
}

const templateDataChat = {
    message: '',
    messageCount: 1
}

const templateDataUser = {
    nickname: '',
    name: '',
    secondName: '',
    phone: '',
    usersCount: 1
}

const templateResponseHFError = 'Главный сервер: Мне не удалось пообщаться с удалённым сервером. Возможно, что он обесточен или ушёл в ошибку.';
const templateResponseError = 'Главный сервер: Ошибка входных параметров. В нашей базе данных нет серверов. Перезагрузите страницу.';
const templateResponseError2 = 'Главный сервер: Главный сервер: Мне нечем выполнять. В нашей базе данных нет серверов. Или вы просто не вставили ссылку на Вебинар. Ошибка входных параметров.';
const templateResponseUnknowError = 'Главный сервер: Неизвестный сбой выполнения';


app.get('/', function (req, res) {
    res.send("<h1>Привет! Этот сервер работает!</h1>");
});


// API этого сервера
app.get('/getVersions', async function (req, res) {
    let versions = await Version.findOne();
    if (versions)
        res.send(versions);
    else
        res.send(null);
})

app.get('/getServers', async function (req, res) {
    let serversList = await Server.find().sort({ value: 1 });
    let serversSend = [];
    for (let i = 0; i < serversList.length; i++) {
        let work = await WorkloadServer.findOne({ _id: serversList[i].workload });
        if (work) {
            serversSend.push({
                value: serversList[i].value,
                work: work
            });
        };
    }
    res.send(serversSend);
});

app.post('/updateServer', async function (req, res) {
    try {
        let index = req.body.index;
        let serversList = await Server.find().sort({ value: 1 });

        if (index != null && !isNaN(index) && index > -1 && index < serversList.length) {
            let server = serversList[index];
            let result = null;
            await axios.post(server.path + '/getWorkloadLevel').then(response => {
                result = {
                    value: server.value,
                    work: response.data
                }
            }).catch(() => {
                result = {
                    value: index + 1,
                    work: {
                        countWork: 0,
                        totalCountWork: 10,
                        percent: 0 + '%',
                        message: ''
                    }
                };
            });
            res.send(result);
            await updateWorkloadServers(true, server, result);
        } else
            res.send(null);
    }
    catch {
        sendError();
    }
});

app.post('/getFireData', async function (req, res) {
    try {
        let session = req.body.session;

        if (session && !isNaN(session)) {

            let findedSession = await Session.findOne({
                session: session
            }).populate('dataFire');

            if (findedSession)
                res.send(findedSession.dataFire);
            else
                res.send(null);
        }
        else
            res.send(null);
    }
    catch {
        sendError();
    }
});

app.post('/getChatData', async function (req, res) {
    try {
        let session = req.body.session;

        if (session && !isNaN(session)) {

            let findedSession = await Session.findOne({
                session: session
            }).populate('dataChat');

            if (findedSession)
                res.send(findedSession.dataChat);
            else
                res.send(null);
        }
        else
            res.send(null);
    }
    catch {
        sendError();
    }
});

app.post('/getUserData', async function (req, res) {
    try {
        let session = req.body.session;

        if (session && !isNaN(session)) {

            let findedSession = await Session.findOne({
                session: session
            }).populate('dataUser');

            if (findedSession)
                res.send(findedSession.dataUser);
            else
                res.send(null);
        }
        else
            res.send(null);
    }
    catch {
        sendError();
    }
});

app.post('/disableServer', async function (req, res) {
    try {
        let index = req.body.index;

        let serversList = await Server.find().sort({ value: 1 });
        if (index != null && !isNaN(index) && index > -1 && index < serversList.length) {
            await axios.post(serversList[index].path + '/stopAll').then(response => {
                res.send('Сервер ' + serversList[index].value + ': ' + response.data);
            }).catch(error => {
                res.send(templateResponseHFError);
            });
        }
        else
            res.send(templateResponseError);
    }
    catch {
        res.send(templateResponseUnknowError);
        sendError();
    }
});

app.post('/startFarmFireOnServer', async function (req, res) {
    try {
        let index = req.body.index;
        let count = req.body.count;
        let session = req.body.session;

        let token = null;
        let serversList = await Server.find().sort({ value: 1 });
        if (index != null && !isNaN(index) && count && !isNaN(count) && session && !isNaN(session) != 0 && index > -1 && index < serversList.length) {
            let getDatabaseSession = await Session.findOne({ session: session });
            if (getDatabaseSession) {
                token = getDatabaseSession.tokenAuthorization;
                let dataFire = await DataFire.findOne({ _id: getDatabaseSession.dataFire });
                if (dataFire) {
                    dataFire.fireCount = count;
                    await dataFire.save();
                }
            } else {
                let regResult = await registerBot(session);
                if (regResult && regResult.token) {
                    token = regResult.token;
                    await new Session({
                        session: session,
                        sessionID: regResult.sessionId,
                        tokenRefresh: regResult.refresh_token,
                        tokenAuthorization: regResult.token,
                        oldTokenAuthorization: regResult.token,
                        dataFire: await new DataFire({
                            fireCount: count
                        }).save(),
                        dataChat: await new DataChat(templateDataChat).save(),
                        dataUser: await new DataUser(templateDataUser).save()
                    }).save();
                    setInterval(function clear() { startDeleteController(this, session) }, timeSession);
                } else
                    res.send('Главный сервер: ' + regResult.message);
            }
            if (token) {
                await axios.post(serversList[index].path + '/farmFire', {
                    session: session,
                    count: count,
                    token: token
                }).then(response => {
                    res.send('Сервер ' + serversList[index].value + ': ' + response.data);
                }).catch(error => {
                    res.send(templateResponseHFError);
                });
            }
        } else
            res.send(templateResponseError);
    }
    catch {
        res.send(templateResponseUnknowError);
        sendError();
    }
});

app.post('/startSendMessagesOnServer', async function (req, res) {
    try {
        let message = req.body.message;
        let count = req.body.count;
        let session = req.body.session;

        let sessionID = null;
        let serversList = await Server.find();
        if (session && !isNaN(session) && count && !isNaN(count) && serversList.length != 0) {
            let getDatabaseSession = await Session.findOne({ session: session });
            if (getDatabaseSession) {
                let dataChat = await DataChat.findOne({ _id: getDatabaseSession.dataChat });
                if (dataChat) {
                    dataChat.message = message;
                    dataChat.messageCount = count;
                    sessionID = getDatabaseSession.sessionID;
                    await dataChat.save();
                }
            } else {
                let regResult = await registerBot(session);
                if (regResult && regResult.token) {
                    await new Session({
                        session: session,
                        sessionID: regResult.sessionId,
                        tokenRefresh: regResult.refresh_token,
                        tokenAuthorization: regResult.token,
                        oldTokenAuthorization: regResult.token,
                        dataFire: await new DataFire(templateDataFire).save(),
                        dataChat: await new DataChat({
                            message: message,
                            messageCount: count
                        }).save(),
                        dataUser: await new DataUser(templateDataUser).save()
                    }).save();
                    sessionID = regResult.sessionId;
                    setInterval(function clear() { startDeleteController(this, session) }, timeSession);
                } else
                    res.send('Главный сервер: ' + regResult.message);
            }

            if (sessionID) {
                let index = getRandomInt(0, serversList.length);
                await axios.post(serversList[index].path + '/farmMessages', {
                    session: session,
                    count: count,
                    sessionId: sessionID,
                    message: message
                }).then(response => {
                    res.send('Сервер ' + serversList[index].value + ': ' + response.data);
                }).catch(error => {
                    res.send(templateResponseHFError);
                });
            }
        } else
            res.send(templateResponseError2);
    }
    catch {
        res.send(templateResponseUnknowError);
        sendError();
    }
});

app.post('/startRegisterUsersOnServer', async function (req, res) {
    try {
        let session = req.body.session;
        let count = req.body.count;
        let nickname = req.body.nickname;
        let name = req.body.name;
        let secondName = req.body.secondName;
        let phone = req.body.phone;

        let serversList = await Server.find();
        if (session && !isNaN(session) && count && !isNaN(count) && nickname != null && serversList.length != 0) {
            let index = getRandomInt(0, serversList.length);
            let getDatabaseSession = await Session.findOne({ session: session });
            if (getDatabaseSession) {
                let dataUser = await DataUser.findOne({ _id: getDatabaseSession.dataUser });
                if (dataUser) {
                    dataUser.nickname = nickname;
                    dataUser.name = name;
                    dataUser.secondName = secondName;
                    dataUser.phone = phone;
                    dataUser.usersCount = count;
                    await dataUser.save();
                }
            } else {
                let regResult = await registerBot(session);
                if (regResult && regResult.token) {
                    await new Session({
                        session: session,
                        sessionID: regResult.sessionId,
                        tokenRefresh: regResult.refresh_token,
                        tokenAuthorization: regResult.token,
                        oldTokenAuthorization: regResult.token,
                        dataFire: await new DataFire(templateDataFire).save(),
                        dataChat: await new DataChat(templateDataChat).save(),
                        dataUser: await new DataUser({
                            nickname: nickname,
                            name: name,
                            secondName: secondName,
                            phone: phone,
                            usersCount: count
                        }).save()
                    }).save();
                    setInterval(function clear() { startDeleteController(this, session) }, timeSession);
                } else {
                    res.send('Главный сервер: ' + regResult.message);
                    return;
                }
            }

            await axios.post(serversList[index].path + '/farmUsers', {
                session: session,
                count: count,
                nickname: nickname,
                name: name,
                secondName: secondName,
                phone: phone
            }).then(response => {
                res.send('Сервер ' + serversList[index].value + ': ' + response.data);
            }).catch(error => {
                res.send(templateResponseHFError);
            })
        } else
            res.send(templateResponseError2);
    }
    catch {
        res.send(templateResponseUnknowError);
        sendError();
    }
});

function sendError() {
    console.log('!! Сбой на сервере !! Качество входных параметров');
};

let isUpdatingNow = false;
app.post('/getUpdatedToken', function (req, res) {
    let oldToken = req.body.token;
    if (isUpdatingNow)
        res.send(oldToken)
    else {
        isUpdatingNow = true;
        updateToken(res, oldToken);
    }
});

async function updateToken(res, oldToken) {
    let result = oldToken;
    let actualTokenDatabase = await Session.findOne({ tokenAuthorization: oldToken });
    if (actualTokenDatabase) {
        await axios.post('https://events.webinar.ru/api/token/refresh', {
            refresh_token: actualTokenDatabase.tokenRefresh
        }).then(response => {
            actualTokenDatabase.tokenAuthorization = response.data.token;
            actualTokenDatabase.tokenRefresh = response.data.refresh_token;
            actualTokenDatabase.oldTokenAuthorization = oldToken;
        }).catch(err => { });
        await actualTokenDatabase.save();
        result = actualTokenDatabase.tokenAuthorization;
    } else {
        let oldSessionDatabase = await Session.findOne({ oldTokenAuthorization: oldToken });
        if (oldSessionDatabase)
            result = oldSessionDatabase.tokenAuthorization;
    }
    isUpdatingNow = false;
    res.send(result);
}

async function registerBot(session) {
    let reply = null;
    await axios.post('https://events.webinar.ru/api/eventsessions/' + session + '/guestlogin', {
        nickname: "FarmFire",
        name: "Фармер",
        secondName: "Огоньков",
        phone: "+79999999999"
    }).then(response => {
        let xAuthorizationObj = JSON.parse(response.headers['x-authorization']);
        reply = {
            token: xAuthorizationObj.token,
            refresh_token: xAuthorizationObj.refresh_token,
            sessionId: response.data.user.sessionId,
            message: 'Я зарегистрировал гостя!'
        }
    }).catch(error => {
        console.log('произошёл сбой получения токена');
        console.log('================================');
        reply = {
            token: null,
            refresh_token: null,
            message: 'Произошёл сбой! Мне не удалось добавить бота. Проверьте ссылку на Вебинар. Скорее всего ошибка на стороне Webinar.ru'
        }
    });
    return reply;
}

async function updateWorkloadServers(one, server, work) {
    if (!one) {
        await WorkloadServer.deleteMany();
        let serversList = await Server.find();
        for (let i = 0; i < serversList.length; i++) {
            let work = {};
            await axios.post(serversList[i].path + '/getWorkloadLevel').then(response => {
                if (response.data)
                    work = response.data
            }).catch(error => {
                console.log('не удалось получить нагрузку');
            });

            let modified = new Server({
                path: serversList[i].path,
                value: serversList[i].value,
                workload: await new WorkloadServer(work).save()
            });
            await Server.deleteOne({ value: serversList[i].value });
            await modified.save();
        }
    } else {
        if (server) {
            let workload = await WorkloadServer.findOne({ _id: server.workload });
            if (work && workload) {
                workload.countWork = work.work.countWork;
                workload.totalCountWork = work.work.totalCountWork;
                workload.percent = work.work.percent;
                workload.message = work.work.message;
                await workload.save();
            }
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min)
}

async function startDeleteController(interval, session) {
    clearInterval(interval);
    let findedSession = await Session.findOne({ session: session });
    if (findedSession) {
        await DataFire.deleteOne({ _id: findedSession.dataFire });
        await DataChat.deleteOne({ _id: findedSession.dataChat });
        await DataUser.deleteOne({ _id: findedSession.dataUser });
    }
    await Session.deleteOne({ session: session });
}

function resetServersController() {
    setInterval(async () => {
        let serversList = await Server.find();
        if (serversList.length != 0)
            for (let i = 0; i < serversList.length; i++)
                await axios.post(serversList[i].path + '/stopAll').catch(err => { });
        await updateWorkloadServers();
        console.clear();
    }, timeResetServers);
}