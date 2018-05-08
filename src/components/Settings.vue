<template>
  <md-app md-waterfall md-mode="fixed">
      <md-app-toolbar class="md-primary fn-settings-menu">
        <!-- <md-button class="md-icon-button" @click="menuVisible = !menuVisible">
          <md-icon>menu</md-icon>
        </md-button><md-icon md-src=""></md-icon> -->
         
        <span class="md-title" style="font-size: 123%;">Settings</span>
      </md-app-toolbar>

      <!-- <md-app-drawer :md-active.sync="menuVisible">
        <md-toolbar class="md-transparent fn-settings-drawer" md-elevation="0">Navigation</md-toolbar>

        <md-list>
          <md-list-item>
            <md-icon>move_to_inbox</md-icon>
            <span class="md-list-item-text">Inbox</span>
          </md-list-item>

          <md-list-item>
            <md-icon>send</md-icon>
            <span class="md-list-item-text">Sent Mail</span>
          </md-list-item>

          <md-list-item>
            <md-icon>delete</md-icon>
            <span class="md-list-item-text">Trash</span>
          </md-list-item>

          <md-list-item>
            <md-icon>error</md-icon>
            <span class="md-list-item-text">Spam</span>
          </md-list-item>
        </md-list>
      </md-app-drawer> -->

      <md-app-content>
        <div class="fn-settings">
          <SettingsSection title="Пользователь" v-if="user">
            <div class="fn-settings-row fn-settings-row--lg">
              <div class="fn-settings-option">
                <img class="fn-settings-profile-avatar" v-bind:src="user.picture"/>
                <div class="fn-settings-profile-info">
                  <span class="fn-settings-profile-info-name">{{user.fullName}}</span>
                  <div class="fn-settings-profile-info-email">{{user.email}}</div>
                </div>
                <div class="fn-settings-divider"></div>
                <div class="fn-settings-option-control fn-settings-option-control--logout">
                  <md-button v-on:click="handleLogout">Выйти</md-button>
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Общие">
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
              <div class="fn-settings-option-name">
                Интервал проверки (мин.)
              </div>
              <div class="fn-settings-option-control">
                <md-field md-inline>
                  <md-input v-model="options.updateInterval" type="number" min=10 max=120 step=5></md-input>
                </md-field>
              </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Пометить новость как прочитанную при открытии
                </div>
                <div class="fn-settings-option-control">
                  <md-switch v-model="options.markReadOnClick"></md-switch>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Показывать счётчик
                </div>
                <div class="fn-settings-option-control">
                  <md-switch v-model="options.showCounter"></md-switch>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Отображать серую иконку, если нет непрочитанных
                </div>
                <div class="fn-settings-option-control">
                  <md-switch v-model="options.showGrayIconIfNoUnread"></md-switch>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Сбрасывать счётчик при нажатии на иконку расширения
                </div>
                <div class="fn-settings-option-control">
                  <md-switch v-model="options.resetCounterOnClick"></md-switch>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Использовать защищённое соединение (https)
                </div>
                <div class="fn-settings-option-control">
                  <md-switch v-model="options.useSecureConnection"></md-switch>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Включить фоновый режим
                </div>
                <div class="fn-settings-option-control">
                  <md-switch v-model="options.enableBackgroundMode"></md-switch>
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Всплывающее окно">
            <div class="fn-settings-row">
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Открывать сайт <strong>feedly.com</strong> по нажатию на иконку (не показывать всплывающее окно)
                </div>
                <div class="fn-settings-option-control">
                  <md-switch v-model="options.openFeedlyOnIconClick"></md-switch>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Открывать новости в фоновой вкладке
                </div>
                <div class="fn-settings-option-control">
                  <md-switch v-model="options.openFeedsInBackgroundTab"></md-switch>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Возможность сохранять записи
                </div>
                <div class="fn-settings-option-control">
                  <md-switch v-model="options.abilityToSaveFeeds"></md-switch>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Максимальное количество новостей во всплывающем окне
                </div>
                <div class="fn-settings-option-control">
                  <md-field md-inline>
                    <md-input v-model="options.maxFeedsCount" type="number" min=1 max=60></md-input>
                  </md-field>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Показывать старые записи первыми
                </div>
                <div class="fn-settings-option-control">
                  <md-switch v-model="options.showOldestFeedsFirst"></md-switch>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Размер шрифта во всплывающем окне в процентах
                </div>
                <div class="fn-settings-option-control">
                  <md-field md-inline>
                    <md-input v-model="options.popupFontSize" type="number" min=70 max=150></md-input>
                  </md-field>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Ширина всплывающего окна
                </div>
                <div class="fn-settings-option-control">
                  <md-field md-inline>
                    <md-input v-model="options.popupWidth" type="number" min=380 max=750></md-input>
                  </md-field>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Ширина всплывающего окна в раскрытом режиме
                </div>
                <div class="fn-settings-option-control">
                  <md-field md-inline>
                    <md-input v-model="options.expandedPopupWidth" type="number" min=380 max=750></md-input>
                  </md-field>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Показывать полное содержание статьи при раскрытии новости (если возможно)
                </div>
                <div class="fn-settings-option-control">
                  <md-switch v-model="options.showFullFeedContent"></md-switch>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
                <div class="fn-settings-option-name">
                  Показывать категории во всплывающем окне
                </div>
                <div class="fn-settings-option-control">
                  <md-switch v-model="options.showCategories"></md-switch>
                </div>
              </div>
            </div>
            <div class="fn-settings-row">
              <div class="fn-settings-option">
              <div class="fn-settings-option-name">
                Принудительно обновлять новости при открытии всплывающего окна
              </div>
              <div class="fn-settings-option-control">
                <md-switch v-model="options.forceUpdateFeeds"></md-switch>
              </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
              <div class="fn-settings-option-name">
                Открывать новости в одной вкладке
              </div>
              <div class="fn-settings-option-control">
                <md-switch v-model="options.openFeedsInSameTab"></md-switch>
              </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
              <div class="fn-settings-option-name">
                Раскрывать все новости при открытии всплывающего окна
              </div>
              <div class="fn-settings-option-control">
                <md-switch v-model="options.forceExpandFeeds"></md-switch>
              </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Уведомления">
            <div class="fn-settings-row">
              <div class="fn-settings-option">
              <div class="fn-settings-option-name">
                Показывать уведомления
              </div>
              <div class="fn-settings-option-control">
                <md-switch v-model="options.showNotifications"></md-switch>
              </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
              <div class="fn-settings-option-name">
                Отображать иконку сайта в уведомлении
              </div>
              <div class="fn-settings-option-control">
                <md-switch v-model="options.showIconInNotification"></md-switch>
              </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
              <div class="fn-settings-option-name">
                Отображать превью новости в уведомлении
              </div>
              <div class="fn-settings-option-control">
                <md-switch v-model="options.showThumbnailInNotification"></md-switch>
              </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
              <div class="fn-settings-option-name">
                Максимальное количество уведомлений
              </div>
              <div class="fn-settings-option-control">
                <md-field md-inline>
                  <md-input v-model="options.maxNotifications" type="number" min=1 max=10></md-input>
                </md-field>
              </div>
              </div>
            </div>
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
              <div class="fn-settings-option-name">
                Проигрывать звуковое уведомление
              </div>
              <div class="fn-settings-option-control">
                <md-switch v-model="options.playSoundOnNotification"></md-switch>
              </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Фильтры">
            <div class="fn-settings-row">               
              <div class="fn-settings-option">
                  <div class="fn-settings-option-name">
                    Обновлять только следующие категории
                  </div>
                  <div class="fn-settings-option-control">
                    <md-switch v-model="options.enableFilters"></md-switch>
                  </div>
                </div>
                <div class="fn-settings-option-panel" v-show="options.enableFilters">
                  <md-list class="md-dense">
                    <md-list-item>
                      <span class="md-list-item-text">Show content preview</span>
                      <md-switch v-model="options.filter1" />
                    </md-list-item>
                    <md-divider></md-divider>
                    <md-list-item>                      
                      <span class="md-list-item-text">Sound</span>
                      <md-switch v-model="options.filter2" />
                    </md-list-item>
                    <md-divider></md-divider>
                    <md-list-item>
                      <span class="md-list-item-text">Vibrate</span>
                      <md-switch v-model="options.filter3" />
                    </md-list-item>
                    <md-divider></md-divider>
                    <md-list-item>
                      <span class="md-list-item-text">Notification light</span>
                      <md-switch v-model="options.filter4" />
                    </md-list-item>
                  </md-list>
                </div>
              </div>
          </SettingsSection>
        </div>
      </md-app-content>
    </md-app>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Model, Inject } from "vue-property-decorator";
import { State, Action, Getter } from 'vuex-class';
import SettingsSection from "./SettingsSection.vue";

import { mapState } from "vuex";
import { IFeedlyUserInfo } from "src/scripts/feedly.api.models";
import ISettingsModuleState from "../store/models";
@Component({
  components: {
    SettingsSection: SettingsSection
  },
  computed: {
    ...mapState({
      user: (state: ISettingsModuleState) => {
        console.log(state);
        return state.user;
      },
    })
  }
})
export default class Settings extends Vue {
  
  user: IFeedlyUserInfo | undefined;
  
  @Action('RETRIEVE_USER_INFO') getUserInfo: any;
  @Action('getOptions') getOptions: any;
  @Action('LOGOUT_USER') logout: any;

  // menuVisible: boolean = false;
  options = {
    popupWidth: 380,
    expandedPopupWidth: 750,
    popupFontSize: 100,
    maxFeedsCount: 20,
    updateInterval: 10,
    showNotifications: false,
    showIconInNotification: false,
    maxNotifications: 4,
    playSoundOnNotification: false
  };

  mounted() {
    this.getUserInfo();
    // this.getOptions();
  }

  handleLogout() {
    console.log('handleLogout() called');
    this.logout();
  }
}
</script>

<style lang="scss" scoped>

.fn-settings-layout {
  background-color: #f1f1f1;
}

.fn-settings-drawer {
  border-bottom: 1px solid #ebebeb;
}

.fn-settings {
  margin: 0 auto 50px;
  min-width: 550px;
  max-width: 686px;
}

.fn-settings-row {
  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: center;

  padding: 0 20px;

  border-top: 1px solid #f0f0f0;
}

.fn-settings-option {
  width: 100%;
  max-width: 100%;
  min-width: 0;

  min-height: 48px;

  justify-content: space-between;
  align-items: center;
  display: flex;
  flex-direction: row;
}

.fn-settings-row:first-child {
  border-top: none;
}

.fn-settings-row.fn-settings-row--lg {
  min-height: 64px;
}

.fn-settings-profile-avatar {
  box-sizing: border-box;
  width: 40px;
  height: 40px;

  border-radius: 20px;

  margin: 4px 0;
}

.fn-settings-profile-info {
  padding-left: 16px;
}

.fn-settings-profile-info-email {
  color: #757575;
}

.fn-settings-divider {
  margin-left: auto;
  height: 39px;
  border-right: 1px solid #f0f0f0;
}

.fn-settings-option-control {
  margin-left: 5px;
}

.fn-settings-option-control--logout .md-button {
  min-width: auto;
  color: #757575;
  font-weight: 500;
  font-size: 13px;

  margin-right: -8px;
}

.fn-settings-option-control .md-switch {
  margin: 14px 0;
}

.fn-settings-option-control .md-field {
  width: 40px;
  min-height: auto;
  margin: 0;
  padding-top: 0;

  input.md-input {
    max-width: -webkit-fill-available;
    max-width: -moz-available;
    font-size: 13px;
  }
}

.fn-settings-option-panel {
  width: 100%;
}
</style>