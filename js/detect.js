import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

export class SLRdetect {
  constructor() {
      this.gestureRecognizer = null;
      this.runningMode = 'VIDEO';
      this.enableWebcamButton = null;
      this.webcamRunning = false;
      this.stream = null;
      this.videoHeight = '360px';
      this.videoWidth = '480px';
      this.video = null; //document.getElementById('webcam');
      this.canvasElement = null; //document.getElementById('output_canvas');
      this.canvasCtx = null; //this.canvasElement.getContext('2d');
      this.gestureOutput = null; //document.getElementById('gesture_output');
      this.lastVideoTime = -1;
      this.results = undefined;
      this.enableCam = this.enableCam.bind(this);
      this.predictWebcam = this.predictWebcam.bind(this);
      this.callback = null
      this.lastCharacter = null
      this.confidence = 0
      this.confidenceThreshold = 10
      this.debug = false
  }

  async init(callback) {
    await this.createGestureRecognizer()
    // If webcam supported, add event listener to button for when user wants to activate it.
    if (this.hasGetUserMedia()) {
      this.enableWebcamButton = document.getElementById('webcamButton')
      this.enableWebcamButton.addEventListener('click', this.enableCam)
    } else {
      console.warn('getUserMedia() enableCamis not supported by your browser')
    }
    this.callback = callback;
  }

  // Before we can use HandLandmarker class we must wait for it to finish
  // loading. Machine Learning models can be large and take a moment to
  // get everything needed to run.
  async createGestureRecognizer() {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
    )
    this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          '/model/sign_language_recognizer.task',
        delegate: 'GPU'
      },
      runningMode: this.runningMode
    })
    // demosSection.classList.remove('invisible')
  }
  // Check if webcam access is supported.
  hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }
  // Enable the live webcam view and start detection.
  enableCam(event) {
    //TODO: make this less dump
    this.video = document.getElementById('webcam');
    this.canvasElement = document.getElementById('output_canvas');
    this.canvasCtx = this.canvasElement.getContext('2d');
    this.gestureOutput = document.getElementById('gesture_output');

    if (!this.gestureRecognizer) {
      alert('Please wait for gestureRecognizer to load')
      return
    }

    if (this.webcamRunning === true) {
      this.webcamRunning = false
      this.enableWebcamButton.innerText = 'ENABLE PREDICTIONS'
      //disable webcam access
      this.video.srcObject.getTracks().forEach(function(track) {
        track.stop();
      });
      video.srcObject = null;
    } else {
      this.webcamRunning = true
      this.enableWebcamButton.innerText = 'DISABLE PREDICTIONS'
    }

    // getUsermedia parameters.
    const constraints = {
      video: true
    }

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      if (!this.debug){
        this.video.style.display = 'none'
      }
      
      this.video.srcObject = stream;
      this.video.addEventListener('loadeddata', this.predictWebcam);

    });    
  }
  async predictWebcam() {
    const webcamElement = document.getElementById('webcam')
    // Now let's start detecting the stream.
    let nowInMs = Date.now()
    if (this.video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.video.currentTime
      this.results = this.gestureRecognizer.recognizeForVideo(this.video, nowInMs)
    }
    // if (this.debug) {
      this.canvasCtx.save()
      this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height)
      const drawingUtils = new DrawingUtils(this.canvasCtx)

      this.canvasElement.style.height = this.videoHeight
      webcamElement.style.height = this.videoHeight
      this.canvasElement.style.width = this.videoWidth
      webcamElement.style.width = this.videoWidth

      if (this.results.landmarks) {
        for (const landmarks of this.results.landmarks) {
          drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
            color: '#ffe802',
            lineWidth: 20
          })
          drawingUtils.drawLandmarks(landmarks, {
            color: '#ffe802',
            lineWidth: 10
          })
        }
      }
      this.canvasCtx.restore()
    // }

    if (this.results.gestures.length > 0) {
      const categoryName = this.results.gestures[0][0].categoryName
      const categoryScore = parseFloat(this.results.gestures[0][0].score * 100).toFixed(2)
      const handedness = this.results.handednesses[0][0].displayName
      this.gestureOutput.style.display = 'block'
      this.gestureOutput.style.width = this.videoWidth
      this.gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`  
      if(categoryName != ''){
        
        if (this.lastCharacter !== categoryName) {
          this.lastCharacter = categoryName
          this.confidence = 0
        }else{
          this.confidence +=1
          if(this.confidence == this.confidenceThreshold){
            console.log("detected ",categoryName)
            if (this.callback){
              this.callback(categoryName);
            }
          }
        }
      }
    } else {
      this.gestureOutput.style.display = 'none'
    }
    // Call this function again to keep predicting when the browser is ready.
    if (this.webcamRunning === true) {
      window.requestAnimationFrame(this.predictWebcam)
    }
  }
  
}
