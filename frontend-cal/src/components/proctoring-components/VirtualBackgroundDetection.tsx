import React, { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as tflite from "@tensorflow/tfjs-tflite";

tflite.setWasmPath(
  "http://localhost:3000/node_modules/@tensorflow/tfjs-tflite/dist/"
);

interface PixelValue extends Array<number> {}
interface ImageChannel extends Array<Array<number>> {}
interface ImageFrame extends Array<ImageChannel> {}
interface CoOccurrenceMatrix extends Array<Array<number>> {}

const VirtualBackgroundDetection = () => {
  const [model, setModel] = useState<tflite.TFLiteModel | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [background, setBackground] = useState<string | null>(null);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  function captureFrame(video: HTMLVideoElement): ImageFrame {
    if (!ctx) {
      console.error("Canvas context is not available.");
      return []; // Return an empty frame or handle error appropriately
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the frame's pixel data
    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Convert to 2D array (height x width) of RGB pixels
    const frame: ImageFrame = [];
    for (let i = 0; i < canvas.height; i++) {
      const row: ImageChannel = [];
      for (let j = 0; j < canvas.width; j++) {
        const index = (i * canvas.width + j) * 4; // RGBA data
        const red = frameData[index];
        const green = frameData[index + 1];
        const blue = frameData[index + 2];
        row.push([red, green, blue]); // Store RGB values
      }
      frame.push(row);
    }
    return frame;
  }

  function intraChannelCooccurrence(channel: ImageChannel): CoOccurrenceMatrix {
    const maxVal = 256; // Fixed max pixel value range
    const coMatrix: CoOccurrenceMatrix = Array.from({ length: maxVal }, () =>
      Array(maxVal).fill(0)
    );
    const height = channel.length;
    if (height === 0) return coMatrix; // Handle empty channel
    const width = channel[0].length;
    if (width === 0) return coMatrix; // Handle empty channel row

    // Offset (1, 1): Compare diagonally neighboring pixels
    for (let i = 0; i < height - 1; i++) {
      // Avoid bottom edge
      for (let j = 0; j < width - 1; j++) {
        // Avoid right edge
        const pixel1 = channel[i][j];
        const pixel2 = channel[i + 1][j + 1];
        // Ensure pixel values are within bounds
        if (pixel1 >= 0 && pixel1 < maxVal && pixel2 >= 0 && pixel2 < maxVal) {
            coMatrix[pixel1][pixel2]++;
        } else {
            // console.warn(`Pixel value out of bounds: p1=${pixel1}, p2=${pixel2}`);
        }
      }
    }

    return coMatrix;
  }

  function interChannelCooccurrence(
    channel1: ImageChannel,
    channel2: ImageChannel
  ): CoOccurrenceMatrix {
    if (
      channel1.length !== channel2.length ||
      channel1[0].length !== channel2[0].length
    ) {
      throw new Error("Both channels must have the same dimensions.");
    }

    const maxVal = 256; // Fixed max pixel value range
    const coMatrix: CoOccurrenceMatrix = Array.from({ length: maxVal }, () =>
      Array(maxVal).fill(0)
    );
    const height = channel1.length;
    if (height === 0) return coMatrix;
    const width = channel1[0].length;
    if (width === 0) return coMatrix;

    // Offset (0, 0): Compare pixel values at the same spatial location
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const pixel1 = channel1[i][j];
        const pixel2 = channel2[i][j];
         // Ensure pixel values are within bounds
        if (pixel1 >= 0 && pixel1 < maxVal && pixel2 >= 0 && pixel2 < maxVal) {
            coMatrix[pixel1][pixel2]++;
        } else {
            // console.warn(`Pixel value out of bounds: p1=${pixel1}, p2=${pixel2}`);
        }
      }
    }

    return coMatrix;
  }

  function getSixCoMat(frame: ImageFrame): Array<CoOccurrenceMatrix> {
    // Assuming `frame` is a 2D or 3D array representing an image in BGR format

    // Separate the B, G, R channels
    const [redChannel, greenChannel, blueChannel] = splitChannels(frame);

    // Initialize the list to hold the 6 matrices
    const sixCoMat: Array<CoOccurrenceMatrix> = [];

    // Intra-Channel Co-occurrence Matrices (Diagonal Offset (1, 1))
    sixCoMat.push(intraChannelCooccurrence(redChannel)); // Red-Red
    sixCoMat.push(intraChannelCooccurrence(greenChannel)); // Green-Green
    sixCoMat.push(intraChannelCooccurrence(blueChannel)); // Blue-Blue

    // Inter-Channel Co-occurrence Matrices (Same Location Offset (0, 0))
    sixCoMat.push(interChannelCooccurrence(redChannel, greenChannel)); // Red-Green
    sixCoMat.push(interChannelCooccurrence(redChannel, blueChannel)); // Red-Blue
    sixCoMat.push(interChannelCooccurrence(greenChannel, blueChannel)); // Green-Blue

    return sixCoMat;
  }

  function splitChannels(frame: ImageFrame): [ImageChannel, ImageChannel, ImageChannel] {
    const height = frame.length;
    if (height === 0) return [[], [], []];
    const width = frame[0].length;
    if (width === 0) return [[], [], []];

    const redChannel: ImageChannel = Array.from({ length: height }, () =>
      Array(width).fill(0)
    );
    const greenChannel: ImageChannel = Array.from({ length: height }, () =>
      Array(width).fill(0)
    );
    const blueChannel: ImageChannel = Array.from({ length: height }, () =>
      Array(width).fill(0)
    );

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const pixel = frame[i][j] as PixelValue; // Type assertion
        if (pixel && pixel.length === 3) {
            const [red, green, blue] = pixel; // RGB order
            redChannel[i][j] = red;
            greenChannel[i][j] = green;
            blueChannel[i][j] = blue;
        } else {
            // console.warn(`Invalid pixel data at [${i}][${j}]:`, pixel);
        }
      }
    }

    return [redChannel, greenChannel, blueChannel];
  }

  useEffect(() => {
    const loadModel = async () => {
      try {
        // Load the TensorFlow Lite model
        console.log("Attempting to load TFLite model...");
        const tfliteModel = await tflite.loadTFLiteModel(
          "src/models/model.tflite"
        );
        setModel(tfliteModel);
        console.log("TFLite model loaded successfully!");
      } catch (error) {
        console.error("Error loading the TFLite model:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
      }
    };

    const startWebcam = async () => {
      const video = videoRef.current;
      if (video && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                console.log("Webcam started and playing.");
            };
        } catch (err) {
            console.error("Error starting webcam: ", err);
        }
      }
    };

    loadModel();
    startWebcam();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const runInference = async () => {
      if (!model) {
        // console.error("Model not loaded yet!"); // Reduced log frequency
        return;
      }
      if (video.readyState === 4 && video.videoWidth > 0 && video.videoHeight > 0) { // Ensure video is ready and has dimensions
        try {
            const frame = captureFrame(video);
            if (frame.length === 0) return; // Skip if frame capture failed

            const feats = getSixCoMat(frame);
            const features = [feats]; // Batch dimension
            const inputTensor = tf.tensor(features, [1, 6, 256, 256], 'float32'); 

            const outputTensor = model.predict(inputTensor) as tf.Tensor;

            // Process the output
            const outputData = outputTensor.arraySync() as number[][];
            if (outputData && outputData[0]) {
                if (outputData[0][0] > outputData[0][1]) {
                    setBackground("Virtual");
                } else {
                    setBackground("Real");
                }
            } else {
                console.warn("Output data is not in the expected format.");
            }

            // Clean up
            inputTensor.dispose();
            outputTensor.dispose();
        } catch (error) {
            console.error("Error during inference:", error);
        }
      }
    };

    const intervalId = setInterval(runInference, 5000); // Run every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [model]); // videoRef.current is stable, model is the dependency

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} playsInline autoPlay muted />
      <h4>Background: {background !== null ? background : "Detecting..."}</h4>
    </div>
  );
};

export default VirtualBackgroundDetection;
