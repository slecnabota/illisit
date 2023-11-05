import get from "lodash";
import map from "lodash";
import reduce from "lodash";
import { isFunction } from "lodash";
import IllisitLib from "./Lib";
import IllisitStore from "illisit-store";
import { createApp } from "vue";

export default class IllisitCore extends IllisitLib {
  static _defaultConfig = {};

  static createApp(settings = {}, libs = {}, App) {
    const app = createApp(App);
    const hasConfig = settings.config !== undefined;

    const getAppConfig = (key, def) => {
      return this._configFn(hasConfig ? settings.config() : {}, key, def);
    };
    if (!libs.store) libs.store = { IllisitStore };
    app.config.globalProperties.$config = (key, def) =>
      this._configFn(hasConfig ? settings.config() : {}, key, def);
    const allStores = {
      ...(settings.stores || {}),
      ...this._getLibsStores(libs),
    };
    const store = new libs.store.IllisitStore(allStores, getAppConfig("store"));
    const appGlobals = {
      store,
      form: libs.form
        ? new new libs.form.IllisitForm(
            app.config.globalProperties.$config("form")
          )()
        : {},
    };
    app.config.globalProperties.$app = appGlobals;
    // app.config.globalProperties.$form = libs.form ? new (libs.form.IllisitForm)(app.config.globalProperties.$config('form')) : {};

    Object.entries(this._getLibsPlugins(libs)).forEach(([name, plugin]) => {
      if (plugin) {
        app.use(plugin, getAppConfig(name));
      }
    });
    app.use(store.store());
    return app.mount("#app");
  }
  static _getLibsStores(libs) {
    return Object.entries(libs).reduce((result, [name, lib]) => {
      const storeFunc = lib['Illisit' + name.charAt(0).toUpperCase() + name.slice(1)].store;
      if (isFunction(storeFunc)) {
        result[name] = storeFunc(this._configFn({}, name));
      }
      return result;
    }, {});
}

  static _getLibsPlugins(libs) {
    return Object.entries(libs).reduce((result, [name, lib]) => {
      const className = `Illisit${
        name.charAt(0).toUpperCase() + name.slice(1)
      }`;
      const FormClass = lib[className];
      if (isFunction(FormClass)) {
        result[name] = new FormClass();
      }
      return result;
    }, {});
  }

  static _configFn(data, key = undefined, def = undefined) {
    if (key === undefined) {
      return data;
    }
    return get(data, key, def);
  }
}
