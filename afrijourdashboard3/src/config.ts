// export const BASE_URL = 'https://backend.afrikajournals.org';
//export const BASE_URL = 'http://192.168.100.8:8000';
// BASE_URL is empty so all `${BASE_URL}/api/...` fetches become
// relative paths. nginx in this container proxies /api, /journal_api,
// /authApi, /admin, /static, /media to Django on 10.176.203.209:8000.
export const BASE_URL = '';
