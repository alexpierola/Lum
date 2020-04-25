const dataKey = '3af00c6cad11f7ab5db4467b66ce503e', weatherKey = '4c28e2aade5f44d8eca9dd8e97638ec8'
let notes, saverInterval
document.addEventListener('DOMContentLoaded', () => {
    notes = document.querySelector('.main-body .notes')
    let options = { weekday: 'long', month: 'long', day: 'numeric' }
    document.querySelector('.welcome-block .welcome-message').innerText = `Hi, today is ${new Intl.DateTimeFormat('en-US', options).format(new Date())}.`
    load(weatherKey, 'weather')
    load(dataKey, 'notepad')
    notes.addEventListener('focus', () => {
        if (saverInterval) clearInterval(saverInterval)
        saverInterval = setInterval(checkNotes, 700)
    })
    notes.addEventListener('blur', () => {
        if (saverInterval) clearInterval(saverInterval)
    })
    document.querySelector('.btn-reload').addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition(chargeLocation)
    })
})

const save = (key, data) => {
    let toSave = {}
    toSave[key] = JSON.stringify(data)
    chrome.storage.sync.set(toSave)
}

const load = (key, dest) => {
    chrome.storage.sync.get(key, result => {
        let data = null
        if (result[key]) data = JSON.parse(result[key])
        switch (dest) {
            case 'notepad':
                if (data != null) notes.innerHTML = data
                break;
            case 'weather':
                if (data != null) {
                    if ((Date.now() - data.timeCall) >= 3600000) {
                        navigator.geolocation.getCurrentPosition(chargeLocation)
                    } else {
                        setHeader(data)
                    }
                } else {
                    navigator.geolocation.getCurrentPosition(chargeLocation)
                }
                break;
        }
    })
}

const chargeLocation = (position) => {
    fetch(`https://fcc-weather-api.glitch.me/api/current?lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
        .then(resp => resp.json())
        .then(data => {
            let toSave = {}
            toSave['weather'] = data.weather[0]
            toSave['temperature'] = data.main
            toSave['timeCall'] = Date.now()
            save(weatherKey, toSave)
            setHeader(toSave)
        })
}

const setHeader = (data) => {
    document.querySelector('.wheather-info.icn').src = data.weather.icon
    document.querySelector('.wheather-info.main').innerText = `${data.weather.main}`
    document.querySelector('.wheather-info.temp').innerText = `${data.temperature.temp}ºC`
    document.querySelector('.wheather-info.templt.max').innerText = `${data.temperature.temp_max}ºC`
    document.querySelector('.wheather-info.templt.min').innerText = `${data.temperature.temp_min}ºC`
}

const checkNotes = () => {
    let data = notes.value
    save(dataKey, data)
}