export const normalizeString = (str) => {
    // return str.toLowerCase().split(' ').filter(c => c !== '').join(' ')
    return str.toLowerCase().replace(/  +/g, ' ').trim()
}

export const removeAccents = (str) => {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

export const removeSpecialCharacters = (str) => {
    return str.replace(/[0-9&/\\`@!^_#,+\-|()=$~%.'":;*?<>[\]{}]/g, '');
}

export const normalizeSpace = (str) => {
    return str.replace(/  +/g, ' ')
}