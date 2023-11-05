import get from 'lodash/get'

class IllisitLib{
    static _defaultConfig = {}

    _userConfig = {}
    
    constructor(config = {}){
        this._userConfig = config
    }
    static vue(){
        return{
            install(app, options){
                app.config.globalProperties.$IllisitLib = new IllisitLib(options);
            }
        }
    }
    _config(key, config = undefined){
        console.log(config);
        return get(this._userConfig || {}, key, this.constructor._defaultConfig[key])
    }

    static _config(key, config){
        return get(config, key, this._defaultConfig[key])
    }

}
export default IllisitLib