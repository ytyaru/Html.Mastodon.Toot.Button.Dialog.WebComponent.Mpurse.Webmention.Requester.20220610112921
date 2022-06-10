class MastodonApiClient {
    constructor(domain, accessToken) {
        this.client = new MisskeyRestClient(domain)
        this.accessToken = accessToken
    }
    #authHeader() { return {'Authorization': `Bearer ${this.accessToken}`} }
    #headers(headers=null) { return (headers) ? {...this.#authHeader(), headers...} : this.#authHeader() }
    async verify(status) {
        console.debug('----- verify_credentials -----')
        return await this.client.get('api/v1/apps/verify_credentials', null, null)
    }
    async toot(status) {
        console.debug('----- toot -----')
        console.debug('status:', status)
        const params = {status: status};
        return await this.client.post('api/v1/statuses', null, params)
    }
    /*
    async toot(accessToken, status) {
        console.debug('----- toot -----')
        const statusEl = document.getElementById('status')
        //const status = (statusEl.hasAttribute('contenteditable')) ? statusEl.innerText : statusEl.value
        console.debug('status:', status)
        const headers = { 'Authorization': `Bearer ${accessToken}` }
        const params = {status: status, visibility:'public'};
        return await this.post('api/v1/statuses', headers, params)
    }
    */
    /*
    error(json) {
        console.debug(json)
        if (json.hasOwnProperty('error')) {
            this.#toast(json.error, true)
            //sessionStorage.removeItem(`${domain}-app`, JSON.stringify(app));
            sessionStorage.removeItem(`${domain}-client_id`, app.client_id);
            sessionStorage.removeItem(`${domain}-client_secret`, app.client_secret);
            //sessionStorage.removeItem(`status`);
            sessionStorage.removeItem(`${domain}-accessToken`, json.accessToken);
            throw new Error(`マストドンAPIでエラーがありました。詳細はデバッグログやsessionStorageを参照してください。: ${JSON.stringify(json)}`)
        }
    }
    */
}
