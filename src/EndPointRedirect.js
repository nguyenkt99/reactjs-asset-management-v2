const DOMAIN = 'http://localhost:3000'
// const DOMAIN = 'https://asset-ptithcm-v2.herokuapp.com'

const STAFF_END_POINT = ['/', '/home', '/request-assign', '/create-request-assign']

export const EndPointRedirect = () => {
    const url = window.location.pathname;
    if (localStorage.getItem('user') === null) {
        if(!'/forgot'.includes(url))
            window.location.href = DOMAIN + '/login'
    } else {
        const user = JSON.parse(localStorage.getItem('user'))
        if (user.role === 'ROLE_STAFF') {
            if (!STAFF_END_POINT.includes(url))
                window.location.href = DOMAIN + '/home'
        }
    }
}