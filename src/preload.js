const { desktopCapturer, remote} = require('electron');
const { writeFile } = require('fs');
const {dialog, Menu} = remote;

var mediaRecorder;
const videoBytes = []

const videoHTMLElement = document.querySelector('video')

const start = document.getElementById('startBtn')
start.onclick = (e) => {
    mediaRecorder.start();
    start.classList.add('is-danger')
    start.innerText = 'Now Recording!'
    stop.innerText = "Stop"
};

const stop = document.getElementById('stopBtn')

stop.onclick = (e) => {
    mediaRecorder.stop()
    start.classList.remove('is-danger')
    start.innerText = "Start"
};

const videoSelect = document.getElementById('videoSelectBtn')
videoSelect.onclick = getVideoSources;


async function getVideoSources()  {
    const input = await desktopCapturer.getSources({types: ['window', 'screen']})


    const videoOptions = Menu.buildFromTemplate(
    input.map(source => {
        return {
            label: source.name,
            click: () => selectSource(source)
        }
    })
);

videoOptions.popup();

}

const selectSource = async(source) => {
    videoSelect.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    videoHTMLElement.srcObject = stream;
    videoHTMLElement.play();

    const options = {mimeType: 'video/webm; codecs=vp8'};
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = handleAvailableData;
    mediaRecorder.onstop = handleStop;

}

const handleAvailableData = (e) => {
    videoBytes.push(e.data);
}

const handleStop = async(e) => {
    const blob = new Blob(videoBytes, {
        type: 'video/webm; codecs =vp8'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const {filePath} = await dialog.showSaveDialog({
        buttonLabel: 'Save Recorded Video',
        defaultPath: `vid-${Date.now()}.webm`
    })

    if(filePath) {
        writeFile(filePath, buffer, () => console.log("Video Saved!"))
    }
}