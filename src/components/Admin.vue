<template>
    <div class="admin-panel">
        <!-- login modal -->
        <div :class="{'is-active': isModalOpen}" class="modal">
            <div @click="toggleModal" class="modal-background"></div>
            <div class="modal-content">
                <form @submit.prevent="authorize">
                    <div class="modal-card">
                        <header class="modal-card-head">
                            <p class="modal-card-title">Login</p>
                        </header>
                        <section class="modal-card-body">
                            <div class="field">
                                <label class="label" for="input-login">Login</label>
                                <div class="control">
                                    <input class="input" id="input-login" type="text" v-model="form.login">
                                </div>
                            </div>

                            <div class="field">
                                <label class="label" for="input-password">Password</label>
                                <div class="control">
                                    <input class="input" id="input-password" type="password" v-model="form.pass">
                                </div>
                            </div>
                        </section>
                        <footer class="modal-card-foot">
                            <button class="button">Authorize</button>
                            <button @click.prevent="toggleModal" class="button">Close</button>
                        </footer>
                    </div>
                </form>
            </div>
        </div>
        <div class="columns">
            <!-- navigation -->
            <!-- @todo hide nav-->
            <aside class="menu">
                <ul class="menu-list">
                    <li>
                        <router-link to="/">Go to game</router-link>
                    </li>
                    <li>
                        <router-link to="/upload">Upload</router-link>
                    </li>
                    <li>
                        <router-link to="/reports">Reports</router-link>
                    </li>
                    <li v-if="isAuth"><a @click="logout" href="#">Logout</a></li>
                    <li v-else><a @click="toggleModal" href="#">Login</a></li>
                </ul>
            </aside>
            <main class="column">
                <!-- notification -->
                <div class="section" v-if="!isAuth">
                    <div class="container">
                        <div class="notification is-warning">
                            <button @click="removeNotification" class="delete"></button>
                            You need to login first
                        </div>
                    </div>
                </div>
                <!-- content -->
                <slot v-if="isAuth"></slot>
            </main>
        </div>
    </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex'
  import { authorize } from '../api/auth'

  export default {
    name: 'Admin',
    data () {
      return {
        isModalOpen: false,
        isNavOpen: false,
        form: {
          login: '',
          pass: '',
        },
      }
    },
    computed: {
      ...mapState({
        isAuth: state => state.auth && state.auth.length > 0,
      }),
    },
    methods: {
      ...mapActions(['logout', 'login',]),
      async authorize () {
        const credentials = await authorize({password: this.form.pass, username: this.form.login})
        if (!credentials) {
          alert('Wrong login or password')
          this.isModalOpen = false
        } else {
          const auth = 'Bearer ' + credentials.token
          this.login({auth}).then(() => {
            this.form.login = this.form.pass = ''
            this.isModalOpen = false
          })
        }
      },
      removeNotification (e) {
        e.target.parentNode.remove()
      },
      toggleModal () {
        this.isModalOpen = !this.isModalOpen
      },
      toggleNav () {
        this.isNavOpen = !this.isNavOpen
      },
    }
  }
</script>

<style scoped>
    .menu {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    .notification.is-warning {
        background-color: #e47518;
        font-weight: bold;
        color: #000;
    }
    .modal-card-head, .modal-card-foot {
        background-color: #fff;
    }
    .modal-card-title {
        font-weight: bold;
        color: #000;
    }
</style>