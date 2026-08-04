// magna_ai_assistant/ChatArea.jsx
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    LineChart, 
    Line, 
    PieChart, 
    Pie, 
    Cell, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend 
} from 'recharts';

function FormattedMarkdownText({ text }) {
    if (!text) return null;

    // Helper to render inline formatting like **bold**
    const renderInline = (str) => {
        if (!str) return null;
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                return <strong key={i} style={{ fontWeight: '650', color: '#0f172a' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    // Split text into blocks (tables vs paragraphs/headings/lists)
    const lines = text.split('\n');
    const blocks = [];
    let currentTable = null;

    lines.forEach((line) => {
        const trimmed = line.trim();

        // Detect Markdown Table row
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            if (!currentTable) currentTable = [];
            // Skip separator line |---|---|
            if (!trimmed.match(/^\|[\s\-:|]+\|$/)) {
                const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
                currentTable.push(cells);
            }
            return;
        } else if (currentTable) {
            blocks.push({ type: 'table', rows: currentTable });
            currentTable = null;
        }

        // Detect Headings
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
            const level = trimmed.startsWith('### ') ? 3 : trimmed.startsWith('## ') ? 2 : 1;
            const headingText = trimmed.replace(/^#+\s*/, '');
            blocks.push({ type: 'heading', level, text: headingText });
            return;
        }

        // Detect Bullet Points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.substring(2);
            blocks.push({ type: 'bullet', text: bulletText });
            return;
        }

        // Standard Paragraph line
        if (trimmed.length > 0) {
            blocks.push({ type: 'p', text: trimmed });
        }
    });

    if (currentTable) {
        blocks.push({ type: 'table', rows: currentTable });
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {blocks.map((block, idx) => {
                if (block.type === 'heading') {
                    return (
                        <h4 key={idx} style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '12px 0 4px 0' }}>
                            {renderInline(block.text)}
                        </h4>
                    );
                }
                if (block.type === 'bullet') {
                    return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginLeft: '4px', fontSize: '13px' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>•</span>
                            <span>{renderInline(block.text)}</span>
                        </div>
                    );
                }
                if (block.type === 'table') {
                    const headers = block.rows[0] || [];
                    const dataRows = block.rows.slice(1);
                    return (
                        <div key={idx} style={{ overflowX: 'auto', margin: '10px 0', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', backgroundColor: '#ffffff' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                                        {headers.map((h, hIdx) => (
                                            <th key={hIdx} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '650', color: '#334155' }}>
                                                {renderInline(h)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataRows.map((r, rIdx) => (
                                        <tr key={rIdx} style={{ borderBottom: rIdx === dataRows.length - 1 ? 'none' : '1px solid #f1f5f9', backgroundColor: rIdx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                                            {r.map((c, cIdx) => (
                                                <td key={cIdx} style={{ padding: '8px 12px', color: '#0f172a' }}>
                                                    {renderInline(c)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                return (
                    <p key={idx} style={{ margin: '2px 0', fontSize: '13.5px', color: '#0f172a', lineHeight: '1.5' }}>
                        {renderInline(block.text)}
                    </p>
                );
            })}
        </div>
    );
}

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
    return <FormattedMarkdownText text={displayedText} />;
}

function getCleanTextAndChart(text) {
    if (!text) return { cleanText: "", chartData: null };
    
    let chartData = null;
    const chartRegex = /```chart\s*([\s\S]*?)\s*```/g;
    let match;
    
    // Parse the last valid chart block in text
    while ((match = chartRegex.exec(text)) !== null) {
        try {
            chartData = JSON.parse(match[1].trim());
        } catch (e) {
            console.error("Failed to parse chart block:", e);
        }
    }

    // Strip ALL ```chart ... ``` blocks completely from cleanText
    const cleanText = text.replace(/```chart\s*[\s\S]*?\s*```/g, '').trim();
    return { cleanText, chartData };
}

export default function ChatArea({ messages }) {
    const scrollBottomRef = useRef(null);

    useEffect(() => {
        scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', backgroundColor: 'transparent' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => {
                        const isUser = msg.sender === 'user';
                        const isLast = index === messages.length - 1;
                        
                        const { cleanText, chartData } = getCleanTextAndChart(msg.text);

                        let pieData = null;
                        let xyData = null;
                        const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

                        if (chartData) {
                            if (chartData.type === 'pie') {
                                pieData = (chartData.labels || []).map((lbl, idx) => ({
                                    name: lbl,
                                    value: (chartData.values || [])[idx] || 0
                                }));
                            } else {
                                xyData = (chartData.xAxis || []).map((xVal, idx) => {
                                    const row = { name: xVal };
                                    (chartData.series || []).forEach(s => {
                                        row[s.name] = (s.data || [])[idx];
                                    });
                                    return row;
                                });
                            }
                        }

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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
                                        {!isUser && (
                                            <span style={{ 
                                                width: '6px', height: '6px', borderRadius: '50%', 
                                                backgroundColor: '#3b82f6', boxShadow: '0 0 8px #3b82f6' 
                                            }} />
                                        )}
                                        <span style={{ fontSize: '11.5px', fontWeight: '650', color: '#475569', letterSpacing: '-0.1px' }}>
                                            {isUser ? 'Workspace Executive' : 'Magna System Agent'}
                                        </span>
                                        <span style={{ 
                                            fontSize: '9.5px', padding: '1px 6px', borderRadius: '50px', 
                                            backgroundColor: isUser ? 'rgba(15, 23, 42, 0.05)' : 'rgba(59, 130, 246, 0.08)', 
                                            border: isUser ? '1px solid rgba(15, 23, 42, 0.04)' : '1px solid rgba(59, 130, 246, 0.12)', 
                                            color: isUser ? '#475569' : '#2563eb', fontWeight: '600' 
                                        }}>
                                            {isUser ? 'Prompt' : 'Engine Response'}
                                        </span>
                                    </div>

                                    <div style={{
                                        padding: '14px 18px',
                                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        backgroundColor: isUser ? '#ffffff' : 'rgba(255, 255, 255, 0.55)',
                                        backdropFilter: isUser ? 'none' : 'blur(20px)',
                                        border: isUser ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.6)',
                                        boxShadow: isUser 
                                            ? '0 4px 12px -2px rgba(15, 23, 42, 0.03), inset 0 1px 0px #ffffff' 
                                            : '0 8px 24px -6px rgba(15, 23, 42, 0.05), inset 0 1px 0px rgba(255, 255, 255, 0.8)',
                                        textAlign: 'left',
                                        position: 'relative',
                                        width: chartData ? '560px' : 'auto',
                                        maxWidth: '100%'
                                    }}>
                                        <div style={{ 
                                            fontSize: '13.5px', 
                                            lineHeight: '1.6', 
                                            color: '#0f172a',
                                            letterSpacing: '-0.1px'
                                        }}>
                                            {!isUser && isLast ? (
                                                <StreamingText text={cleanText} />
                                            ) : (
                                                <FormattedMarkdownText text={cleanText} />
                                            )}
                                        </div>

                                        {chartData && (
                                            <div style={{ 
                                                height: '280px', 
                                                width: '100%', 
                                                marginTop: '16px', 
                                                padding: '12px 12px 0 12px',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}>
                                                <h4 style={{ 
                                                    fontSize: '13px', 
                                                    color: '#334155', 
                                                    fontWeight: '600', 
                                                    margin: '0 0 12px 0', 
                                                    textAlign: 'center' 
                                                }}>
                                                    {chartData.title}
                                                </h4>
                                                
                                                {chartData.type === 'pie' && pieData && (
                                                    <ResponsiveContainer width="100%" height={210}>
                                                        <PieChart>
                                                            <Pie
                                                                data={pieData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={55}
                                                                outerRadius={75}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                labelLine={false}
                                                            >
                                                                {pieData.map((entry, idx) => (
                                                                    <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => [`${value}`, 'Quantity/Value']} />
                                                            <Legend verticalAlign="bottom" iconType="circle" height={32} wrapperStyle={{ fontSize: '11px' }} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                )}

                                                {chartData.type === 'line' && xyData && (
                                                    <ResponsiveContainer width="100%" height={210}>
                                                        <LineChart data={xyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                            <XAxis 
                                                                dataKey="name" 
                                                                tick={{ fontSize: 10, fill: '#64748b' }} 
                                                                tickLine={false}
                                                                axisLine={{ stroke: '#cbd5e1' }}
                                                            />
                                                            <YAxis 
                                                                tick={{ fontSize: 10, fill: '#64748b' }} 
                                                                tickLine={false}
                                                                axisLine={{ stroke: '#cbd5e1' }}
                                                            />
                                                            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} />
                                                            <Legend verticalAlign="bottom" height={32} iconType="plainline" wrapperStyle={{ fontSize: '11px' }} />
                                                            {(chartData.series || []).map((s, idx) => (
                                                                <Line 
                                                                    key={s.name} 
                                                                    type="monotone" 
                                                                    dataKey={s.name} 
                                                                    stroke={idx === 0 ? '#3b82f6' : '#10b981'} 
                                                                    strokeWidth={2.5}
                                                                    activeDot={{ r: 5 }} 
                                                                    dot={{ strokeWidth: 2, r: 3 }}
                                                                />
                                                            ))}
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                )}

                                                {chartData.type === 'bar' && xyData && (
                                                    <ResponsiveContainer width="100%" height={210}>
                                                        <BarChart data={xyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                            <XAxis 
                                                                dataKey="name" 
                                                                tick={{ fontSize: 10, fill: '#64748b' }} 
                                                                tickLine={false}
                                                                axisLine={{ stroke: '#cbd5e1' }}
                                                            />
                                                            <YAxis 
                                                                tick={{ fontSize: 10, fill: '#64748b' }} 
                                                                tickLine={false}
                                                                axisLine={{ stroke: '#cbd5e1' }}
                                                            />
                                                            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} />
                                                            <Legend verticalAlign="bottom" height={32} iconType="rect" wrapperStyle={{ fontSize: '11px' }} />
                                                            {(chartData.series || []).map((s, idx) => (
                                                                <Bar 
                                                                    key={s.name} 
                                                                    dataKey={s.name} 
                                                                    fill={idx === 0 ? '#10b981' : '#3b82f6'} 
                                                                    radius={[4, 4, 0, 0]} 
                                                                    maxBarSize={30}
                                                                />
                                                            ))}
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={scrollBottomRef} />
            </div>
        </div>
    );
}
