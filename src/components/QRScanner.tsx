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
            console.log('🎥 Starting QR scanner...');
            setIsScanning(true);
            isStoppingRef.current = false;

            // Initialize the code reader
            codeReader.current = new BrowserMultiFormatReader();
            console.log('📱 Code reader initialized');

            // Get video stream
            console.log('📷 Requesting camera access...');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera if available
                    width: { ideal: width },
                    height: { ideal: height }
                }
            });

            console.log('✅ Camera access granted');
            setStream(mediaStream);

            if (videoRef.current && !isStoppingRef.current) {
                videoRef.current.srcObject = mediaStream;
                console.log('📹 Video stream attached to video element');

                // Wait for video to be ready
                await new Promise<void>((resolve) => {
                    if (videoRef.current) {
                        videoRef.current.onloadedmetadata = () => {
                            console.log('🎬 Video metadata loaded');
                            if (videoRef.current) {
                                videoRef.current.play();
                                console.log('▶️ Video playback started');
                                resolve();
                            }
                        };
                    }
                });

                // Small delay to ensure video is stable
                console.log('⏳ Waiting for video to stabilize...');
                await new Promise(resolve => setTimeout(resolve, 500));

                if (!isStoppingRef.current && codeReader.current && videoRef.current) {
                    console.log('🔍 Starting QR code detection...');
                    
                    // Start decoding from video stream
                    codeReader.current.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
                        if (isStoppingRef.current) {
                            console.log('⏹️ QR Scanner stopped, ignoring result');
                            return; // Don't process results if stopping
                        }

                        if (result) {
                            console.log('✅ QR Code successfully detected!');
                            console.log('📋 QR Code content:', result.getText());
                            console.log('📊 QR Code format:', result.getBarcodeFormat());
                            onResult(result.getText());
                            stopScanning();
                        }
                        if (err) {
                            if (err.name === 'NotFoundException') {
                                // This is normal - just means no QR code is currently visible
                                // console.log('No QR code found in current frame');
                            } else {
                                console.log('❌ QR Scanner error:', err.name, err.message);
                            }
                        }
                    });
                    
                    console.log('🚀 QR code reader initialized and scanning...');
                }
            }
        } catch (error: any) {
            console.error('💥 Error starting QR scanner:', error);
            let errorMessage = 'Failed to access camera. ';

            if (error.name === 'NotAllowedError') {
                errorMessage += 'Camera access was denied. Please allow camera access and try again.';
                console.log('🚫 Camera access denied by user');
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found on this device.';
                console.log('📷 No camera found on device');
            } else if (error.name === 'NotSupportedError') {
                errorMessage += 'Camera is not supported on this device.';
                console.log('❌ Camera not supported on device');
            } else {
                errorMessage += 'Please check your camera settings and try again.';
                console.log('⚠️ Unknown camera error');
            }

            onError(errorMessage);
            setIsScanning(false);
        }
    };

    const stopScanning = () => {
        console.log('🛑 Stopping QR scanner...');
        isStoppingRef.current = true;
        setIsScanning(false);

        // Stop the code reader first
        if (codeReader.current) {
            try {
                console.log('🔄 Resetting code reader...');
                codeReader.current.reset();
                console.log('✅ Code reader reset successfully');
            } catch (error) {
                console.log('⚠️ Error resetting code reader:', error);
            }
            codeReader.current = null;
        }

        // Stop the video stream immediately
        if (stream) {
            console.log('📹 Stopping video stream...');
            stream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            setStream(null);
            console.log('✅ Video stream stopped');
        }

        // Clear video element immediately
        if (videoRef.current) {
            console.log('🎬 Clearing video element...');
            videoRef.current.srcObject = null;
            videoRef.current.pause();
            videoRef.current.load(); // Force reload to clear the video
            console.log('✅ Video element cleared');
        }
        
        console.log('🏁 QR scanner stopped completely');
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

            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-white border-opacity-50 rounded-lg" style={{ width: '60%', height: '60%' }}>
                    <div className="relative w-full h-full">
                        {/* Corner markers */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-yellow-400"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-yellow-400"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-yellow-400"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-yellow-400"></div>
                    </div>
                </div>
            </div>

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
