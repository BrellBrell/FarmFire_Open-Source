<script>
export default {
    methods: {
        goToFire() {
            this.$router.push({
                name: 'fire'
            });
        },
        goToChat() {
            this.$router.push({
                name: 'chat'
            });
        },
        goToUser() {
            this.$router.push({
                name: 'user'
            });
        }
    }

}
</script>

<template>
    <div class="container">
        <div oncopy="return false;" onmousedown="return false;" oncontextmenu="return false;"
            class="row align row-cols-1 row-cols-lg-4">
            <div @click="goToFire" class="col floorFire d-flex align-items-center">
                <img src="../assets/fire.png" alt="fire">
                <p class="text">С помощью этого режима ты сможешь сделать много огоньков на трансляции Webinar! Это самая
                    тяжёлая функция для наших серверов. Скорее попробуй!</p>
            </div>
            <div @click="goToChat" class="col floorChat d-flex align-items-center">
                <img src="../assets/chat.png" alt="chat">
                <p class="text">С помощью этого режима ты сможешь создать и отправить много копий своего сообщения за раз!
                </p>
            </div>
            <div @click="goToUser" class="col floorUser d-flex align-items-center">
                <img src="../assets/users.png" alt="users">
                <p class="text">С помощью этого режима ты сможешь создать много копий гостей, которых пожелаешь! Их имена
                    увидят админы трансляции.</p>
            </div>
        </div>
    </div>
</template>

<style>
.text {
    text-align: justify;
    font-weight: 700;
    color: white;
}

.align {
    justify-content: center;
    align-items: center;
    margin-top: 10vh;
    gap: 20px;
}

.floorFire {
    flex-basis: 500px;
    min-width: 500px;
    background-color: #ff7300;
    transition: all 200ms;
    outline: #ff2600 solid 5px;
    outline-offset: -5px;
    border-radius: 30px;
    background: linear-gradient(to bottom right, #ff7300, #ff2600);
}

.floorFire:hover {
    outline-offset: 3px;
    border-radius: 30px;
    cursor: pointer;
}

.floorChat {
    flex-basis: 500px;
    background-color: #9c9c9c;
    transition: all 200ms;
    min-width: 500px;
    outline: #686868 solid 5px;
    outline-offset: -5px;
    border-radius: 30px;
    background: linear-gradient(to bottom right, #9c9c9c, #686868);
}

.floorChat:hover {
    outline-offset: 3px;
    border-radius: 30px;
    cursor: pointer;
}

.floorUser {
    flex-basis: 500px;
    min-width: 500px;
    background-color: #3161ff;
    transition: all 200ms;
    outline: #00aeff solid 5px;
    outline-offset: -5px;
    border-radius: 30px;
    background: linear-gradient(to bottom right, #00aeff, #3161ff);
}

.floorUser:hover {
    outline-offset: 3px;
    border-radius: 30px;
    cursor: pointer;
}

@media (max-width: 636px) {
    .alignCenter {
        margin: 0;
    }
}

@media (max-width: 500px) {

    .row {
        margin-left: 0;
        margin-right: 0;
    }

    .backgr {
        font-size: small;
    }

    .imgLink {
        width: 15px;
        margin-bottom: 10px;
    }

    .floorFire {
        scale: 0.6;
        margin: -30px;
    }

    .floorChat {
        scale: 0.6;
        margin: -30px;
    }

    .floorUser {
        scale: 0.6;
        margin: -30px;
    }
}
</style>