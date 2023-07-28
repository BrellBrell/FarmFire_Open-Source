<script>
import axios from 'axios';

export default {
    data() {
        return {
            versions: {}
        }
    },
    props: ['session', 'mainServer'],
    methods: {
        async getVersions() {
            await axios.get(this.mainServer + '/getVersions').then(response => {
                if (response.data)
                    this.versions.webApp = response.data.webApp.toFixed(1);
                this.versions.mainServer = response.data.mainServer.toFixed(1);
                this.versions.serverHF = response.data.serverHF.toFixed(1);
            }).catch(error => { });
        }
    },
    mounted() {
        this.getVersions();
    }
}
</script>

<template>
    <div class="backgr d-flex align-items-center flex-column">
        <div class="p-2 pt-5 mt-auto"><i>Версия web-приложения: V{{ versions.webApp }}</i> || <i>Версия сервера: V{{
            versions.mainServer }}</i> || <i>Версия HF
                серверов: V{{ versions.serverHF }}</i></div>
        <div class="pb-5">Создатель и разработчик: <a href="https://t.me/BrellBrell" target="_blank">Brell<img
                    src="../assets/link.svg" alt="link" class="imgLink"></a> || Помог с
            бесплатной публикацией серверов: <a href="https://t.me/ddosxd" target="_blank">ddosxd<img
                    src="../assets/link.svg" alt="link" class="imgLink"></a></div>
        <div class="p-2">© FarmFire-App, приложение для фарминга огоньков, 2023</div>
        <div class="p-2 pb-5 mb-auto">Все права защищены ©</div>
    </div>
</template>

<style>
.backgr {
    background-color: rgb(34, 34, 34);
    color: white;
    text-align: center;
}

.imgLink {
    width: 20px;
    margin-bottom: 15px;
}
</style>