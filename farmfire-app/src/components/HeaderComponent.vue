<script>
export default {
    data() {
        return {
            themeModeImg: 'lightMode',
            session: '',
            isError: false
        }
    },
    props: ['isDark'],
    methods: {
        async optimizeInput() {
            this.isError = false;
            if (this.session.includes('https:')) {
                if (this.session.includes('stream-new')) {
                    let patchedSession = '';
                    let i = this.session.length - 1;
                    while (this.session[i] != 'w' && i > -1) {
                        if (!isNaN(this.session[i]))
                            patchedSession += this.session[i];
                        i--;
                    }

                    let result = '';
                    for (let k = patchedSession.length - 1; k > -1; k--)
                        result += patchedSession[k];
                    this.session = Number(result);
                } else
                    this.isError = true;
            }
            this.$emit('update-session', this.session);
        },
        async setThemeMode() {
            await this.$emit('update-value', !this.isDark);
            if (this.isDark)
                this.themeModeImg = 'darkMode'
            else
                this.themeModeImg = 'lightMode'
        }
    }
}
</script>

<template>
    <div class="d-flex justify-content-between align-items-center">
        <div class="alignCenter"></div>
        <div class="m-5 maxContent">
            <label for="sessionID" class="form-label">Вставьте прямую ссылку на Вебинар:</label>
            <input @input="optimizeInput()" type="text" class="form-control" id="sessionID" v-model="session">
            <div class="form-text">Мы автоматически преобразуем её в ID.</div>
            <div class="alert alert-danger widthFix mt-3" role="alert" v-if="isError">
                Это не та ссылка! Это не прямая ссылка. Перейдите на трансляцию и скопируйте ссылку прямо из браузерной
                строки URL.
            </div>
        </div>
        <div class="alignCenter">
            <img @click="setThemeMode" :src="'src/assets/' + themeModeImg + '.png'" alt="setTheme">
        </div>
    </div>
</template>

<style>
.widthFix {
    width: 300px;
}

.alignCenter {
    margin: 5rem;
}

.form-text {
    color: rgb(139, 139, 139, 0.9);
}
</style>