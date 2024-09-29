import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs';

let faceModel;
let phoneModel;
let navigate;

let lookingAwayDuration = 0;
let phoneDetectedDuration = 0;
let extraPersonDetectedDuration = 0;
let lookingAwayWarnings = 0; // New variable for looking away warnings
let isDisqualified = false; // New variable to track disqualification
const LOOKING_AWAY_THRESHOLD = 5; // 5 seconds
const PHONE_DETECTED_THRESHOLD = 3; // 3 seconds
const EXTRA_PERSON_THRESHOLD = 3; // 3 seconds
let lastDetectionTime = 0; // Timestamp for last detection

export const setupWebcam = async (videoElement) => {
    return new Promise((resolve, reject) => {
        const constraints = { video: true };
        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                videoElement.srcObject = stream;
                videoElement.addEventListener('loadeddata', resolve);
            })
            .catch((error) => {
                console.error('Error accessing webcam: ', error);
                reject(error);
            });
    });
};

export const detectObjects = async (videoElement, setStatus) => {
    if (isDisqualified) return; // Skip detection if disqualified

    const predictions = await phoneModel.detect(videoElement);
    let phoneDetected = false;

    predictions.forEach(prediction => {
        if (prediction.class === 'cell phone' && prediction.score > 0.5) {
            phoneDetected = true;
        }
    });

    if (phoneDetected) {
        phoneDetectedDuration += 1; // Increment duration for phone detected
        if (phoneDetectedDuration > PHONE_DETECTED_THRESHOLD) {
            // alert('Disqualified! Mobile phone detected for more than 3 seconds.');
            // isDisqualified = true; // Set disqualified state
            navigate('/disqualified', { state: { reason: 'Disqualified! Mobile phone detected for more than 3 seconds.'}});
            resetDetection();
            return;
        }
    } else {
        phoneDetectedDuration = 0; // Reset duration if phone not detected
    }
};

export const detectFace = async (videoElement, setStatus) => {
    if (isDisqualified) return; // Skip detection if disqualified

    try {
        const predictions = await faceModel.estimateFaces(videoElement, false);

        if (predictions.length > 0) {
            const leftEye = predictions[0].landmarks[0];
            const rightEye = predictions[0].landmarks[1];
            const nose = predictions[0].landmarks[2];

            const averageEyeX = (leftEye[0] + rightEye[0]) / 2;
            const noseX = nose[0];
            const lookingAwayThreshold = 20;

            const isLookingAway = Math.abs(noseX - averageEyeX) > lookingAwayThreshold;

            if (isLookingAway) {
                lookingAwayDuration += 1; // Increment duration for looking away
                console.log("LookingAwayDuration: ", lookingAwayDuration);
                setStatus('Warning: You are looking away!'); // Update status for looking away
                
                if (lookingAwayDuration >= LOOKING_AWAY_THRESHOLD) {
                    // Only increment warning if duration is greater than the threshold
                    if (lookingAwayWarnings < 3) { // Increment only if less than 3 warnings
                        lookingAwayWarnings += 1; // Increment warning count
                        console.log("LookingAwayWarning: ", lookingAwayWarnings);
                        alert(`Warning ${lookingAwayWarnings}: You are looking away!`); // Give a warning
                        
                        // Reset lookingAwayDuration after giving a warning
                        lookingAwayDuration = 0; // Reset duration after warning
                    }

                    if (lookingAwayWarnings >= 3) {
                        //alert('Disqualified! You have been warned for looking away too many times.');
                        navigate('/disqualified', { state: { reason: 'Disqualified! You have been warned for looking away too many times.'}})
                        isDisqualified = true; // Set disqualified state
                        resetDetection();
                        return;
                    }
                }
            } else {
                // Reset duration only if the user is looking at the screen
                lookingAwayDuration = 0; // Reset duration if looking at the screen
                setStatus('You are looking at the screen.'); // Update status for looking at the screen
            }
        } else {
            setStatus('No face detected.'); // Update status if no face detected
            extraPersonDetectedDuration = 0; // Reset if no face detected
        }

        // Check for extra person detection
        if (predictions.length > 1) {
            extraPersonDetectedDuration += 1; // Increment duration for extra person detected
            if (extraPersonDetectedDuration > EXTRA_PERSON_THRESHOLD) {
                //alert('Disqualified! Another person detected for more than 3 seconds.');
                navigate('/disqualified', { state: { reason: 'Disqualified! Another person detected for more than 3 seconds.' } });
                isDisqualified = true; // Set disqualified state
                resetDetection();
                return;
            }
        } else {
            extraPersonDetectedDuration = 0; // Reset duration if no extra person detected
        }
    } catch (error) {
        console.error('Error detecting face:', error);
    }
};

const resetDetection = () => {
    lookingAwayDuration = 0;
    phoneDetectedDuration = 0;
    extraPersonDetectedDuration = 0;
    lookingAwayWarnings = 0; // Reset warnings
};

export const startDetectionLoop = (videoElement, setStatus) => {
    const loop = async () => {
        const currentTime = Date.now();
        if (currentTime - lastDetectionTime >= 1000) { // Check if 1 second has passed
            lastDetectionTime = currentTime; // Update last detection time
            await detectFace(videoElement, setStatus);
            await detectObjects(videoElement, setStatus);
        }
        requestAnimationFrame(loop); // Call the loop again for continuous detection
    };

    loop(); // Start the loop
};

export const initDetection = async (videoElement, setStatus, navigateFucntion) => {
    navigate = navigateFucntion;
    try {
        await setupWebcam(videoElement);
        setStatus('Webcam loaded, loading models...'); // Update status after initializing

        // Load the models
        faceModel = await blazeface.load();
        phoneModel = await cocoSsd.load();

        setStatus('Models loaded, detecting...'); // Update status after loading models
        startDetectionLoop(videoElement, setStatus); // Start the continuous detection loop
    } catch (error) {
        setStatus('Error initializing application.');
        console.error('Error initializing face detection:', error);
    }
};
