// magna_ai_assistant/AssistantPortal.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import BentoWelcome from './BentoWelcome';
import ChatArea from './ChatArea';

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
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 6 0V5a3 3 0 0 0-3-3Z" />
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
        stroke={count > 0 ? "#0284c7" : isUploading ? "#3b82f6" : "var(--text-muted, #64748b)"} 
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
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
    </svg>
);

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
    
    // MULTI-FILE STATE
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
                ? `PO Batch (${attachedFiles.length}): ${attachedFiles[0].name}` 
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
                    : `📎 **Processing Upload Batch (${attachedFiles.length} files)**:\n${filesListText}`;

                appendMessage(activeId, { sender: 'user', text: fileMsgText });
                setIsUploading(true);

                for (let i = 0; i < attachedFiles.length; i++) {
                    const file = attachedFiles[i];
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('session_id', activeId);

                    const res = await fetch(`${API_BASE_URL}/api/upload-po`, {
                        method: 'POST',
                        body: formData,
                    });

                    if (!res.ok) throw new Error(`OCR Processing failed for ${file.name}`);

                    const ocrResult = await res.json();
                    const data = ocrResult.ocr_data;

                    appendMessage(activeId, {
                        sender: 'bot',
                        text: `✅ **Extracted (${i + 1}/${attachedFiles.length})**: ${file.name}\n\n* **Vendor**: ${data.vendor_name || 'N/A'}\n* **PO Ref**: ${data.po_number || 'N/A'}\n* **Delivery Date**: ${data.delivery_date || 'N/A'}\n* **Items**: ${data.items ? data.items.length : 0}\n\n*Drafting Purchase Order...*`
                    });

                    const baseOcrPrompt = `Use tool process_ocr_po_and_create_order to create the PO. Vendor: ${data.vendor_name}, PO Number: ${data.po_number || ''}, Delivery Date: ${data.delivery_date || ''}. Items: ${JSON.stringify(data.items || [])}`;
                    const finalPrompt = userPrompt.trim() 
                        ? `${baseOcrPrompt}\n\nUser Instructions: ${userPrompt}` 
                        : baseOcrPrompt;

                    const chatRes = await fetch(`${API_BASE_URL}/api/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: finalPrompt, session_id: activeId }),
                    });

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

    // 🟢 Animated Blinking File Badges Component
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
                        animate={{ 
                            opacity: [0.75, 1, 0.75], 
                            scale: [0.98, 1.02, 0.98],
                            borderColor: ['rgba(56, 189, 248, 0.3)', 'rgba(56, 189, 248, 0.8)', 'rgba(56, 189, 248, 0.3)'],
                            boxShadow: [
                                '0 0 0px rgba(56, 189, 248, 0)',
                                '0 0 10px rgba(56, 189, 248, 0.35)',
                                '0 0 0px rgba(56, 189, 248, 0)'
                            ]
                        }}
                        transition={{ 
                            duration: 1.8, 
                            repeat: Infinity, 
                            ease: 'easeInOut' 
                        }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '4px 10px', borderRadius: '8px',
                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            color: 'var(--text-color, #0f172a)', fontSize: '11.5px',
                            fontWeight: '600', backdropFilter: 'blur(8px)'
                        }}
                    >
                        {/* Pulse Dot */}
                        <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            backgroundColor: '#38bdf8', boxShadow: '0 0 6px #38bdf8'
                        }} />
                        <span>📄 {file.name.length > 22 ? file.name.substring(0, 20) + '...' : file.name}</span>
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
                className="magna-portal-bg"
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000000, overflow: 'hidden',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif'
                }}
            >
                {/* Hidden File Input Element with MULTIPLE enabled */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*,application/pdf" 
                    multiple
                    onChange={handleFileSelect} 
                />

                {/* DYNAMIC LIQUID GRADIENT BACKGROUND ANIMATION */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
                    <motion.div 
                        animate={{
                            x: [0, 90, -60, 0],
                            y: [0, -110, 80, 0],
                            scale: [1, 1.35, 0.85, 1],
                            rotate: [0, 120, 240, 360]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute', top: '-15%', left: '5%',
                            width: '650px', height: '650px', borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(56, 189, 248, 0) 70%)',
                            filter: 'blur(110px)'
                        }}
                    />

                    <motion.div 
                        animate={{
                            x: [0, -120, 90, 0],
                            y: [0, 100, -120, 0],
                            scale: [1, 0.85, 1.3, 1],
                            rotate: [360, 240, 120, 0]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        style={{
                            position: 'absolute', bottom: '-10%', right: '-5%',
                            width: '750px', height: '750px', borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0) 70%)',
                            filter: 'blur(120px)'
                        }}
                    />
                </div>

                {/* MAIN WRAPPER PANEL */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 15 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.8 }}
                    className="magna-glass-card"
                    style={{
                        width: '94vw', height: '90vh',
                        backdropFilter: 'blur(35px) saturate(190%)',
                        borderRadius: '24px',
                        boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.3)', 
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

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'transparent' }}>
                        {/* Header */}
                        <div style={{
                            height: '64px', 
                            borderBottom: '1px solid var(--border-color, rgba(148, 163, 184, 0.15))',
                            padding: '0 24px', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', 
                            backgroundColor: 'transparent'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ 
                                    width: '8px', height: '8px', borderRadius: '50%', 
                                    backgroundColor: '#22c55e',
                                    boxShadow: '0 0 8px #22c55e'
                                }} />
                                <span style={{ fontSize: '13px', fontWeight: '650', color: 'var(--text-color, #0f172a)', letterSpacing: '-0.2px' }}>
                                    Magna Engine Shell
                                </span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                style={{
                                    border: 'none', background: 'transparent', color: 'var(--text-muted, #64748b)', 
                                    width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <CloseIcon />
                            </motion.button>
                        </div>

                        {/* Main Interactive Workspace Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'transparent' }}>
                            <AnimatePresence mode="wait">
                                {activeMessages.length === 0 ? (
                                    <motion.div 
                                        key="welcome"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px 24px', overflowY: 'auto' }}
                                    >
                                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                                            <h1 style={{ 
                                                fontSize: '34px', fontWeight: '850', margin: '0 0 10px 0', 
                                                letterSpacing: '-1.2px', lineHeight: '1.15',
                                                color: 'var(--text-color, #0f172a)'
                                            }}>
                                                Design with absolute intelligence.
                                            </h1>
                                            <p style={{ fontSize: '13.5px', color: 'var(--text-muted, #64748b)', margin: 0, fontWeight: '450' }}>
                                                Execute runtime tasks, configure workflows or stream active database modules.
                                            </p>
                                        </div>

                                        {/* Seamless Input Card Container */}
                                        <div className="magna-input-box" style={{
                                            width: '100%', maxWidth: '640px',
                                            borderRadius: '16px', padding: '8px 12px',
                                            display: 'flex', flexDirection: 'column',
                                            marginBottom: '32px',
                                            boxShadow: '0 12px 32px -10px rgba(0, 0, 0, 0.08)',
                                            boxSizing: 'border-box'
                                        }}>
                                            {/* Top Section: Animated File Badges */}
                                            <RenderFileBadges />

                                            {/* Bottom Section: Controls & Text Input */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                                <motion.button
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
                                                
                                                <motion.button
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
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleSend()}
                                                    disabled={isSending}
                                                    style={{
                                                        background: 'var(--text-color, #0f172a)', 
                                                        border: 'none', 
                                                        color: 'var(--card-bg, #ffffff)',
                                                        padding: '7px 15px', borderRadius: '9px', fontSize: '12px',
                                                        fontWeight: '600', cursor: isSending ? 'default' : 'pointer',
                                                        opacity: isSending ? 0.6 : 1
                                                    }}
                                                >
                                                    {isSending ? 'Executing…' : 'Execute'}
                                                </motion.button>
                                            </div>
                                        </div>

                                        <BentoWelcome onCardClick={handleSend} />
                                    </motion.div>
                                ) : (
                                    <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <ChatArea messages={activeMessages} isThinking={isSending} />
                                        
                                        {/* Active Chat Input Area */}
                                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color, rgba(148, 163, 184, 0.15))' }}>
                                            <div className="magna-input-box" style={{
                                                maxWidth: '750px', margin: '0 auto',
                                                borderRadius: '14px', padding: '6px 10px',
                                                display: 'flex', flexDirection: 'column',
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                                            }}>
                                                {/* File Badges Area */}
                                                <RenderFileBadges />

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                                    <motion.button
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

                                                    <motion.button
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

                                                    <button 
                                                        onClick={() => handleSend()} 
                                                        disabled={isSending}
                                                        style={{ 
                                                            background: 'var(--text-color, #0f172a)', 
                                                            border: 'none', 
                                                            color: 'var(--card-bg, #ffffff)', 
                                                            padding: '6px 14px', borderRadius: '8px', fontSize: '11.5px', 
                                                            fontWeight: '600', cursor: isSending ? 'default' : 'pointer',
                                                            opacity: isSending ? 0.6 : 1
                                                        }}
                                                    >
                                                        {isSending ? '…' : 'Send'}
                                                    </button>
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