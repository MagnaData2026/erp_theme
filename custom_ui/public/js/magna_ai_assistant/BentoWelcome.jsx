// magna_ai_assistant/BentoWelcome.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Premium Lucide-React SVG Asset components with Dynamic Theme Color injection
const ZapIcon = ({ strokeColor }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
);

const BotIcon = ({ strokeColor }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8"/>
        <rect width="16" height="12" x="4" y="8" rx="2"/>
        <path d="M2 14h2"/>
        <path d="M20 14h2"/>
        <path d="M15 13v2"/>
        <path d="M9 13v2"/>
    </svg>
);

const GlobeIcon = ({ strokeColor }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
        <path d="M2 12h20"/>
    </svg>
);

const WrenchIcon = ({ strokeColor }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 0-7.94-7.94l-6.91 6.91a2.12 2.12 0 0 0-.13 2.87l2.12 2.12a2.13 2.13 0 0 0 2.87-.13l6.91-6.91a6 6 0 0 0-7.94-7.94l3.76 3.76z"/>
    </svg>
);

export default function BentoWelcome({ onCardClick }) {
    const cards = [
        { 
            title: "Build a Backend Integration", 
            desc: "Connect SQL databases, trigger microservices, and setup cloud schemas.", 
            icon: (color) => <ZapIcon strokeColor={color} />,
            theme: {
                accent: "#0ea5e9", // Sky Blue
                border: "rgba(14, 165, 233, 0.25)",
                hoverBorder: "#0ea5e9",
                glow: "rgba(14, 165, 233, 0.25)",
                iconBg: "rgba(14, 165, 233, 0.15)"
            }
        },
        { 
            title: "Deploy Agentic Workflows", 
            desc: "Learn how to orchestrate automated scripts and multi-agent systems.", 
            icon: (color) => <BotIcon strokeColor={color} />,
            theme: {
                accent: "#a855f7", // Violet
                border: "rgba(168, 85, 247, 0.25)",
                hoverBorder: "#a855f7",
                glow: "rgba(168, 85, 247, 0.25)",
                iconBg: "rgba(168, 85, 247, 0.15)"
            }
        },
        { 
            title: "Optimize Live ERP Pipeline", 
            desc: "Deploy fast web-sockets, host static assets, and track core telemetry.", 
            icon: (color) => <GlobeIcon strokeColor={color} />,
            theme: {
                accent: "#10b981", // Emerald
                border: "rgba(16, 185, 129, 0.25)",
                hoverBorder: "#10b981",
                glow: "rgba(16, 185, 129, 0.25)",
                iconBg: "rgba(16, 185, 129, 0.15)"
            }
        },
        { 
            title: "Magna Dev Tools Suite", 
            desc: "Explore advanced performance logs, CLI profiles, and runtime emulators.", 
            icon: (color) => <WrenchIcon strokeColor={color} />,
            theme: {
                accent: "#f97316", // Orange
                border: "rgba(249, 115, 22, 0.25)",
                hoverBorder: "#f97316",
                glow: "rgba(249, 115, 22, 0.25)",
                iconBg: "rgba(249, 115, 22, 0.15)"
            }
        }
    ];

    return (
        <motion.div 
            initial="hidden" 
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            style={{
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '16px',
                width: '100%', 
                maxWidth: '620px', 
                margin: '0 auto',
                padding: '4px',
                boxSizing: 'border-box'
            }}
        >
            {cards.map((card, idx) => (
                <motion.div
                    key={idx}
                    variants={{ 
                        hidden: { opacity: 0, y: 16 }, 
                        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } } 
                    }}
                    whileHover={{ 
                        y: -5,
                        scale: 1.02,
                        borderColor: card.theme.hoverBorder,
                        boxShadow: `0 16px 32px -6px ${card.theme.glow}`
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onCardClick(card.title)}
                    className="magna-glass-card"
                    style={{
                        border: `1px solid ${card.theme.border}`,
                        borderRadius: '16px', 
                        padding: '16px 18px', 
                        cursor: 'pointer',
                        textAlign: 'left', 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between', 
                        height: '130px', 
                        boxSizing: 'border-box',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(20px) saturate(140%)',
                        boxShadow: '0 4px 20px -6px rgba(0, 0, 0, 0.05)',
                        transition: 'border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {/* SMOOTH CONTINUOUS PULSING RADIAL GLOW */}
                    <motion.div 
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.15, 0.28, 0.15]
                        }}
                        transition={{
                            duration: 4 + idx, // Staggered speeds so loops feel natural
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                        style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            background: card.theme.accent,
                            filter: 'blur(22px)',
                            pointerEvents: 'none',
                            zIndex: 1
                        }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', zIndex: 2 }}>
                        <h3 style={{ 
                            fontSize: '13.5px', 
                            fontWeight: '650', 
                            color: 'var(--text-color, #0f172a)',
                            margin: 0, 
                            letterSpacing: '-0.2px',
                            lineHeight: '1.4',
                            flex: 1
                        }}>
                            {card.title}
                        </h3>
                        
                        {/* Dynamic Icon Container */}
                        <motion.div 
                            whileHover={{ scale: 1.08 }}
                            style={{ 
                                backgroundColor: card.theme.iconBg, 
                                border: `1px solid ${card.theme.border}`,
                                boxShadow: `0 2px 6px -1px rgba(0, 0, 0, 0.05)`,
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '8px',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                flexShrink: 0,
                                transition: 'transform 0.2s ease'
                            }}
                        >
                            {card.icon(card.theme.accent)}
                        </motion.div>
                    </div>

                    <p style={{ 
                        fontSize: '11px', 
                        color: 'var(--text-muted, #475569)',
                        lineHeight: '1.5', 
                        margin: 0, 
                        fontWeight: '450',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        zIndex: 2
                    }}>
                        {card.desc}
                    </p>
                </motion.div>
            ))}
        </motion.div>
    );
}