// magna_ai_assistant/ChatArea.jsx
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function StreamingText({ text, speed = 6, onComplete }) {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        let index = 0; setDisplayedText('');
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);
    return <span style={{ color: 'var(--text-color, #0f172a)', fontWeight: '450' }}>{displayedText}</span>;
}

// 🧠 Dedicated AI Thinking Indicator Component
function ThinkingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '82%', gap: '6px' }}>
                {/* Thinking Sender Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
                    <span style={{ 
                        width: '6px', height: '6px', borderRadius: '50%', 
                        backgroundColor: '#3b82f6', boxShadow: '0 0 8px #3b82f6' 
                    }} />
                    <span style={{ fontSize: '11.5px', fontWeight: '650', color: 'var(--text-muted, #64748b)', letterSpacing: '-0.1px' }}>
                        Magna System Agent
                    </span>
                    <span style={{ 
                        fontSize: '9.5px', padding: '1px 6px', borderRadius: '50px', 
                        backgroundColor: 'rgba(59, 130, 246, 0.12)', 
                        border: '1px solid rgba(59, 130, 246, 0.2)', 
                        color: '#3b82f6', fontWeight: '600' 
                    }}>
                        Thinking...
                    </span>
                </div>

                {/* Thinking Glass Card */}
                <div className="magna-glass-card" style={{
                    padding: '12px 18px',
                    borderRadius: '18px 18px 18px 4px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-color, #0f172a)' }}>
                        Magna AI is thinking
                    </span>
                    
                    {/* Glowing Pulsing Dots Animation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {[0, 1, 2].map((dot) => (
                            <motion.span
                                key={dot}
                                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.2 }}
                                style={{
                                    width: '5px',
                                    height: '5px',
                                    borderRadius: '50%',
                                    backgroundColor: '#3b82f6',
                                    display: 'inline-block'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function ChatArea({ messages, isThinking }) {
    const scrollBottomRef = useRef(null);

    useEffect(() => {
        scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', backgroundColor: 'transparent' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => {
                        const isUser = msg.sender === 'user';
                        const isLast = index === messages.length - 1;

                        return (
                            <motion.div 
                                key={index} 
                                layout
                                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                                style={{
                                    display: 'flex',
                                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                                    width: '100%'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isUser ? 'flex-end' : 'flex-start',
                                    maxWidth: '82%',
                                    gap: '6px'
                                }}>
                                    {/* Sender Meta Info */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
                                        {!isUser && (
                                            <span style={{ 
                                                width: '6px', height: '6px', borderRadius: '50%', 
                                                backgroundColor: '#3b82f6', boxShadow: '0 0 8px #3b82f6' 
                                            }} />
                                        )}
                                        <span style={{ fontSize: '11.5px', fontWeight: '650', color: 'var(--text-muted, #64748b)', letterSpacing: '-0.1px' }}>
                                            {isUser ? 'Workspace Executive' : 'Magna System Agent'}
                                        </span>
                                        <span style={{ 
                                            fontSize: '9.5px', padding: '1px 6px', borderRadius: '50px', 
                                            backgroundColor: isUser ? 'var(--border-color, rgba(148, 163, 184, 0.15))' : 'rgba(59, 130, 246, 0.12)', 
                                            border: isUser ? '1px solid var(--border-color, rgba(148, 163, 184, 0.2))' : '1px solid rgba(59, 130, 246, 0.2)', 
                                            color: isUser ? 'var(--text-muted, #64748b)' : '#3b82f6', fontWeight: '600' 
                                        }}>
                                            {isUser ? 'Prompt' : 'Engine Response'}
                                        </span>
                                    </div>

                                    {/* Message Glass Bubble Card */}
                                    <div 
                                        className={isUser ? "magna-input-box" : "magna-glass-card"}
                                        style={{
                                            padding: '14px 18px',
                                            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            backdropFilter: 'blur(20px)',
                                            boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.05)',
                                            textAlign: 'left',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ 
                                            fontSize: '13.5px', 
                                            lineHeight: '1.6', 
                                            color: 'var(--text-color, #0f172a)', 
                                            letterSpacing: '-0.1px', 
                                            whiteSpace: 'pre-line' 
                                        }}>
                                            {!isUser && isLast ? (
                                                <StreamingText text={msg.text} />
                                            ) : (
                                                <span style={{ fontWeight: '450' }}>{msg.text}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Show Thinking Card when AI is processing */}
                    {isThinking && <ThinkingIndicator key="thinking-state" />}
                </AnimatePresence>
                <div ref={scrollBottomRef} />
            </div>
        </div>
    );
}