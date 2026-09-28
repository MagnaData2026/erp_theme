
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Premium Lucide-Style SVG Icons (Strictly Pure SVGs, No Emojis)
const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

const ComposeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
);

// Tilted pushpin, like ChatGPT's pin icon.
const PinIcon = ({ color = "currentColor", filled = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg)' }}><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
);

const TrashIcon = ({ color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
);

// Slides the title left on hover to reveal what's clipped, instead of an ellipsis.
const MarqueeText = ({ text, isHovered }) => {
    const outerRef = useRef(null);
    const innerRef = useRef(null);
    const [offset, setOffset] = useState(0);
    const [animate, setAnimate] = useState(false);
    const pauseTimerRef = useRef(null);

    const startReveal = () => {
        if (!outerRef.current || !innerRef.current) return;
        const over = innerRef.current.scrollWidth - outerRef.current.clientWidth;
        if (over > 0) {
            setAnimate(true);
            setOffset(over);
        }
    };

    useEffect(() => {
        if (isHovered) {
            startReveal();
        } else {
            clearTimeout(pauseTimerRef.current);
            setAnimate(false);
            setOffset(0);
        }
        return () => clearTimeout(pauseTimerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHovered, text]);

    // Reveal finished -- snap back to the start, pause, then loop while still hovered.
    const handleRevealEnd = () => {
        if (!isHovered) return;
        setAnimate(false);
        setOffset(0);
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => { if (isHovered) startReveal(); }, 500);
    };

    return (
        <span ref={outerRef} style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
            <span
                ref={innerRef}
                onTransitionEnd={handleRevealEnd}
                style={{
                    display: 'inline-block',
                    transform: `translateX(-${offset}px)`,
                    transition: animate ? `transform ${Math.max(offset / 20, 1.2)}s linear` : 'none',
                }}
            >
                {text}
            </span>
        </span>
    );
};

export default function Sidebar({ chatHistory, currentChatId, onSelectChat, onNewChat, onPinChat, onDeleteChat, isCollapsed, setIsCollapsed }) {
    const [hoveredId, setHoveredId] = useState(null);
    const [newChatHovered, setNewChatHovered] = useState(false);
    const pinnedChats = chatHistory.filter((c) => c.pinned);
    const unpinnedChats = chatHistory.filter((c) => !c.pinned);
    return (
        <motion.div 
            animate={{ width: isCollapsed ? '78px' : '280px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.8 }}
            className="magna-glass-card"
            style={{
                borderRight: '1px solid var(--border-color, rgba(148, 163, 184, 0.15))',
                borderTop: 'none',
                borderLeft: 'none',
                borderBottom: 'none',
                borderRadius: 0,
                padding: '24px 14px', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'space-between', 
                backdropFilter: 'blur(20px) saturate(130%)',
                position: 'relative', 
                overflow: 'hidden', 
                height: '100%', 
                boxSizing: 'border-box'
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                
                {/* Brand Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', height: '32px', paddingLeft: '6px', position: 'relative' }}>
                    <motion.div 
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: '800', color: '#ffffff', flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        M
                    </motion.div>
                    
                    {!isCollapsed && (
                        <motion.span 
                            initial={{ opacity: 0, x: -6 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--text-color, #0f172a)', letterSpacing: '-0.3px' }}
                        >
                            Magna AI
                        </motion.span>
                    )}
                    
                    {/* Modern Control Toggle */}
                    <motion.button 
                        whileHover={{ backgroundColor: 'var(--border-color, rgba(148, 163, 184, 0.2))', scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            position: 'absolute', right: isCollapsed ? '4px' : '0px', top: '2px', border: 'none', 
                            background: 'none', cursor: 'pointer', outline: 'none', padding: '6px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            color: 'var(--text-muted, #64748b)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </motion.button>
                </div>

                {/* New Chat Button */}
                <button
                    onClick={onNewChat}
                    style={{
                        width: '100%', height: '40px',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start',
                        padding: isCollapsed ? '0' : '0 14px', gap: '10px', cursor: 'pointer',
                        fontWeight: '600', fontSize: '12.5px', color: 'var(--text-color, #0f172a)',
                        border: 'none', background: newChatHovered ? 'color-mix(in srgb, var(--text-color, #0f172a) 7%, transparent)' : 'transparent',
                        transition: 'background-color 0.15s ease', flexShrink: 0
                    }}
                    onMouseEnter={() => setNewChatHovered(true)}
                    onMouseLeave={() => setNewChatHovered(false)}
                >
                    <ComposeIcon />
                    {!isCollapsed && <span>New chat</span>}
                </button>

                {/* Thread Navigation List */}
                <div className="magna-sidebar-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minHeight: 0, overflowY: 'auto', marginTop: isCollapsed ? '16px' : '0' }}>
                    {pinnedChats.length > 0 && !isCollapsed && (
                        <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '28px', marginBottom: '4px', paddingLeft: '6px' }}>
                            Pinned
                        </div>
                    )}
                    {pinnedChats.map((chat) => renderRow(chat))}

                    {!isCollapsed && (
                        <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: pinnedChats.length > 0 ? '18px' : '28px', marginBottom: '10px', paddingLeft: '6px' }}>
                            Active History
                        </div>
                    )}
                    {unpinnedChats.map((chat) => renderRow(chat))}
                </div>
            </div>

            {/* Operator Profiler Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color, rgba(148, 163, 184, 0.15))', flexShrink: 0 }}>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: '#3b82f6', color: '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    OP
                </motion.div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    >
                        <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-color, #0f172a)', letterSpacing: '-0.1px' }}>Operator Profile</span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)', fontWeight: '450' }}>root@magna.engine</span>
                    </motion.div>
                )}
            </div>

        </motion.div>
    );

    function renderRow(chat) {
        const isActive = currentChatId === chat.id;
        const isHovered = hoveredId === chat.id;
        return (
                            <div
                                key={chat.id}
                                onClick={() => onSelectChat(chat.id)}
                                onMouseEnter={() => setHoveredId(chat.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{
                                    display: 'flex', alignItems: 'center', height: '38px', padding: '0 12px', borderRadius: '10px',
                                    cursor: 'pointer', fontSize: '13px', fontWeight: isActive ? '600' : '500',
                                    color: 'var(--text-color, #0f172a)',
                                    backgroundColor: isActive || isHovered ? 'color-mix(in srgb, var(--text-color, #0f172a) 7%, transparent)' : 'transparent',
                                    whiteSpace: 'nowrap', justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    position: 'relative',
                                    transition: 'background-color 0.15s ease'
                                }}
                            >
                                {!isCollapsed && <MarqueeText text={chat.title} isHovered={isHovered} />}
                                {!isCollapsed && (isHovered || chat.pinned) && (
                                    <div style={{ display: 'flex', gap: '2px', flexShrink: 0, marginLeft: '6px' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onPinChat(chat.id, !chat.pinned); }}
                                            title={chat.pinned ? 'Unpin' : 'Pin'}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', color: chat.pinned ? '#3b82f6' : 'var(--text-muted, #64748b)' }}
                                        >
                                            <PinIcon filled={chat.pinned} />
                                        </button>
                                        {isHovered && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                                                title="Delete"
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', color: 'var(--text-muted, #64748b)' }}
                                            >
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
        );
    }
}