commonFunction.js

/*Loading Background Image on the Stage*/
function bgImageLoader(obj) {
    var bgImage = new Image();
    bgImage.src = obj.src;
    var bgImageA = new Konva.Image({
        image: bgImage,
        width: stage.width(),
        height: stage.height(),
    });
    return bgImageA;
}

function startImage() {
    var startImage = new Image();
    startImage.src =
        "https://vdo3.freckled.ai/IOAC_Assets/ioc/support_Files/playIcon.png";
    var startImageA = new Konva.Image({
        image: startImage,
        width: stage.width(),
        height: stage.height(),
    });
    return startImageA;
}

/*Computing dimensions for all the images rationally*/
function computeDimension(width, height) {
    var w = stage.width() / (961 / width);
    var h = stage.height() / (540 / height);
    return [w, h];
}

/*Will be called during end of the game*/
function gameEnd() {
    var layer2 = new Konva.Layer();
    setTimeout(() => {
        var pos = computeDimension(220, 200);
        var text = computeDimension(35, 0);
        var Text = new Konva.Text({
            x: pos[0],
            y: pos[1],
            text: "Congratulations",
            fontSize: text[0],
            fontFamily: "Calibri",
            fill: "#555",
            align: "center",
        });
        layer2.add(Text);

        Text.scale({ x: 0, y: 0 });
        Text.opacity(0);

        const animationFn = new Konva.Animation((frame) => {
            const scale = frame.time / 1000;
            const opacity = frame.time / 1000;

            Text.scale({ x: scale, y: scale });
            Text.opacity(opacity);

            Text.position({
                x: pos[0],
                y: pos[1],
            });

            layer2.draw();

            if (frame.time >= 2000) {
                animationFn.stop();
            }
        });
        animationFn.start();

        var duration = 4 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function () {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
            confetti(
                Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                })
            );
            confetti(
                Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                })
            );
        }, 250);
    }, 500);
    setTimeout(() => {
        layer2.destroyChildren();
    }, 6000);
    stage.add(layer2);
}
let mediaRecorder;
let audioChunks = [];
let audioData;

/*Used for starting the recording*/
function startRecording() {
    let stream = null;
    stream = navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (stream) {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
        });
}

/*Used for stopping the recording*/
function stopRecording() {
    return new Promise((resolve, reject) => {
        audioChunks = [];
        var base64data = "";
        mediaRecorder.stop();
        const tracks = mediaRecorder.stream.getTracks();
        tracks.forEach((track) => track.stop());
        mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        };
        mediaRecorder.onstop = (e) => {
            const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                base64data = reader.result;
                resolve(base64data);
            };
        };
    });
}

var videoNode;
/*Used for starting the video recording */
function startRecordingVideo(obj) {
    let stream = null;
    stream = navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(function (stream) {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            var anim = new Konva.Animation(function () { }, layer);
            var videoPreview = document.createElement("video");
            videoPreview.muted = true;
            videoPreview.setAttribute("autoplay", true);
            videoPreview.srcObject = stream;
            videoPreview.addEventListener("loadedmetadata", function () {
                var xy = computeDimension(obj.x, obj.y);
                var wh = computeDimension(obj.width, obj.height);
                videoNode = new Konva.Image({
                    image: videoPreview,
                    x: xy[0],
                    y: xy[1],
                    width: wh[0],
                    height: wh[1],
                });
                layer.add(videoNode);
                stage.draw();
                videoNode.scaleX(-1);
                videoNode.x(videoNode.x() + videoNode.width());
            });
            videoPreview.onloadedmetadata = function (e) {
                videoPreview.play();
                anim.start();
            };
        });
}

/*Used for stopping the video recording*/
function stopRecordingVideo() {
    videoNode.remove();
    return new Promise((resolve, reject) => {
        audioChunks = [];
        var base64data = "";
        mediaRecorder.stop();
        const tracks = mediaRecorder.stream.getTracks();
        tracks.forEach((track) => track.stop());
        mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        };
        mediaRecorder.onstop = (e) => {
            const audioBlob = new Blob(audioChunks, { type: "video/webm" });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                base64data = reader.result;
                resolve(base64data);
            };
        };
    });
}

/*Used for submitting the recorded obj to backend*/
function submitRecording(gameJson, recordingObj, assetAry = []) {
    const assetsObj = {
        assetList: assetAry,
        type: recordingObj?.type,
        audioSrc: recordingObj?.audioSrc,
        recordingId: recordingObj?.recordingId,
        gameJson: gameJson,
    };
    window.parent.postMessage({ recordedObj: assetsObj }, "*");
}

/*Used for submitting the game*/
function gameSubmit(json) {
    window.parent.postMessage({ dataObj: json }, "*");
}

/*Used for playing the audio*/
function audioPlay(src, isRecorded) {
    var audio = document.createElement("audio");
    audio.src = src;
    if (!isRecorded) {
        //if it is problem audio, this will be applied
        audio.playbackRate = 0.75;
    }
    return audio;
}

var icons = [
    { x: 20, y: 30, width: 260, height: 60, opacity: 1, imageUrl: 'https://vdo3.freckled.ai/IOAC_Assets/ioc/konvaAssets/audioPlayer/audioPlayer.png', name: 'audioPlayer' },
    { x: 230, y: 42, width: 37, height: 35, opacity: 1, imageUrl: 'https://vdo3.freckled.ai/IOAC_Assets/ioc/konvaAssets/audioPlayer/mute.png', name: 'mute' },
    { x: 33, y: 42, width: 33, height: 35, opacity: 1, imageUrl: 'https://vdo3.freckled.ai/IOAC_Assets/ioc/konvaAssets/audioPlayer/playBtn.png', name: 'play' },
    { x: 230, y: 42, width: 37, height: 35, opacity: 0, imageUrl: 'https://vdo3.freckled.ai/IOAC_Assets/ioc/konvaAssets/audioPlayer/unMute.png', name: 'unmute' },
    { x: 33, y: 42, width: 33, height: 35, opacity: 0, imageUrl: 'https://vdo3.freckled.ai/IOAC_Assets/ioc/konvaAssets/audioPlayer/pause.png', name: 'pause' }
];


let audio;
function updateAudioPlayer(AudioSrc, audioPlayerX, audioPlayerY) {
    var groupXY = computeDimension(audioPlayerX, audioPlayerY);
    var player = []
    var group = new Konva.Group({
        x: groupXY[0],
        y: groupXY[1],
    });

    audio = new Audio();
    audio.src = AudioSrc;
    audio.addEventListener('loadedmetadata', function () {
        icons.forEach((icon, i) => {
            let image = new Image();
            image.src = icon.imageUrl;
            var xy = computeDimension(icon.x, icon.y)
            var wh = computeDimension(icon.width, icon.height)
            let img = new Konva.Image({
                x: xy[0],
                y: xy[1],
                image: image,
                width: wh[0],
                height: wh[1],
                opacity: icon.opacity,
                name: icon.name,
                listening: icon.opacity,
            });
            if (i === 0) {
                img.shadowColor("black");
                img.shadowBlur(5);
            }
            group.add(img);
            player.push(img);

            img.on('click tap', () => {
                switch (img.name()) {
                    case 'play':
                        img.opacity(0);
                        player.find(ele => ele.name() === 'pause').opacity(1);
                        player.find(ele => ele.name() === 'play').listening(false);
                        player.find(ele => ele.name() === 'pause').listening(true);
                        audio.play();
                        break;
                    case 'pause':
                        img.opacity(0);
                        player.find(ele => ele.name() === 'play').opacity(1);
                        player.find(ele => ele.name() === 'play').listening(true);
                        player.find(ele => ele.name() === 'pause').listening(false);
                        audio.pause();
                        break;
                    case 'mute':
                        img.opacity(0);
                        player.find(ele => ele.name() === 'mute').opacity(0);
                        player.find(ele => ele.name() === 'unmute').opacity(1);
                        player.find(ele => ele.name() === 'mute').listening(0);
                        player.find(ele => ele.name() === 'unmute').listening(1);
                        audio.muted = true;
                        break;
                    case 'unmute':
                        img.opacity(0);
                        player.find(ele => ele.name() === 'unmute').opacity(0);
                        player.find(ele => ele.name() === 'mute').opacity(1);
                        player.find(ele => ele.name() === 'unmute').listening(0);
                        player.find(ele => ele.name() === 'mute').listening(1);
                        audio.muted = false;

                        break;
                    default:
                        break;
                }
            });

        });
        audio.addEventListener('playing', () => {
            player.find(ele => ele.name() === 'pause').opacity(1);
            player.find(ele => ele.name() === 'play').listening(false);
            player.find(ele => ele.name() === 'pause').listening(true);
        })
        audio.addEventListener('pause', function () {
            player.find(ele => ele.name() === 'pause').opacity(0);
            player.find(ele => ele.name() === 'play').opacity(1);
            player.find(ele => ele.name() === 'play').listening(true);
            player.find(ele => ele.name() === 'pause').listening(false);
        });
        var leftSecXY = computeDimension(207, 55);
        var fSize = computeDimension(10, 0);
        var audioDuration = new Konva.Text({
            x: leftSecXY[0],
            y: leftSecXY[1],
            text: '00:00',
            fontSize: fSize[0],
            fontFamily: 'Calibri',
            fill: 'black',
        });
        var rigthtSecXY = computeDimension(70, 55);
        var currentDuration = new Konva.Text({
            x: rigthtSecXY[0],
            y: rigthtSecXY[1],
            text: '00:00',
            fontSize: fSize[0],
            fontFamily: 'Calibri',
            fill: 'black',
        });
        group.add(audioDuration, currentDuration);
        var ponits = [100, 60, 200, 60];
        var newPoints = [];
        ponits.map((e, i) => {
            if (i % 2 === 0) {
                var diffX = computeDimension(e, '');
                newPoints.push(diffX[0]);
            } else {
                var diffY = computeDimension('', e);
                newPoints.push(diffY[1]);
            }
        })
        var lineStr = computeDimension(2, 0)
        var line = new Konva.Line({
            points: newPoints,
            stroke: 'black',
            strokeWidth: lineStr[0],
        });
        group.add(line);

        var circleXY = computeDimension(100, 60);
        var cirRad = computeDimension(4, 0);
        var circle = new Konva.Circle({
            x: circleXY[0],
            y: circleXY[1],
            radius: cirRad[0],
            fill: '#f37335',
            draggable: true
        });
        group.add(circle);

        const totalSeconds = Math.round(audio.duration);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        audioDuration.text(formattedDuration);
        audio.addEventListener('timeupdate', function () {
            let totalSeconds2 = Math.round(audio.currentTime);
            let minutes2 = Math.floor(totalSeconds2 / 60);
            let seconds2 = totalSeconds2 % 60;

            let formattedDuration2 = `${minutes2}:${seconds2 < 10 ? '0' : ''}${seconds2}`;
            currentDuration.text(formattedDuration2);
            var newPos = (audio.currentTime / audio.duration) * (200 - 100) + 100;
            var updatedX = computeDimension(newPos, 0);
            circle.x(updatedX[0]);
            // console.log(audio.currentTime, audio.duration, '----------------------->');
            if (audio.currentTime === audio.duration) {
                const pause = player.find(ele => ele.name() === 'pause');
                const play = player.find(ele => ele.name() === 'play');
                play.opacity(1);
                pause.opacity(0);
                play.listening(true);
                pause.listening(false);
                circle.x(circleXY[0]);
                currentDuration.text('00:00');
            }
            layer.batchDraw();
        });

        circle.on('dragmove touchmove', function () {
            circle.y(circleXY[1]);
            var pos = circle.x();
            if (pos >= newPoints[0] && pos <= newPoints[2]) {
                var seekTime = (pos - 100) / (200 - 100) * audio.duration;
                audio.currentTime = seekTime;
                circle.on('dragend', () => {
                    player.find(ele => ele.name() === 'play').opacity(0);
                    player.find(ele => ele.name() === 'pause').opacity(1);
                    player.find(ele => ele.name() === 'play').listening(false);
                    player.find(ele => ele.name() === 'pause').listening(true);
                    audio.play();
                })
            }
            else {
                circle.x(circleXY[0])
            }
        });
    });


    return [group, audio];
}

setInterval(() => {
    // every 5 seconds the updated json get's posted in the portal.
    if (gameObj !== undefined && gameObj?.opertation !== 'GameStart') {
        window.parent.postMessage({ dataObj: gameObj }, "*");
    }
}, 5000);
