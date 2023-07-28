<script>
import axios from 'axios';
import dayjs from 'dayjs';

export default {
    data() {
        return {
            selectedServer: 0,
            flows: 1,
            servers: [],
            activites: [],
            history: [],
            isError: false,
            isLoading: false,
            isNotFoudServers: false,
            interval: 0
        }
    },
    props: ['session', 'mainServer', 'warning'],
    methods: {
        goBack() {
            this.$router.push({
                name: 'home'
            });
        },
        hideDialog() {
            this.$emit('warning-close');
        },
        async updateServer(index) {
            if (index != null && !isNaN(index) && index > -1)
                await axios.post(this.mainServer + '/updateServer', {
                    index: index
                }).then(response => {
                    if (response.data) {
                        this.servers[index] = response.data;
                        this.activites[index] = response.data.work.countWork > 0;
                    }
                }).catch(err => { });
        },
        async getServers() {
            await axios.get(this.mainServer + '/getServers', {
            }).then(response => {
                if (response.data.length < this.servers.length) {
                    this.servers = [];
                    this.activites = [];
                }
                this.servers = response.data;
                for (let i = 0; i < response.data.length; i++)
                    this.activites[i] = response.data[i].work.countWork > 0;
                this.isNotFoudServers = response.data.length == 0;
            }).catch(err => { this.errMainServer() });
        },
        async getData() {
            if (this.session && !isNaN(this.session))
                await axios.post(this.mainServer + '/getFireData', {
                    session: this.session
                }).then(response => {
                    if (response.data)
                        this.flows = response.data.fireCount;
                }).catch(err => { });
        },
        async disableServer(index) {
            if (this.activites[index]) {
                await axios.post(this.mainServer + '/disableServer', {
                    index: index
                }).then(response => {
                    let data = dayjs();
                    this.history.unshift({ message: response.data, time: data.format('HH:mm') });
                }).catch(err => { this.errMainServer() });
                await this.updateServer(index);
            }
        },
        async send(evt) {
            evt.preventDefault();
            if (this.session && !isNaN(this.session) && this.selectedServer != null && !isNaN(this.selectedServer) && this.flows && !isNaN(this.flows)) {
                this.isLoading = true;
                let indexServer = this.selectedServer; // нужно для фиксации значения, если пользователь вдруг переключит сервер после нажатия на ЗАПУСТИТЬ
                await axios.post(this.mainServer + '/startFarmFireOnServer', {
                    index: indexServer,
                    session: this.session,
                    count: this.flows
                }).then(response => {
                    let data = dayjs();
                    this.history.unshift({ message: response.data, time: data.format('HH:mm') });
                }).catch(err => { this.errMainServer() });
                this.isError = this.isLoading = false;
                this.activites[indexServer] = true;
                await this.updateServer(indexServer);
            } else
                this.isError = true;
        },
        errMainServer() {
            this.history.push({ message: 'Сайт: Мне не удалось связаться с главным сервером. Я теперь бесполезен? А-а-а-а-а! Возможно, что он обесточен или ушёл в ошибку. Я теперь без него ничего не могу делать. Попробуй ещё раз.' });
        },
        flowRules() {
            alert("Количество потоков означает сколько визуально человек сейчас жмут на огонёк. Сервера выполняют потоки. На 1 сервер можно нагрузить максимум 10 потоков. Как правило 1 поток ≈ 50 огоньков. Соответственно, если серверов n, то суммарно можно нагрузить 10 * n потоков, а это (10 * n) * 50 огоньков.");
        },
        rules() {
            alert("Всю ответственность вы берёте на себя. Инструмент был создан только для развлечения. За дальнейшие действия мы ответственности не несём!");
        }
    },
    mounted() {
        this.getServers();
        this.getData();
        this.interval = setInterval(() => {
            this.getServers();
        }, 30000);
    },
    unmounted() {
        clearInterval(this.interval);
    }
}
</script>

<template>
    <div class="popup" v-if="warning">
        <div class="contents">
            <p>
                Иногда Webinar.ru банит наши сервера и мы не можем делать огоньки на трансляции,
                нужно просто отдохнуть и попробовать позже, либо выбрать другой наш сервер. Пока что доступно 10 серверов.
                Но мы можем добавить больше.
            </p>
            <p>
                Всю ответственность вы берёте на себя. Инструмент был создан только для развлечения. За дальнейшие
                действия мы ответственности не несём!
            </p>
            <button @click="hideDialog()" class="btn btn-primary">Окей 👌</button>
        </div>
    </div>
    <div class="container longerComponent">
        <div class="row">
            <div oncopy="return false;" onmousedown="return false;" oncontextmenu="return false;" class="col">
                <p @click="goBack" class="textBack">Главная</p>
            </div>
        </div>
        <div class="row row-cols-1 row-cols-md-5 justify-content-center align-items-start">
            <div class="col colAdaptServers">
                <hr>
                <h4>Список серверов:</h4>
                <div class="alert alert-primary" role="alert" v-if="isNotFoudServers">
                    В БД нет серверов.
                </div>
                <div v-if="servers.length == 0 && !isNotFoudServers" class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                </div>
                <ul oncopy="return false;" onmousedown="return false;" oncontextmenu="return false;" class="serverList">
                    <li v-for="(item, index) in servers" :class="{ 'serverCardSelected': selectedServer == index }"
                        class="serverCard">
                        <label class="serverInputLabel">
                            <input v-model="selectedServer" class="server-input" type="radio" :value="index">
                            <div class="d-flex align-items-center justify-content-center">
                                <div><img class="imageServer" src="../assets/server.png" alt="server"></div>
                                <div class="fontSet">
                                    <p>Сервер {{ item.value }}</p>
                                    <div class="progress" role="progressbar">
                                        <div :class="item.work.message" class="progress-bar"
                                            :style="{ 'width': item.work.percent }">{{ item.work.percent }}</div>
                                    </div>
                                </div>
                                <div>
                                    <div class="form-check form-switch onLine">
                                        <input @click="disableServer(index)" class="form-check-input" type="checkbox"
                                            role="switch" v-model="activites[index]">
                                        <label class="form-check-label">Вкл.</label>
                                    </div>
                                </div>
                            </div>
                        </label>
                    </li>
                </ul>
            </div>
            <div class="col colAdaptForm">
                <hr>
                <h4>Операции:</h4>
                <div class="formInput">
                    <div class="Instruction">
                        <h5 class="InstrZ">Мини-инструкция:</h5>
                        <p class="instr">1. Выбираешь сервер.</p>
                        <p class="instr">2. Устанавливаешь количество потоков.</p>
                        <p class="instr">3. Нажимаешь ЗАПУСТИТЬ</p>
                    </div>
                    <div>
                        <form @submit="send">
                            <div>
                                <label for="range" class="form-label">Добавить количество <span class="rules" @click="flowRules">потоков</span>: {{ flows }}</label>
                                <input type="range" class="form-range" min="1" max="10" id="range" v-model="flows">
                            </div>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="agree" required>
                                    <label class="form-check-label" for="agree">
                                        Я согласен с вашими <span class="rules" @click="rules">условиями</span>.
                                    </label>
                                    <div class="invalid-feedback">
                                        Соглашайся
                                    </div>
                                </div>
                            </div>
                            <div class="alert alert-primary" role="alert" v-if="isError">
                                Вставьте ссылку на Вебинар.
                            </div>
                            <div class="d-grid gap-2 col-6 mx-auto">
                                <button class="btn btn-primary" type="submit" :disabled="isLoading">
                                    <span class="spinner-border spinner-border-sm" role="status" v-if="isLoading"></span>
                                    ЗАПУСТИТЬ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col colAdaptServers">
                <hr>
                <h4>История серверов:</h4>
                <ul class="listScroll">
                    <li class="history" v-for="(item, index) in history">
                        <div>
                            <p>
                                {{ item.message }}
                            </p>
                        </div>
                        <div class="time d-flex align-items-center justify-content-end">
                            <span>{{ item.time }}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style>
.rules {
    color: rgb(0, 102, 218);
    border-radius: 3px;
    font-weight: 700;
    padding: 2px;
}

.rules:hover {
    background-color: rgba(0, 102, 218, 0.466);
    cursor: pointer;
}

.lightTheme,
.darkTheme {
    position: relative;
}

.popup {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
}

.contents {
    background-color: white;
    margin-top: 25vh;
    width: 300px;
    padding: 20px;
    border-radius: 10px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.time {
    color: #616161;
    font-weight: 300;
}

.container {
    --bs-gutter-x: 0;
}

.history {
    padding: 10px;
    border-radius: 20px;
    list-style-type: none;
    margin: 10px;
    background-color: #7fdbcf;
    color: black;
    font-weight: 700;
}

.listScroll::-webkit-scrollbar {
    width: 0;
}

.listScroll {
    height: 50vh;
    padding: 0;
    overflow-y: scroll;
    margin-top: 20px;
    background-color: #cfcfcf71;
    border-radius: 20px;
    display: flex;
    flex-direction: column-reverse;
}

.onLine {
    display: inline-block
}

.InstrZ {
    font-size: 18px;
    font-weight: 700;
    padding: 10px 0 0 10px;
    color: #7d8000;
}

.Instruction {
    background-color: #fdff70;
    border-radius: 20px;
}

.serverList::-webkit-scrollbar {
    width: 0;
}

.serverList {
    height: 50vh;
    overflow: auto;
    padding: 0;
    margin-top: 20px;
}

.instr {
    text-indent: 10%;
    font-weight: 300;
    color: #7d8000;
    padding: 0 10px 0 10px;
}

.serverInputLabel {
    cursor: pointer;
    width: 100%;
}

.formInput {
    margin-top: 20px;
    min-height: 50vh;
    gap: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.server-input {
    display: none;
}

.serverCard {
    transition: all 200ms;
    outline: #858585 solid 5px;
    outline-offset: -5px;
    padding: 10px;
    list-style-type: none;
    margin: 20px 10px 20px 10px;
    background: linear-gradient(to bottom right, #9c9c9c, #686868);
    border-radius: 30px;
}

.serverCardSelected {
    outline-offset: 5px;
}



.fontSet {
    margin-right: 20px;
    flex-grow: 5;
}

.imageServer {
    width: 70px;
    display: block;
}

.colAdaptForm {
    flex-grow: 2;
    margin: 10px 0 10px 0;
}

.colAdaptServers {
    flex-grow: 1;
    margin: 10px 0 10px 0;
}

.textBack {
    display: inline-block;
    color: rgb(141, 19, 255);
    font-size: 20px;
    font-weight: 700;
    padding: 10px;
    margin-left: 15px;
    border-radius: 10px;
    background-color: rgb(216, 174, 255);
}

.textBack:hover {
    background-color: #c78bff;
    cursor: pointer;
}

@media (max-width: 1200px) {
    .serverCard {
        scale: 0.8;
        margin: 0 -20px -5px -20px;
    }
}

@media (max-width: 1000px) and (min-width: 768px) {
    .serverCard {
        scale: 0.6;
        margin: 0 -50px -30px -50px;
    }
}
</style>