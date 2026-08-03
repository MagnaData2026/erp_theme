// magna_ai_assistant/AssistantPortal.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import BentoWelcome from './BentoWelcome';
import ChatArea from './ChatArea';

const API_BASE_URL = 'http://localhost:8050';

const MicIcon = ({ isListening }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="15" 
        height="15" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={isListening ? "#ef4444" : "#0f172a"} 
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

const UploadIcon = ({ isUploading }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="15" 
        height="15" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={isUploading ? "#3b82f6" : "#64748b"} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ display: 'block', transition: 'stroke 0.2s ease' }}
    >
        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57a4 4 0 1 1 5.66 5.66l-8.59 8.58a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
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

    // --- NEW: Handle Document Upload & Auto-Process PO ---
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        let activeId = currentChatId;
        if (!activeId) {
            activeId = Date.now().toString();
            const newChatSession = { id: activeId, title: `PO Upload: ${file.name}`, messages: [] };
            setChatHistory((prev) => [newChatSession, ...prev]);
            setCurrentChatId(activeId);
        }

        appendMessage(activeId, { sender: 'user', text: `📄 Uploading PO Document: ${file.name}` });
        setIsUploading(true);
        setIsSending(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('session_id', activeId);

        try {
            // 1. Send file to Vision OCR endpoint
            const res = await fetch(`${API_BASE_URL}/api/upload-po`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error("OCR Processing failed.");

            const ocrResult = await res.json();
            const data = ocrResult.ocr_data;

            appendMessage(activeId, {
                sender: 'bot',
                text: `✅ **PO Extracted Successfully!**\n\n* **Vendor**: ${data.vendor_name || 'N/A'}\n* **PO Ref**: ${data.po_number || 'N/A'}\n* **Delivery Date**: ${data.delivery_date || 'N/A'}\n* **Items Extracted**: ${data.items ? data.items.length : 0}\n\n*Processing Purchase Order creation in ERPNext...*`
            });

            // 2. Automatically trigger AI Agent to draft the PO in ERPNext
            const chatPrompt = `Use tool process_ocr_po_and_create_order to create the PO. Vendor: ${data.vendor_name}, PO Number: ${data.po_number || ''}, Delivery Date: ${data.delivery_date || ''}. Items: ${JSON.stringify(data.items || [])}`;

            const chatRes = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: chatPrompt, session_id: activeId }),
            });

            const chatData = await chatRes.json();
            appendMessage(activeId, { sender: 'bot', text: chatData.reply });

            if (chatData.audio) {
                const audio = new Audio(`data:audio/wav;base64,${chatData.audio}`);
                audio.play().catch(() => {});
            }

        } catch (err) {
            console.error('OCR Upload Error:', err);
            appendMessage(activeId, {
                sender: 'bot',
                text: "❌ Could not process uploaded document. Please verify the server connection and try again.",
            });
        } finally {
            setIsUploading(false);
            setIsSending(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSend = async (textToSend) => {
        const text = textToSend || input;
        if (!text.trim() || isSending) return;

        let activeId = currentChatId;

        if (!activeId) {
            activeId = Date.now().toString();
            const newChatSession = { id: activeId, title: text.substring(0, 30) + (text.length > 30 ? '...' : ''), messages: [] };
            setChatHistory((prev) => [newChatSession, ...prev]);
            setCurrentChatId(activeId);
        }

        appendMessage(activeId, { sender: 'user', text });
        setInput('');
        setIsSending(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, session_id: activeId }),
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
        } catch (err) {
            console.error('Agent request failed:', err);
            appendMessage(activeId, {
                sender: 'bot',
                text: "I couldn't reach the agent backend just now. Make sure ERP/server.py is running and reachable, then try again.",
            });
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #f3e8ff 40%, #fff7ed 75%, #dcfce7 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000000, overflow: 'hidden',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif'
                }}
            >
                {/* Hidden File Input Element */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*,application/pdf" 
                    onChange={handleFileUpload} 
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
                            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(56, 189, 248, 0) 70%)',
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
                            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.38) 0%, rgba(168, 85, 247, 0) 70%)',
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
                    style={{
                        width: '94vw', height: '90vh',
                        backgroundColor: 'rgba(255, 255, 255, 0.55)',
                        backdropFilter: 'blur(35px) saturate(190%)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.7)', 
                        boxShadow: '0 40px 80px -20px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.4)', 
                        display: 'flex', overflow: 'hidden', zIndex: 1
                    }}
                >
                    <Sidebar 
                        chatHistory={chatHistory} 
                        currentChatId={currentChatId} 
                        onSelectChat={setCurrentChatId} 
                        onNewChat={() => { setCurrentChatId(null); setMessages([]); setInput(''); }} 
                        isCollapsed={isCollapsed}
                        setIsCollapsed={setIsCollapsed}
                    />

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'transparent' }}>
                        {/* Header */}
                        <div style={{
                            height: '64px', borderBottom: '1px solid rgba(15, 23, 42, 0.05)',
                            padding: '0 24px', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.35)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ 
                                    width: '8px', height: '8px', borderRadius: '50%', 
                                    backgroundColor: '#22c55e',
                                    boxShadow: '0 0 8px #22c55e'
                                }} />
                                <span style={{ fontSize: '13px', fontWeight: '650', color: '#0f172a', letterSpacing: '-0.2px' }}>
                                    Magna Engine Shell
                                </span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(15, 23, 42, 0.05)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                style={{
                                    border: 'none', background: 'transparent', width: '28px', height: '28px',
                                    borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', transition: 'background-color 0.2s'
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
                                        style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px 24px' }}
                                    >
                                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                            <h1 style={{ 
                                                fontSize: '34px', fontWeight: '850', color: '#0f172a', margin: '0 0 10px 0', 
                                                letterSpacing: '-1.2px', lineHeight: '1.15',
                                                background: 'linear-gradient(135deg, #0f172a 30%, #3b82f6 100%)',
                                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                            }}>
                                                Design with absolute intelligence.
                                            </h1>
                                            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, fontWeight: '450' }}>
                                                Execute runtime tasks, configure workflows or stream active database modules.
                                            </p>
                                        </div>

                                        {/* Welcome Input Box */}
                                        <div style={{
                                            width: '100%', maxWidth: '600px', backgroundColor: '#ffffff',
                                            border: '1px solid #e2e8f0', borderRadius: '14px', padding: '8px 12px',
                                            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px',
                                            boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.04)',
                                            position: 'relative', boxSizing: 'border-box'
                                        }}>
                                            {/* File Attach Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.06, backgroundColor: '#f1f5f9' }}
                                                whileTap={{ scale: 0.94 }}
                                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                                disabled={isUploading}
                                                style={{
                                                    background: 'transparent', border: 'none', borderRadius: '8px',
                                                    width: '28px', height: '28px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0
                                                }}
                                                title="Upload Purchase Order (Image / PDF)"
                                            >
                                                <UploadIcon isUploading={isUploading} />
                                            </motion.button>

                                            <input
                                                type="text"
                                                placeholder="Ask Magna or upload PO document..."
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '13.5px', color: '#0f172a' }}
                                            />
                                            
                                            <motion.button
                                                whileHover={{ scale: 1.06, backgroundColor: isListening ? '#fee2e2' : '#f1f5f9' }}
                                                whileTap={{ scale: 0.94 }}
                                                onClick={handleVoiceInput}
                                                style={{
                                                    background: isListening ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                                                    border: isListening ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent',
                                                    borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0
                                                }}
                                                title="Speak via Audio Input"
                                            >
                                                <MicIcon isListening={isListening} />
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.02, backgroundColor: '#1e293b' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSend()}
                                                disabled={isSending}
                                                style={{
                                                    background: '#0f172a', border: 'none', color: '#ffffff',
                                                    padding: '7px 14px', borderRadius: '8px', fontSize: '12px',
                                                    fontWeight: '600', cursor: isSending ? 'default' : 'pointer',
                                                    opacity: isSending ? 0.6 : 1
                                                }}
                                            >
                                                {isSending ? 'Executing…' : 'Execute'}
                                            </motion.button>
                                        </div>

                                        <BentoWelcome onCardClick={handleSend} />
                                    </motion.div>
                                ) : (
                                    <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <ChatArea messages={activeMessages} isThinking={isSending} />
                                        
                                        {/* Active Chat Input Area */}
                                        <div style={{ padding: '16px 24px', backgroundColor: 'rgba(255, 255, 255, 0.55)', borderTop: '1px solid rgba(15, 23, 42, 0.05)' }}>
                                            <div style={{
                                                maxWidth: '750px', margin: '0 auto', backgroundColor: '#ffffff',
                                                border: '1px solid #e2e8f0', borderRadius: '12px', padding: '6px 10px',
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.02)'
                                            }}>
                                                {/* File Attach Button */}
                                                <motion.button
                                                    whileHover={{ scale: 1.06, backgroundColor: '#f1f5f9' }}
                                                    whileTap={{ scale: 0.94 }}
                                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                                    disabled={isUploading}
                                                    style={{
                                                        background: 'transparent', border: 'none', borderRadius: '8px',
                                                        width: '28px', height: '28px', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}
                                                    title="Upload Purchase Order (Image / PDF)"
                                                >
                                                    <UploadIcon isUploading={isUploading} />
                                                </motion.button>

                                                <input
                                                    type="text"
                                                    placeholder="Reply or upload document..."
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: '#0f172a' }}
                                                />

                                                <motion.button
                                                    whileHover={{ scale: 1.06, backgroundColor: isListening ? '#fee2e2' : '#f1f5f9' }}
                                                    whileTap={{ scale: 0.94 }}
                                                    onClick={handleVoiceInput}
                                                    style={{
                                                        background: isListening ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                                                        border: isListening ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent',
                                                        borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}
                                                    title="Speak via Audio Input"
                                                >
                                                    <MicIcon isListening={isListening} />
                                                </motion.button>

                                                <button 
                                                    onClick={() => handleSend()} 
                                                    disabled={isSending}
                                                    style={{ 
                                                        background: '#0f172a', border: 'none', color: '#ffffff', 
                                                        padding: '6px 12px', borderRadius: '7px', fontSize: '11.5px', 
                                                        fontWeight: '600', cursor: isSending ? 'default' : 'pointer',
                                                        opacity: isSending ? 0.6 : 1
                                                    }}
                                                >
                                                    {isSending ? '…' : 'Send'}
                                                </button>
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