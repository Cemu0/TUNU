import {
  GestureRecognizer,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

export class SLRdetect {
  constructor() {
      this.gestureRecognizer = null;
      this.runningMode = 'VIDEO';
      this.enableWebcamButton = null;
      this.webcamRunning = false;
      this.stream = null;
      this.video = null;
      this.gestureOutput = null;
      this.lastVideoTime = -1;
      this.results = undefined;
      this.enableCam = this.enableCam.bind(this);
      this.predictWebcam = this.predictWebcam.bind(this);
      this.callback = null;
      this.lastCharacter = null;
      this.confidence = 0;
      this.confidenceThreshold = 10;
  }

  async init(callback) {
    await this.createGestureRecognizer();
    if (this.hasGetUserMedia()) {
      this.enableWebcamButton = document.getElementById('webcamButton');
      this.enableWebcamButton.addEventListener('click', this.enableCam);
    } else {
      console.warn('getUserMedia() is not supported by your browser');
    }
    this.callback = callback;
  }

  async createGestureRecognizer() {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
    );
    this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: './model/sign_language_recognizer.task',
        delegate: 'GPU'
      },
      runningMode: this.runningMode
    });
  }

  hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  enableCam(event) {
    this.video = document.getElementById('webcam');
    this.gestureOutput = document.getElementById('gesture_output');

    if (!this.gestureRecognizer) {
      alert('Please wait for gestureRecognizer to load');
      return;
    }

    if (this.webcamRunning === true) {
      this.webcamRunning = false;
      this.enableWebcamButton.innerText = 'ENABLE PREDICTIONS';
      this.video.srcObject.getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    } else {
      this.webcamRunning = true;
      this.enableWebcamButton.innerText = 'DISABLE PREDICTIONS';
    }

    const constraints = {
      video: true
    };

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      this.video.srcObject = stream;
      this.video.addEventListener('loadeddata', this.predictWebcam);
    });
  }

  async predictWebcam() {
    const webcamElement = document.getElementById('webcam');
    let nowInMs = Date.now();
    if (this.video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.video.currentTime;
      this.results = this.gestureRecognizer.recognizeForVideo(this.video, nowInMs);
    }

    if (this.results.gestures.length > 0) {
      const categoryName = this.results.gestures[0][0].categoryName;
      const categoryScore = parseFloat(this.results.gestures[0][0].score * 100).toFixed(2);
      const handedness = this.results.handednesses[0][0].displayName;
      this.gestureOutput.style.display = 'block';
      this.gestureOutput.innerText = `Ký hiệu của bạn: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;

      if (categoryName !== '') {
        if (this.lastCharacter !== categoryName) {
          this.lastCharacter = categoryName;
          this.confidence = 0;
        } else {
          this.confidence += 1;
          if (this.confidence === this.confidenceThreshold) {
            console.log("detected ", categoryName);
            if (this.callback) {
              this.callback(categoryName);
            }
          }
        }
      }
    } else {
      this.gestureOutput.style.display = 'none';
    }

    if (this.webcamRunning === true) {
      window.requestAnimationFrame(this.predictWebcam);
    }
  }
}
