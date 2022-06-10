class MastodonAuthorizer {
    constructor(domain='mstdn.jp', scope='write:statuses') {
        const url = new URL(location.href)
        url.searchParams.delete('code');
        this.redirect_uri = url.href
        this.domain = domain
        //this.scope = 'read write follow push'
        this.scope = 'write:statuses'
        this.client = new MastodonRestClient(this.domain)
    }
    async authorize(status) {
        const app = await this.#createApp()
        sessionStorage.setItem(`${domain}-app`, JSON.stringify(app));
        sessionStorage.setItem(`${domain}-client_id`, app.client_id);
        sessionStorage.setItem(`${domain}-client_secret`, app.client_secret);
        sessionStorage.setItem(`status`, status);
        this.#authorize(app.client_id)
    }
    async #createApp() {
        console.debug('----- apps -----')
        const params = {
            client_name: this.#createClientName(),
            redirect_uris: `${this.redirect_uri}`,
            scopes: this.scope,
            website: `${this.redirect_uri}`,
        };
        return await this.client.post('api/v1/apps', null, params)
    }
    #createClientName() {
        // mstdn.jp では60字以下でないとエラーになる
        //    client_name: `Test Application by API redirect_uris=${this.redirect_uri}`,
        // {"error":"Validation failed: Application name is too long (maximum is 60 characters)"}
        return `toot requester`
    }
    #authorize(client_id) {
        console.debug('----- authorize -----')
        const url = new URL(this.redirect_uri)
        url.searchParams.set('domain', this.domain)
        //const redirect_uri = this.redirect_uri + `?domain=${this.domain}`
        const redirect_uri = url.href
        //const url = new URL(`https://${this.domain}/oauth/authorize?client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&response_type=code`).href
        const url = new URL(`https://${this.domain}/oauth/authorize?response_type=code&client_id=${client_id}&scope=${this.scope}&redirect_uri=${redirect_uri}`).href
        console.debug(url)
        window.location.href = url
    }
    async redirectCallback() {
        const url = new URL(location.href)
        // マストドンAPI oauth/authorize でリダイレクトされた場合（認証を拒否した場合）
        if(url.searchParams.has('error') && url.searchParams.get('domain')) {
            console.debug(this.domain, url.searchParams.get('domain'))
            if (this.domain === url.searchParams.get('domain')) {
                console.debug((url.searchParams.has('error_description')) ? decodeURI(url.searchParams.get('error_description')) : '認証エラーです。')
                //alert((url.searchParams.has('error_description')) ? decodeURI(url.searchParams.get('error_description')) : '認証エラーです。')
                //this.#toast((url.searchParams.has('error_description')) ? decodeURI(url.searchParams.get('error_description')) : '認証エラーです。', true)
                //this.#toast('キャンセルしました')
                Toaster.toast('キャンセルしました')
                const params = url.searchParams;
                params.delete('error');
                params.delete('error_description');
                history.replaceState('', '', url.pathname);
            }
        }
        // マストドンAPI oauth/authorize でリダイレクトされた場合（認証に成功した場合）
        else if (url.searchParams.has('code') && url.searchParams.has('domain')) {
            const domain = url.searchParams.get('domain') // mstdn.jp, pawoo.net, ...
            //const tooter = new Tooter(domain)
            const code = url.searchParams.get('code')
            // 認証コード(code)をURLパラメータから削除する
            const params = url.searchParams;
            params.delete('code');
            history.replaceState('', '', url.pathname);
            // トークンを取得して有効であることを確認しトゥートする
            const status = sessionStorage.getItem(`status`)
            console.debug('----- authorized -----')
            console.debug('client_id:', sessionStorage.getItem(`${domain}-client_id`))
            console.debug('client_secret:', sessionStorage.getItem(`${domain}-client_secret`))
            console.debug('認証コード', code)
            // client_id, client_secretはsessionStorageに保存しておく必要がある
            //const json = await tooter.getToken(sessionStorage.getItem(`${domain}-client_id`), sessionStorage.getItem(`${domain}-client_secret`), code)
            const json = await this.#getToken(sessionStorage.getItem(`${domain}-client_id`), sessionStorage.getItem(`${domain}-client_secret`), code)
            //this.#errorApi(json)
            this.client.error(json)
            console.debug('access_token:', json.access_token)
            sessionStorage.setItem(`${domain}-access_token`, json.access_token);
            const accessToken = json.access_token
            const v = await this.#verify(accessToken)
            console.debug(v)
            //this.#errorApi(v)
            this.client.error(v)
            return accessToken
            /*
            const res = await tooter.toot(accessToken, status)
            //this.#errorApi(res)
            this.client.error(res)
            //this.#requestWebmention(res)
            new WebmentionRequester().request(res.url)
            sessionStorage.removeItem(`status`)
            //this.classList.remove('jump');
            //this.classList.remove('flip');
            this.#tootEvent(res)
            console.debug('----- 以上 -----')
            */
        }
    }
    async #getToken(client_id, client_secret, code) {
        console.debug('----- token -----')
        const params = {
            grant_type: 'authorization_code',
            client_id: client_id,
            client_secret: client_secret,
            redirect_uri: this.redirect_uri,
            code: code,
        };
        return await this.client.post('oauth/token', null, params)
    }
    async #verify(accessToken) {
        console.debug('----- verify -----')
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
        };
        const res = await this.client.get('api/v1/apps/verify_credentials', headers, null)
        if (res.hasOwnProperty('error')) { return false }
        return true
    }
}

