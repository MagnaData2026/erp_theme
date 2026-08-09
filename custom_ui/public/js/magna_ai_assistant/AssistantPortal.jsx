import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import BentoWelcome from './BentoWelcome';
import ChatArea from './ChatArea';

// API Base configuration
const API_BASE_URL = 'https://ai.tjdem.online';

const MicIcon = ({ isListening }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isListening ? "#ef4444" : "var(--text-color, #0f172a)"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block', transition: 'stroke 0.2s ease' }}
    >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
        <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);

const UploadIcon = ({ isUploading, count }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke={count > 0 || isUploading ? "var(--primary-color, #0284c7)" : "var(--text-muted, #64748b)"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block', transition: 'stroke 0.2s ease' }}
    >
        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57a4 4 0 1 1 5.66 5.66l-8.59 8.58a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

// Small hero mark — a stylised spark/orbit glyph rendered in the active
// theme's primary color. No raster asset, no hardcoded brand palette.
const SparkMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3 L13.6 9.2 20 12 13.6 14.8 12 21 10.4 14.8 4 12 10.4 9.2 Z" fill="var(--primary-color, #6366f1)" />
        <circle cx="12" cy="12" r="10.25" stroke="color-mix(in srgb, var(--primary-color, #6366f1) 55%, transparent)" strokeWidth="1.1" strokeDasharray="1.5 4.5" strokeLinecap="round" />
    </svg>
);

const PaperPlaneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
    </svg>
);

const FileTypeIcon = ({ fileName }) => {
    const isPdf = /\.pdf$/i.test(fileName || '');
    return (
        <div style={{
            width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'color-mix(in srgb, var(--primary-color, #6366f1) 22%, transparent)',
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color, #6366f1)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                {isPdf
                    ? <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></>
                    : <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>}
            </svg>
        </div>
    );
};

// Theme-adaptive premium styling. Every color here is derived from the
// active theme's own CSS variables (--primary-color, --text-color,
// --card-bg, --border-color, --control-bg) via color-mix(), so switching
// theme mode (blue / brown / orange / sky / peach / purple / dark / light)
// restyles this entire shell automatically — nothing is hardcoded to one
// palette, and nothing here uses backdrop-filter / translucent panels.
const MAGNA_PREMIUM_STYLES = `
.magna-shell input::placeholder { color: var(--text-muted, #94a3b8); opacity: 0.85; }
.magna-shell .magna-input-shell { transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
.magna-shell .magna-input-shell:focus-within {
    border-color: color-mix(in srgb, var(--primary-color, #6366f1) 55%, var(--border-color, #cbd5e1)) !important;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #6366f1) 14%, transparent), 0 14px 34px -12px rgba(0, 0, 0, 0.14);
}
.magna-shell .magna-icon-btn { transition: background-color .15s ease, transform .15s ease; }
.magna-shell .magna-icon-btn:hover { background-color: color-mix(in srgb, var(--text-color, #0f172a) 8%, transparent); }
.magna-shell .magna-close-btn { transition: background-color .15s ease, color .15s ease; }
.magna-shell .magna-close-btn:hover { background-color: color-mix(in srgb, #ef4444 12%, transparent); color: #ef4444; }
.magna-shell .magna-mark-ring {
    background: conic-gradient(from 0deg, color-mix(in srgb, var(--primary-color, #6366f1) 95%, transparent), transparent 40%, color-mix(in srgb, var(--primary-color, #6366f1) 95%, transparent) 100%);
    animation: magna-spin 5s linear infinite;
}
.magna-shell .magna-history-item:hover { background-color: color-mix(in srgb, var(--text-color, #0f172a) 5%, transparent) !important; }
.magna-shell .magna-send-btn {
    background: linear-gradient(135deg, var(--primary-color, #6366f1), color-mix(in srgb, var(--primary-color, #6366f1) 60%, black));
    transition: box-shadow .18s ease, transform .12s ease, filter .18s ease;
}
.magna-shell .magna-send-btn:hover:not(:disabled) { filter: brightness(1.06); }
.magna-shell .magna-send-btn:active:not(:disabled) { transform: scale(0.97); }
.magna-shell .magna-hero-dotgrid {
    background-image: radial-gradient(color-mix(in srgb, var(--text-color, #0f172a) 14%, transparent) 1px, transparent 1px);
    background-size: 16px 16px;
    -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, #000 0%, transparent 75%);
    mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, #000 0%, transparent 75%);
}
.magna-shell .magna-scrim-dotgrid {
    background-image: radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px);
    background-size: 26px 26px;
}
@keyframes magna-spin { to { transform: rotate(360deg); } }
@keyframes magna-dot-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
.magna-shell .magna-live-dot { animation: magna-dot-pulse 2s ease-in-out infinite; }
@keyframes magna-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.magna-shell .magna-shimmer-text {
    background: linear-gradient(90deg, var(--card-bg, #fff) 0%, color-mix(in srgb, var(--primary-color, #6366f1) 45%, var(--card-bg, #fff)) 50%, var(--card-bg, #fff) 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
    animation: magna-shimmer 1.6s linear infinite;
}
`;

export default function AssistantPortal({ isOpen, onClose }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        {
            id: '1',
            title: 'Database Cluster Optimization',
            messages: [
                { sender: 'user', text: 'Analyze the query performance metrics.' },
                { sender: 'bot', text: 'Telemetry streams connected. Database index configuration optimized successfully.' }
            ]
        }
    ]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Multi-File Management State
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const activeChat = chatHistory.find(c => c.id === currentChatId);
    const activeMessages = activeChat ? activeChat.messages : messages;

    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice intelligence is not supported or active in your current browser configuration.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        if (!isListening) {
            setIsListening(true);
            recognition.start();

            recognition.onresult = (event) => {
                const speechToText = event.results[0][0].transcript;
                setInput((prev) => prev + (prev ? ' ' : '') + speechToText);
            };

            recognition.onerror = (err) => {
                console.error("Speech Recognition Core Error:", err);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };
        }
    };

    const appendMessage = (chatId, message) => {
        setChatHistory((prev) => {
            const idx = prev.findIndex((c) => c.id === chatId);
            if (idx === -1) return prev;
            const next = [...prev];
            next[idx] = { ...next[idx], messages: [...next[idx].messages, message] };
            return next;
        });
    };

    const handleFileSelect = (event) => {
        const newFiles = Array.from(event.target.files || []);
        if (newFiles.length === 0) return;

        setSelectedFiles(prev => [...prev, ...newFiles]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoveFile = (indexToRemove) => {
        setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSend = async (textToSend) => {
        const userPrompt = textToSend || input;
        const attachedFiles = [...selectedFiles];

        if ((!userPrompt.trim() && attachedFiles.length === 0) || isSending) return;

        let activeId = currentChatId;

        if (!activeId) {
            activeId = Date.now().toString();
            const sessionTitle = attachedFiles.length > 0
                ? `Documents (${attachedFiles.length}): ${attachedFiles[0].name}`
                : userPrompt.substring(0, 30) + (userPrompt.length > 30 ? '...' : '');

            const newChatSession = { id: activeId, title: sessionTitle, messages: [] };
            setChatHistory((prev) => [newChatSession, ...prev]);
            setCurrentChatId(activeId);
        }

        setInput('');
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsSending(true);

        try {
            if (attachedFiles.length > 0) {
                const filesListText = attachedFiles.map(f => `• 📄 **${f.name}**`).join('\n');
                const fileMsgText = userPrompt.trim()
                    ? `📎 **Attached Files (${attachedFiles.length})**:\n${filesListText}\n\n💬 ${userPrompt}`
                    : `📎 **Uploading Documents (${attachedFiles.length})**:\n${filesListText}`;

                appendMessage(activeId, { sender: 'user', text: fileMsgText });
                setIsUploading(true);

                for (let i = 0; i < attachedFiles.length; i++) {
                    const file = attachedFiles[i];
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('session_id', activeId);

                    const res = await fetch(`${API_BASE_URL}/api/upload-document`, {
                        method: 'POST',
                        body: formData,
                    });

                    if (!res.ok) throw new Error(`Document processing failed for ${file.name}`);

                    const ocrResult = await res.json();

                    appendMessage(activeId, {
                        sender: 'bot',
                        text: `✅ **Document ready (${i + 1}/${attachedFiles.length})**: ${file.name}\n\n${ocrResult.message || 'Its content is available for questions and requested DocType actions.'}`
                    });
                }

                // Uploading is ingestion only. Send the user's real prompt once
                // after every file is in the same session; never manufacture a
                // Purchase Order instruction from an attachment.
                if (userPrompt.trim()) {
                    const chatRes = await fetch(`${API_BASE_URL}/api/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: userPrompt, session_id: activeId }),
                    });

                    if (!chatRes.ok) {
                        throw new Error(`Agent responded with status ${chatRes.status}`);
                    }

                    const chatData = await chatRes.json();
                    appendMessage(activeId, { sender: 'bot', text: chatData.reply });

                    if (chatData.audio) {
                        const audio = new Audio(`data:audio/wav;base64,${chatData.audio}`);
                        audio.play().catch(() => {});
                    }
                }
            } else {
                appendMessage(activeId, { sender: 'user', text: userPrompt });

                const response = await fetch(`${API_BASE_URL}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userPrompt, session_id: activeId }),
                });

                if (!response.ok) {
                    throw new Error(`Agent responded with status ${response.status}`);
                }

                const data = await response.json();
                appendMessage(activeId, { sender: 'bot', text: data.reply });

                if (data.audio) {
                    const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
                    audio.play().catch(() => {});
                }
            }
        } catch (err) {
            console.error('Execution Error:', err);
            appendMessage(activeId, {
                sender: 'bot',
                text: "❌ Request processing encountered an issue. Please verify backend state.",
            });
        } finally {
            setIsUploading(false);
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    const activeSessionLabel = activeChat ? activeChat.title : 'New session';

    // Animated File Badges Component
    const RenderFileBadges = () => {
        if (selectedFiles.length === 0) return null;
        return (
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '6px',
                padding: '6px 8px', marginBottom: '4px',
                maxHeight: '80px', overflowY: 'auto'
            }}>
                {selectedFiles.map((file, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [0.85, 1, 0.85], scale: [0.99, 1.01, 0.99] }}
                        transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            padding: '4px 10px 4px 5px', borderRadius: '9px',
                            backgroundColor: 'color-mix(in srgb, var(--primary-color, #6366f1) 10%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--primary-color, #6366f1) 32%, transparent)',
                            boxShadow: '0 0 10px color-mix(in srgb, var(--primary-color, #6366f1) 16%, transparent)',
                            color: 'var(--text-color, #0f172a)', fontSize: '11.5px',
                            fontWeight: '600'
                        }}
                    >
                        <FileTypeIcon fileName={file.name} />
                        <span>{file.name.length > 22 ? file.name.substring(0, 20) + '...' : file.name}</span>
                        <button
                            onClick={() => handleRemoveFile(idx)}
                            style={{
                                border: 'none', background: 'none', cursor: 'pointer',
                                color: '#ef4444', padding: '0 2px', fontSize: '12px',
                                fontWeight: '700', lineHeight: 1
                            }}
                            title="Remove file"
                        >
                            ✕
                        </button>
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="magna-shell"
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000000, overflow: 'hidden',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
                    background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.55) 0%, rgba(8, 11, 21, 0.82) 100%)'
                }}
            >
                <style>{MAGNA_PREMIUM_STYLES}</style>

                {/* Decorative dot-grid on the scrim — solid, sharp, no blur */}
                <div className="magna-scrim-dotgrid" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleFileSelect}
                />

                {/* Main Panel */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 15 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.8 }}
                    style={{
                        width: '94vw', height: '90vh',
                        backgroundColor: 'var(--card-bg, #ffffff)',
                        border: '1px solid var(--border-color, rgba(148, 163, 184, 0.15))',
                        borderRadius: '26px',
                        boxShadow: '0 50px 90px -22px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.07), 0 0 0 1px color-mix(in srgb, var(--primary-color, #6366f1) 8%, transparent)',
                        display: 'flex', overflow: 'hidden', zIndex: 1
                    }}
                >
                    <Sidebar
                        chatHistory={chatHistory}
                        currentChatId={currentChatId}
                        onSelectChat={setCurrentChatId}
                        onNewChat={() => { setCurrentChatId(null); setMessages([]); setInput(''); setSelectedFiles([]); }}
                        isCollapsed={isCollapsed}
                        setIsCollapsed={setIsCollapsed}
                    />

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--card-bg, #ffffff)' }}>
                        {/* Header */}
                        <div style={{
                            height: '66px', position: 'relative',
                            borderBottom: '1px solid var(--border-color, rgba(148, 163, 184, 0.15))',
                            padding: '0 20px 0 24px', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'var(--card-bg, #ffffff)'
                        }}>
                            {/* subtle brand seam under the header */}
                            <div style={{
                                position: 'absolute', left: 0, right: 0, bottom: '-1px', height: '1px',
                                background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary-color, #6366f1) 45%, transparent) 50%, transparent)'
                            }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="magna-mark-ring" style={{ width: '30px', height: '30px', borderRadius: '50%', padding: '2px', flexShrink: 0 }}>
                                    <div style={{
                                        width: '100%', height: '100%', borderRadius: '50%',
                                        backgroundColor: 'var(--card-bg, #ffffff)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <SparkMarkIcon />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', lineHeight: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                        <span style={{ fontSize: '13.5px', fontWeight: '750', color: 'var(--text-color, #0f172a)', letterSpacing: '-0.2px' }}>
                                            Magna Engine Shell
                                        </span>
                                        <span style={{
                                            fontSize: '8.5px', fontWeight: '750', letterSpacing: '0.04em',
                                            padding: '1.5px 6px', borderRadius: '5px',
                                            color: 'var(--primary-color, #6366f1)',
                                            backgroundColor: 'color-mix(in srgb, var(--primary-color, #6366f1) 14%, transparent)'
                                        }}>
                                            AI
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: '9px', fontWeight: '600', letterSpacing: '0.09em', textTransform: 'uppercase',
                                        color: 'var(--text-muted, #64748b)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'
                                    }}>
                                        Autonomous Engine
                                    </span>
                                </div>
                            </div>

                            {/* Center: current session breadcrumb */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '5px 13px', borderRadius: '999px',
                                border: '1px solid var(--border-color, rgba(148, 163, 184, 0.18))',
                                maxWidth: '320px'
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted, #64748b)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                <span style={{
                                    fontSize: '11px', fontWeight: '600', color: 'var(--text-muted, #64748b)',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>
                                    {activeSessionLabel}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '5px 11px', borderRadius: '999px',
                                    border: '1px solid var(--border-color, rgba(148, 163, 184, 0.2))',
                                    backgroundColor: 'color-mix(in srgb, #22c55e 8%, transparent)'
                                }}>
                                    <span className="magna-live-dot" style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e'
                                    }} />
                                    <span style={{ fontSize: '10.5px', fontWeight: '650', color: 'var(--text-color, #0f172a)' }}>
                                        Online
                                    </span>
                                </div>
                                <motion.button
                                    className="magna-close-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    style={{
                                        border: 'none', background: 'transparent', color: 'var(--text-muted, #64748b)',
                                        width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <CloseIcon />
                                </motion.button>
                            </div>
                        </div>

                        {/* Interactive Workspace Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--card-bg, #ffffff)', position: 'relative' }}>
                            <AnimatePresence mode="wait">
                                {activeMessages.length === 0 ? (
                                    <motion.div
                                        key="welcome"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px 24px', overflowY: 'auto', position: 'relative' }}
                                    >
                                        {/* decorative dot-grid behind hero copy */}
                                        <div className="magna-hero-dotgrid" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '340px', pointerEvents: 'none', zIndex: 0 }} />

                                        <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '7px',
                                                marginBottom: '18px', padding: '5px 13px', borderRadius: '999px',
                                                border: '1px solid var(--border-color, rgba(148, 163, 184, 0.25))',
                                                backgroundColor: 'color-mix(in srgb, var(--primary-color, #6366f1) 7%, transparent)'
                                            }}>
                                                <span className="magna-live-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--primary-color, #6366f1)' }} />
                                                <span style={{
                                                    fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase',
                                                    color: 'var(--primary-color, #6366f1)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'
                                                }}>
                                                    Magna Autonomous Engine
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                                                <SparkMarkIcon />
                                            </div>

                                            <h1 style={{
                                                fontSize: '36px', fontWeight: '850', margin: '0 0 10px 0',
                                                letterSpacing: '-1.3px', lineHeight: '1.15',
                                                color: 'var(--text-color, #0f172a)'
                                            }}>
                                                Design with <span style={{ color: 'var(--primary-color, #6366f1)' }}>absolute intelligence.</span>
                                            </h1>
                                            <p style={{ fontSize: '13.5px', color: 'var(--text-muted, #64748b)', margin: 0, fontWeight: '450' }}>
                                                Execute runtime tasks, configure workflows or stream active database modules.
                                            </p>
                                        </div>

                                        {/* Seamless Input Bar */}
                                        <div className="magna-input-shell" style={{
                                            width: '100%', maxWidth: '640px',
                                            borderRadius: '18px', padding: '9px 12px',
                                            display: 'flex', flexDirection: 'column',
                                            marginBottom: '10px', position: 'relative', zIndex: 1,
                                            backgroundColor: 'var(--control-bg, var(--card-bg, #f8fafc))',
                                            border: '1px solid var(--border-color, rgba(148, 163, 184, 0.2))',
                                            boxShadow: '0 16px 36px -14px rgba(0, 0, 0, 0.1)',
                                            boxSizing: 'border-box'
                                        }}>
                                            <RenderFileBadges />

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                                <motion.button
                                                    className="magna-icon-btn"
                                                    whileHover={{ scale: 1.06 }}
                                                    whileTap={{ scale: 0.94 }}
                                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                                    disabled={isUploading}
                                                    style={{
                                                        background: 'transparent', border: 'none', borderRadius: '8px',
                                                        width: '28px', height: '28px', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}
                                                    title="Upload PO Documents (PDF / Images)"
                                                >
                                                    <UploadIcon isUploading={isUploading} count={selectedFiles.length} />
                                                </motion.button>

                                                <input
                                                    type="text"
                                                    placeholder={selectedFiles.length > 0 ? `Add prompt for ${selectedFiles.length} file(s) or press Execute...` : "Ask Magna or attach PO documents..."}
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                                    style={{
                                                        flex: 1, background: 'none', border: 'none', outline: 'none',
                                                        fontSize: '13.5px', color: 'var(--text-color, #0f172a)'
                                                    }}
                                                />

                                                <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color, rgba(148, 163, 184, 0.3))', flexShrink: 0 }} />

                                                <motion.button
                                                    className="magna-icon-btn"
                                                    whileHover={{ scale: 1.06 }}
                                                    whileTap={{ scale: 0.94 }}
                                                    onClick={handleVoiceInput}
                                                    style={{
                                                        background: isListening ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                                                        border: isListening ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                                                        borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}
                                                    title="Speak via Voice"
                                                >
                                                    <MicIcon isListening={isListening} />
                                                </motion.button>

                                                <motion.button
                                                    className="magna-send-btn"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleSend()}
                                                    disabled={isSending}
                                                    style={{
                                                        border: 'none',
                                                        color: '#ffffff',
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        padding: '8px 17px', borderRadius: '11px', fontSize: '12px',
                                                        fontWeight: '650', cursor: isSending ? 'default' : 'pointer',
                                                        opacity: isSending ? 0.75 : 1,
                                                        boxShadow: '0 6px 16px -5px color-mix(in srgb, var(--primary-color, #6366f1) 55%, transparent)'
                                                    }}
                                                >
                                                    {isSending
                                                        ? <span className="magna-shimmer-text">Executing…</span>
                                                        : <>Execute <PaperPlaneIcon /></>}
                                                </motion.button>
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            marginBottom: '32px', fontSize: '11px', color: 'var(--text-muted, #94a3b8)',
                                            position: 'relative', zIndex: 1
                                        }}>
                                            <kbd style={{
                                                padding: '2px 6px', borderRadius: '5px',
                                                border: '1px solid var(--border-color, #e2e8f0)',
                                                fontSize: '10px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                                color: 'var(--text-muted, #94a3b8)'
                                            }}>Enter</kbd>
                                            <span>to execute</span>
                                            <span style={{ margin: '0 4px', opacity: 0.4 }}>·</span>
                                            <span>{chatHistory.length} active session{chatHistory.length === 1 ? '' : 's'}</span>
                                        </div>

                                        <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
                                            <BentoWelcome onCardClick={handleSend} />
                                        </div>

                                        <div style={{
                                            marginTop: '30px', fontSize: '10.5px', fontWeight: '600',
                                            letterSpacing: '0.03em', color: 'var(--text-muted, #94a3b8)',
                                            opacity: 0.7, position: 'relative', zIndex: 1
                                        }}>
                                            Powered by Magna Autonomous Engine
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <ChatArea messages={activeMessages} isThinking={isSending} />

                                        {/* Active Chat Input Bar */}
                                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color, rgba(148, 163, 184, 0.15))' }}>
                                            <div className="magna-input-shell" style={{
                                                maxWidth: '750px', margin: '0 auto',
                                                borderRadius: '15px', padding: '7px 10px',
                                                display: 'flex', flexDirection: 'column',
                                                backgroundColor: 'var(--control-bg, var(--card-bg, #f8fafc))',
                                                border: '1px solid var(--border-color, rgba(148, 163, 184, 0.2))',
                                                boxShadow: '0 6px 22px rgba(0, 0, 0, 0.06)'
                                            }}>
                                                <RenderFileBadges />

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                                    <motion.button
                                                        className="magna-icon-btn"
                                                        whileHover={{ scale: 1.06 }}
                                                        whileTap={{ scale: 0.94 }}
                                                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                                        disabled={isUploading}
                                                        style={{
                                                            background: 'transparent', border: 'none', borderRadius: '8px',
                                                            width: '28px', height: '28px', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}
                                                        title="Upload PO Documents (PDF / Images)"
                                                    >
                                                        <UploadIcon isUploading={isUploading} count={selectedFiles.length} />
                                                    </motion.button>

                                                    <input
                                                        type="text"
                                                        placeholder={selectedFiles.length > 0 ? `Add instructions for attached ${selectedFiles.length} file(s)...` : "Reply or upload document..."}
                                                        value={input}
                                                        onChange={(e) => setInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                                        style={{
                                                            flex: 1, background: 'none', border: 'none', outline: 'none',
                                                            fontSize: '13px', color: 'var(--text-color, #0f172a)'
                                                        }}
                                                    />

                                                    <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-color, rgba(148, 163, 184, 0.3))', flexShrink: 0 }} />

                                                    <motion.button
                                                        className="magna-icon-btn"
                                                        whileHover={{ scale: 1.06 }}
                                                        whileTap={{ scale: 0.94 }}
                                                        onClick={handleVoiceInput}
                                                        style={{
                                                            background: isListening ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                                                            border: isListening ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                                                            borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}
                                                        title="Speak via Voice"
                                                    >
                                                        <MicIcon isListening={isListening} />
                                                    </motion.button>

                                                    <motion.button
                                                        className="magna-send-btn"
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={() => handleSend()}
                                                        disabled={isSending}
                                                        style={{
                                                            border: 'none',
                                                            color: '#ffffff',
                                                            display: 'flex', alignItems: 'center', gap: '6px',
                                                            padding: '7px 16px', borderRadius: '9px', fontSize: '11.5px',
                                                            fontWeight: '650', cursor: isSending ? 'default' : 'pointer',
                                                            opacity: isSending ? 0.75 : 1,
                                                            boxShadow: '0 5px 14px -5px color-mix(in srgb, var(--primary-color, #6366f1) 55%, transparent)'
                                                        }}
                                                    >
                                                        {isSending
                                                            ? <span className="magna-shimmer-text">…</span>
                                                            : <>Send <PaperPlaneIcon /></>}
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}