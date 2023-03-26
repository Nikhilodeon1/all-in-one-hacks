// collect DOMs
const display = document.querySelector('.display')
const controllerWrapper = document.querySelector('.controllers')

const State = ['Initial', 'Record', 'Download']
let stateIndex = 0
let mediaRecorder, chunks = [], audioURL = ''

// mediaRecorder setup for audio
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
    console.log('mediaDevices supported..')

    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(stream => {
        mediaRecorder = new MediaRecorder(stream)

        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data)
        }

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'})
            chunks = []
            audioURL = window.URL.createObjectURL(blob)
            document.querySelector('audio').src = audioURL

        }
    }).catch(error => {
        console.log('Following error has occured : ',error)
    })
}else{
    stateIndex = ''
    application(stateIndex)
}

const clearDisplay = () => {
    display.textContent = ''
}

const clearControls = () => {
    controllerWrapper.textContent = ''
}

const record = () => {
    stateIndex = 1
    mediaRecorder.start()
    application(stateIndex)
}

const stopRecording = () => {
    stateIndex = 2
    mediaRecorder.stop()
    application(stateIndex)
}

const downloadAudio = () => {
    const downloadLink = document.createElement('a')
    downloadLink.href = audioURL
    downloadLink.setAttribute('download', 'audio')
    downloadLink.click()
}

const addButton = (id, funString, text) => {
    const btn = document.createElement('button')
    btn.id = id
    btn.setAttribute('onclick', funString)
    btn.textContent = text
    controllerWrapper.append(btn)
}

const addMessage = (text) => {
    const msg = document.createElement('p')
    msg.textContent = text
    display.append(msg)
}

const addAudio = () => {
    const audio = document.createElement('audio')
    audio.id = "sus"
    audio.controls = true
    audio.src = audioURL
    display.append(audio)
}

const application = (index) => {
    switch (State[index]) {
        case 'Initial':
            clearDisplay()
            clearControls()

            addButton('record', 'record()', 'Start Recording')
            break;

        case 'Record':
            clearDisplay()
            clearControls()

            addMessage('Recording...')
            addButton('stop', 'stopRecording()', 'Stop Recording')
            break

        case 'Download':
            clearControls()
            clearDisplay()

            addAudio()
            addButton('record', 'record()', 'Record Again')
            break

        default:
            clearControls()
            clearDisplay()

            addMessage('Your browser does not support mediaDevices')
            break;
    }

}

application(stateIndex)
document.getElementById('record').addEventListener("click", function(){
document.getElementById('stop').addEventListener("click", function(){
    document.getElementById('nuts').submit()
    let sussyabc = document.getElementById('sus').src
    console.log(sussyabc);
});
});
//Dotted Scroll Effect Helper

const getFps = () => new Promise(resolve => {
    let repaint = 0;
    const start = performance.now();
    const withRepaint = () => {
        requestAnimationFrame(() => {
            if ((performance.now() - start) < 1000) {
                repaint += 1;
                withRepaint();
            } else {
                resolve(repaint);
            }
        });
    };
    withRepaint();
});

let center = {
    x: innerWidth / 2,
    y: innerHeight / 2
},
    dot_change = 1 / 15,
    dot_refresh = 1000 / 60, //for now until real fps can get determined
    change_max = 10,
    x = -1,
    y = -1,
    dot_pos = 0;
(async () => { window.dot_refresh = 1000 / await getFps() })();
window.onmousemove = function handle(event) {
    x = event.clientX
    y = event.clientY
    if (x / 10 > innerWidth) x = 100;
    if (y / 10 > innerHeight) y = 100;
}

function re() {
    window.document.documentElement.style.setProperty(
        "--audiooffset",
        (window.document.querySelector("audio").getBoundingClientRect().width / 2).toString() + "px"
    );
}

onresize = function size_recalculator() {
    window.center = {
        x: innerWidth / 2,
        y: innerHeight / 2
    }
    re();
}

function idle_mover() {
    var x_offset = (center.x - (innerWidth - x)) / 24
    var y_offset = (center.y - (innerHeight - y)) / 24
    let target = document.querySelector(".dots-scroll")
    target.animate({
        'backgroundPosition': `${(x_offset + dot_pos) / 2}% ${(y_offset + dot_pos) / 2}%`
    }, {
        duration: 300,
        iterations: 1
    })
    dot_pos += dot_change
}

setInterval(() => {
    if (dot_pos > 10e10) dot_pos = 0;
}, 240 * 1000)

let articles = Array.from(document.querySelector('article'))

onload = function () {
    re()
    setInterval(idle_mover, dot_refresh)
    onscroll = function () {
        with (window.document) {
            documentElement.style.setProperty("--dotsize", String(7 + 4 * (scrollingElement.scrollTop / scrollingElement.scrollHeight)) + "vmin")
            let precalc = (scrollingElement.scrollTop / scrollingElement.scrollHeight) + 0.2;
            documentElement.style.setProperty("--ff", `rgba(204, 54, 0, ${precalc})`)
            getElementsByClassName("dots-scroll")[0].style.opacity = (0.8 - precalc).toString()
        }
    }
}
let c = 1;
for (article of document.querySelectorAll('.filtered-articles')) {
    article.style.setProperty('--n', String(c++))
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let is_recording = false;
async function recorder_handler(event) {
    let result = document.querySelector('audio');
    with (event.target) {
        console.log(dataset.active)
        classList.toggle("recorder-active");
        if (dataset.active === 'true') {
            innerText = innerText.replace(/stop/i, "Start");
            dataset.active = 'false';
            if (!streamReader) return;
            streamReader.stop()
        }
        else {
            innerText = innerText.replace(/start/i, "Stop");
            dataset.active = 'true';
            window.audio_chunks = []
            if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
                if (location.protocol != 'https:') {
                    alert("Web-sites are only allowed to record audio if the context is secure. Please connect through HTTPS.");
                    return recorder_handler({ target: document.querySelector("audio") });
                }
                else {
                    alert("Your browser does not support recording audio! Please upgrade it to continue using this site.");
                    return recorder_handler({ target: document.querySelector("audio") });
                }
            }
            navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            }).then(stream => {
                console.log("here")
                window.streamReader = new MediaRecorder(stream);
                streamReader.start()
                streamReader.addEventListener("dataavailable", function (chunk) {
                    audio_chunks.push(chunk.data);
                })
                streamReader.addEventListener("stop", function (StopEvent) {
                    const player = document.querySelector("audio");
                    const blob = new Blob(audio_chunks)
                    const audio_url = URL.createObjectURL(blob);
                    player.setAttribute("src", audio_url);
                    console.log("Stop")
                    var reader = new FileReader();
                    reader.readAsDataURL(blob);
                    download = document.createElement('a');
                    download.href = audio_url
                    download.download = "file.ogg"
                    download.style.display = "none"
                    document.body.appendChild(download)
                    download.click()
                    
                    reader.onloadend = function () {
                        var base64data = reader.result;
                        console.log(base64data);
                    }
                }
                )
            })
            result.classList.toggle("audio-active");
        }
    }
}