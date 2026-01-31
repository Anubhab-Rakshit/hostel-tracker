"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera, ExternalLink, Loader2, RefreshCw, AlertTriangle, Scan, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ScanInfo {
    hostel?: string;
    block?: string;
    floor?: string;
    room?: string;
    location?: string;
    description?: string;
    url?: string;
    code?: string;
}

const normalizeCode = (value: string) => {
    try {
        const url = new URL(value, window.location.origin);
        return url.toString();
    } catch {
        return value.trim();
    }
};

export function SciFiQrScanner() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const readerRef = useRef<BrowserMultiFormatReader | null>(null);
    const controlsRef = useRef<{ stop: () => void } | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [shouldScan, setShouldScan] = useState(false);
    const [scanInfo, setScanInfo] = useState<ScanInfo | null>(null);
    const [scanInfoLoading, setScanInfoLoading] = useState(false);
    const [scanSession, setScanSession] = useState(0);

    const isCameraSupported = isMounted && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isCameraSupported) return;
        const handleDeviceChange = () => {
            navigator.mediaDevices.enumerateDevices().then((allDevices) => {
                const videoDevices = allDevices.filter((device) => device.kind === "videoinput");
                setDevices(videoDevices);
                if (!selectedDeviceId && videoDevices.length > 0) {
                    setSelectedDeviceId(videoDevices[0].deviceId);
                }
            }).catch(() => undefined);
        };

        navigator.mediaDevices.addEventListener?.("devicechange", handleDeviceChange);
        let isMounted = true;
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const initDevices = async () => {
            try {
                const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
                tempStream.getTracks().forEach((track) => track.stop());
            } catch {
                if (!isMounted) return;
                setScanError("CAMERA_ACCESS_DENIED");
            }

            try {
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                if (!isMounted) return;
                const videoDevices = allDevices.filter((device) => device.kind === "videoinput");
                setDevices(videoDevices);
                if (videoDevices.length > 0) {
                    setSelectedDeviceId(videoDevices[0].deviceId);
                } else {
                    setScanError("NO_CAMERA_DETECTED");
                }
            } catch {
                if (!isMounted) return;
                setScanError("DEVICE_ENUMERATION_FAILED");
            }
        };

        initDevices();

        return () => {
            isMounted = false;
            controlsRef.current?.stop?.();
            controlsRef.current = null;
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            navigator.mediaDevices.removeEventListener?.("devicechange", handleDeviceChange);
        };
    }, [isCameraSupported]);

    useEffect(() => {
        if (!isCameraSupported || scanResult || !shouldScan) return;
        if (!videoRef.current) return;
        const reader = readerRef.current ?? new BrowserMultiFormatReader();
        readerRef.current = reader;

        setScanError(null);

        reader
            .decodeFromVideoDevice(selectedDeviceId || undefined, videoRef.current, (result, err) => {
                if (result) {
                    setScanResult(result.getText());
                    setIsScanning(false);
                    controlsRef.current?.stop?.();
                    controlsRef.current = null;
                    return;
                }
                if (err && !(err instanceof NotFoundException)) {
                    // Ignore frequent "not found" errors
                }
            })
            .then((controls) => {
                controlsRef.current = controls;
                setIsScanning(true);
            })
            .catch(() => {
                setScanError("INIT_FAILED");
                setIsScanning(false);
            });

        return () => {
            controlsRef.current?.stop?.();
            controlsRef.current = null;
            setIsScanning(false);
        };
    }, [isCameraSupported, selectedDeviceId, scanResult, scanSession, shouldScan]);

    const issueUrl = useMemo(() => {
        if (!scanResult || !isMounted) return null;
        try {
            const url = new URL(scanResult, window.location.origin);
            if (url.pathname === "/issues/new") return url.toString();
            return null;
        } catch {
            return null;
        }
    }, [scanResult]);

    const normalizedCode = useMemo(() => {
        if (!scanResult || !isMounted) return null;
        return normalizeCode(scanResult);
    }, [scanResult]);

    useEffect(() => {
        if (!normalizedCode) return;

        let active = true;
        const fetchScanInfo = async () => {
            setScanInfoLoading(true);
            try {
                const response = await fetch("/api/qr/scan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: normalizedCode, action: "view" }),
                });

                if (!response.ok) {
                    throw new Error("API Error");
                }

                const data = await response.json();
                if (active) {
                    setScanInfo(data.qr || null);
                }
            } catch (error) {
                if (active) {
                    setScanInfo(null);
                }
            } finally {
                if (active) {
                    setScanInfoLoading(false);
                }
            }
        };

        fetchScanInfo();
        return () => { active = false; };
    }, [normalizedCode]);

    const handleRescan = () => {
        setScanResult(null);
        setScanInfo(null);
        setShouldScan(true);
        setScanSession((prev) => prev + 1);
    };

    const handleStartScan = async () => {
        setScanError(null);
        setShouldScan(true);
        setScanSession((prev) => prev + 1);
    };

    const handleStopScan = () => {
        setShouldScan(false);
        setIsScanning(false);
        controlsRef.current?.stop?.();
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="w-full max-w-3xl z-10 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-mono tracking-tighter">
                            SCAN_PROTOCOL_V2
                        </h1>
                        <p className="text-cyan-500/60 font-mono text-xs mt-1 tracking-widest">
                            SYSTEM READY // AWAITING TARGET
                        </p>
                    </div>
                    <div className="hidden sm:flex gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-2 w-8 rounded-full ${i === 3 ? 'bg-cyan-500 animate-pulse' : 'bg-cyan-900'}`} />
                        ))}
                    </div>
                </div>

                {/* Main Scanner Interface */}
                <div className="relative group">
                    {/* Holographic Frame */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl opacity-50 blur group-hover:opacity-75 transition duration-1000 animate-tilt"></div>

                    <div className="relative bg-black rounded-xl border border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-900/20 backdrop-blur-xl h-[500px] flex flex-col">

                        {/* Camera Feed Layer */}
                        <div className="flex-1 relative bg-black/50">
                            {isCameraSupported ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        className={cn("absolute inset-0 w-full h-full object-cover", scanResult && "opacity-20 blur-sm")}
                                        muted
                                        autoPlay
                                        playsInline
                                    />
                                    {/* Scanning Beam */}
                                    {isScanning && !scanResult && (
                                        <motion.div
                                            initial={{ top: "0%" }}
                                            animate={{ top: "100%" }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                            className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] z-20"
                                        >
                                            <div className="absolute top-0 right-0 py-1 px-2 text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                                                SCANNING...
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* HUD Overlays */}
                                    <div className="absolute inset-4 border-2 border-dashed border-cyan-500/20 rounded-lg pointer-events-none flex flex-col justify-between p-4">
                                        <div className="flex justify-between items-start">
                                            <Scan className="text-cyan-500/50 w-6 h-6" />
                                            <div className="text-[10px] font-mono text-cyan-500/50">REC ●</div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-[10px] font-mono text-cyan-500/50">X: 192.44 Y: 43.11</div>
                                            <Scan className="text-cyan-500/50 w-6 h-6 rotate-180" />
                                        </div>
                                    </div>

                                    {!shouldScan && !scanResult && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                                            <button
                                                onClick={handleStartScan}
                                                className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-md transition-all hover:bg-cyan-500/10"
                                            >
                                                <div className="absolute inset-0 border border-cyan-500/50 rounded-md" />
                                                <div className="absolute inset-0 border border-cyan-500/50 rounded-md blur-[2px]" />
                                                <span className="relative font-mono text-cyan-400 font-bold tracking-widest group-hover:text-cyan-300">
                                                    INITIALIZE_SCANNER
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-red-500 font-mono">
                                    FATAL_ERROR: OPTICAL_SENSORS_OFFLINE
                                </div>
                            )}

                            {/* Result Overlay */}
                            <AnimatePresence>
                                {scanResult && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 z-30"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 ring-4 ring-green-500/10 animate-pulse">
                                            <Zap className="w-10 h-10 text-green-400" />
                                        </div>

                                        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">TARGET ACQUIRED</h2>
                                        <p className="text-green-400/80 font-mono text-sm mb-8 max-w-md text-center break-all">
                                            {scanResult}
                                        </p>

                                        {scanInfoLoading ? (
                                            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm">
                                                <Loader2 className="animate-spin w-4 h-4" />
                                                DECRYPTING_DATA...
                                            </div>
                                        ) : (
                                            <div className="flex gap-4">
                                                {issueUrl ? (
                                                    <Link href={issueUrl}>
                                                        <Button size="lg" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-wide shadow-lg shadow-cyan-500/25">
                                                            PROCEED TO REPORT
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button
                                                        onClick={() => window.open(normalizedCode || scanResult, "_blank")}
                                                        variant="outline"
                                                        className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-950"
                                                    >
                                                        OPEN EXTERNAL LINK <ExternalLink className="ml-2 w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    onClick={handleRescan}
                                                    className="text-white/50 hover:text-white"
                                                >
                                                    RESET
                                                </Button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer Controls */}
                        <div className="h-16 border-t border-white/10 bg-white/5 backdrop-blur flex items-center justify-between px-6">
                            <div className="text-[10px] text-zinc-500 font-mono">
                                SESSION_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                            </div>
                            {shouldScan && !scanResult && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleStopScan}
                                    className="h-8 text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                                >
                                    ABORT_SCAN
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Manual Entry Fallback */}
                <div className="text-center">
                    <Button variant="link" className="text-cyan-500/50 hover:text-cyan-400 text-xs">
                        SWITCH TO MANUAL INPUT PROTOCOL
                    </Button>
                </div>
            </div>
        </div>
    );
}
