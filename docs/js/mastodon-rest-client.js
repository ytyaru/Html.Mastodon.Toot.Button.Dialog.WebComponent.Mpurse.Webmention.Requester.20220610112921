class MastodonRestClient {
    constructor(domain) {
        this.domain = domain
        this.client = new RestClient()
    }
    //async get(endpoint, headers) { return this.client.get(`https://${this.domain}/api/${endpoint}`, headers) }
    //async post(endpoint, headers, params) { return this.client.post(`https://${this.domain}/api/${endpoint}`, headers, params) }
    async get(endpoint, headers) {
        const res = await this.client.get(`https://${this.domain}/${endpoint}`, headers)
        this.#error(res)
        return res
    }
    async post(endpoint, headers, params) {
        const res = await this.client.post(`https://${this.domain}/${endpoint}`, headers, params)
        this.#error(res)
        return res
    }
    error(json) {
        console.debug(json)
        if (json.hasOwnProperty('error')) {
            Toaster.toast(json.error, true)
            //this.#toast(json.error, true)
            //sessionStorage.removeItem(`${domain}-app`, JSON.stringify(app));
            sessionStorage.removeItem(`${domain}-client_id`, app.client_id);
            sessionStorage.removeItem(`${domain}-client_secret`, app.client_secret);
            //sessionStorage.removeItem(`status`);
            sessionStorage.removeItem(`${domain}-access_token`, json.access_token);
            throw new Error(`マストドンAPIでエラーがありました。詳細はデバッグログやsessionStorageを参照してください。: ${JSON.stringify(json)}`)
        }
    }
    /*
    #toast(message, error=false) {
        console.debug(message)
        const options = {
            text: message, 
            position:'center'
        }
        if (error) { options.style = { background: "red" } }
        if (Toastify) { Toastify(options).showToast(); }
        else { alert(message) }
    }
    */
}
