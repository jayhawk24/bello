"use client";

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface QRScannerProps {
    onResult: (result: string) => void;
    onError: (error: string) => void;
    width?: number;
    height?: number;
}

export default function QRScanner({ onResult, onError, width = 300, height = 300 }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const codeReader = useRef<BrowserMultiFormatReader | null>(null);
    const isStoppingRef = useRef(false);

    useEffect(() => {
        startScanning();
        return () => {
            isStoppingRef.current = true;
            stopScanning();
        };
    }, []);

    const startScanning = async () => {
        try {
            setIsScanning(true);

            // Initialize the code reader
            codeReader.current = new BrowserMultiFormatReader();

            // Get video stream
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera if available
                    width: { ideal: width },
                    height: { ideal: height }
                }
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;

                // Start decoding from video stream
                codeReader.current.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
                    if (isStoppingRef.current) return; // Don't process results if stopping

                    if (result) {
                        onResult(result.getText());
                        stopScanning();
                    }
                    if (err && err.name !== 'NotFoundException') {
                        console.error('QR Scanner error:', err);
                    }
                });
            }
        } catch (error: any) {
            console.error('Error starting QR scanner:', error);
            let errorMessage = 'Failed to access camera. ';

            if (error.name === 'NotAllowedError') {
                errorMessage += 'Camera access was denied. Please allow camera access and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found on this device.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage += 'Camera is not supported on this device.';
            } else {
                errorMessage += 'Please check your camera settings and try again.';
            }

            onError(errorMessage);
            setIsScanning(false);
        }
    };

    const stopScanning = () => {
        isStoppingRef.current = true;
        setIsScanning(false);

        // Stop the code reader first
        if (codeReader.current) {
            try {
                codeReader.current.reset();
            } catch (error) {
                console.log('Error resetting code reader:', error);
            }
            codeReader.current = null;
        }

        // Stop the video stream immediately
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            setStream(null);
        }

        // Clear video element immediately
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.pause();
            videoRef.current.load(); // Force reload to clear the video
        }
    };

    return (
        <div className="relative w-full">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    width: '100%',
                    height: `${height}px`,
                    objectFit: 'cover',
                    borderRadius: '8px'
                }}
                className="bg-black"
            />

            {/* Status indicator */}
            {isScanning && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    Scanning...
                </div>
            )}
        </div>
    );
}
