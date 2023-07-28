<script>
import axios from 'axios';
import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';

export default {
    data() {
        return {
            flows: 1,
            message: '',
            history: [],
            isError: false,
            isLoading: false,
            pMessage: ''
        }
    },
    props: ['session', 'mainServer'],
    methods: {
        goBack() {
            this.$router.push({
                name: 'home'
            });
        },
        async getData() {
            if (this.session && !isNaN(this.session))
                await axios.post(this.mainServer + '/getChatData', {
                    session: this.session
                }).then(response => {
                    if (response.data) {
                        this.flows = response.data.messageCount;
                        this.message = response.data.message;
                    }
                }).catch(err => { this.errMainServer() });
        },
        async send(evt) {
            evt.preventDefault();
            if (this.session && !isNaN(this.session) && this.flows && !isNaN(this.flows)) {
                this.isLoading = true;
                await axios.post(this.mainServer + '/startSendMessagesOnServer', {
                    session: this.session,
                    count: this.flows,
                    message: this.message
                }).then(response => {
                    let data = dayjs();
                    this.history.unshift({ message: response.data, time: data.format('H:m') });
                }).catch(err => { this.errMainServer() });
                this.isError = this.isLoading = false;
            } else
                this.isError = true;
        },
        errMainServer() {
            this.history.push({ message: 'Сайт: Мне не удалось связаться с главным сервером. Я теперь бесполезен? А-а-а-а-а! Возможно, что он обесточен или ушёл в ошибку. Я теперь без него ничего не могу делать. Попробуй ещё раз.' });
        },
        rules() {
            alert("Всю ответственность вы берёте на себя. Инструмент был создан только для развлечения. За дальнейшие действия мы ответственности не несём!");
        }
    },
    mounted() {
        this.getData();
        this.pMessage = faker.lorem.sentences();
    }
}
</script>

<template>
    <div class="container">
        <div class="row">
            <div oncopy="return false;" onmousedown="return false;" oncontextmenu="return false;" class="col">
                <p @click="goBack" class="textBack">Главная</p>
            </div>
        </div>
        <div class="row row-cols-1 row-cols-lg-5 justify-content-center align-items-start">
            <div class="col colAdaptForm">
                <hr>
                <h4>Операции:</h4>
                <div class="formInput">
                    <form @submit="send">
                        <div class="mb-3 fix">
                            <label for="text" class="form-label">Сообщение:</label>
                            <textarea class="form-control" v-model="message" :placeholder="pMessage" id="text"
                                rows="5"></textarea>
                        </div>
                        <div>
                            <label for="range" class="form-label">Количество сообщений: {{ flows }}</label>
                            <input type="range" class="form-range" min="1" max="20" id="range" v-model="flows">
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
                                ОТПРАВИТЬ
                            </button>
                        </div>
                    </form>
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
.formInput .fix .form-control {
    max-height: 500px;
    min-height: 100px;
}
</style>