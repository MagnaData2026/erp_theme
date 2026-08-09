// magna_ai_assistant/ChatArea.jsx
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Theme-adaptive categorical palette for chart series/slices. The first
// color always follows the active theme's primary color via color-mix();
// the rest are fixed accent hues used only to tell data series apart.
const CHART_PALETTE = [
    'var(--primary-color, #6366f1)',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#0ea5e9'
];

function FormattedMarkdownText({ text }) {
    if (!text) return null;

    // Helper to render inline formatting like **bold**
    const renderInline = (str) => {
        if (!str) return null;
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                return (
                    <strong key={i} style={{ fontWeight: '650', color: 'var(--text-color, #0f172a)' }}>
                        {part.slice(2, -2)}
                    </strong>
                );
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
                        <h4 key={idx} style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-color, #0f172a)', margin: '12px 0 4px 0' }}>
                            {renderInline(block.text)}
                        </h4>
                    );
                }
                if (block.type === 'bullet') {
                    return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginLeft: '4px', fontSize: '13px' }}>
                            <span style={{ color: 'var(--primary-color, #6366f1)', fontWeight: 'bold' }}>•</span>
                            <span>{renderInline(block.text)}</span>
                        </div>
                    );
                }
                if (block.type === 'table') {
                    const CELL_BORDER = '1px solid var(--border-color, #cbd5e1)';
                    const headers = block.rows[0] || [];
                    const dataRows = block.rows.slice(1);
                    return (
                        <div key={idx} style={{ overflowX: 'auto', margin: '10px 0' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px', backgroundColor: 'var(--control-bg, var(--card-bg, #f8fafc))', border: CELL_BORDER, borderRadius: '6px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'color-mix(in srgb, var(--text-color, #0f172a) 6%, transparent)' }}>
                                        {headers.map((h, hIdx) => (
                                            <th key={hIdx} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', color: 'var(--text-color, #0f172a)', border: CELL_BORDER }}>
                                                {renderInline(h)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataRows.map((r, rIdx) => (
                                        <tr key={rIdx}>
                                            {r.map((c, cIdx) => (
                                                <td key={cIdx} style={{ padding: '6px 10px', color: 'var(--text-color, #0f172a)', border: CELL_BORDER }}>
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
                    <p key={idx} style={{ margin: '2px 0', fontSize: '13.5px', color: 'var(--text-color, #0f172a)', lineHeight: '1.5' }}>
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
                // Capture the character before React schedules the update.
                // Otherwise the mutable index may advance first and drop a
                // letter from the displayed response.
                const nextCharacter = text.charAt(index);
                index++;
                setDisplayedText((prev) => prev + nextCharacter);
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

    const sourceText = typeof text === 'string'
        ? text
        : String(text?.answer ?? text?.text ?? text?.content ?? '');

    let chartData = null;
    // Accept the documented ```chart block as well as the ```json block that
    // some model responses put below "Interactive Visual Spec".
    const chartRegex = /```(chart|json)\s*([\s\S]*?)\s*```/gi;
    let match;

    while ((match = chartRegex.exec(sourceText)) !== null) {
        try {
            const candidate = JSON.parse(match[2].trim());
            const looksLikeChart = candidate && typeof candidate === 'object' && (
                ['pie', 'line', 'bar'].includes(candidate.type) ||
                Array.isArray(candidate.series) ||
                Array.isArray(candidate.labels) ||
                Array.isArray(candidate.xAxis)
            );
            if (looksLikeChart) {
                // Legacy responses used { title, labels, values } without a
                // chart type. Convert that shape to the renderer's bar schema.
                chartData = !candidate.type && Array.isArray(candidate.labels) && Array.isArray(candidate.values)
                    ? {
                        type: 'bar',
                        title: candidate.title,
                        xAxis: candidate.labels,
                        series: [{ name: candidate.seriesName || 'Value', data: candidate.values }],
                    }
                    : candidate;
            }
        } catch (e) {
            // Ordinary/invalid JSON is left visible; only valid chart specs
            // are removed from the user-facing answer.
        }
    }

    let cleanText = sourceText;
    if (chartData) {
        cleanText = cleanText
            .replace(/```(?:chart|json)\s*[\s\S]*?\s*```/gi, '')
            .replace(/^\s*(?:#{1,6}\s*)?(?:interactive\s+)?visual\s+spec(?:ification)?\s*:?\s*$/gim, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }
    return { cleanText, chartData };
}

// ---------------------------------------------------------------------
// Lightweight, dependency-free SVG charts.
//
// These replace the previous recharts-based renderer. recharts' internal
// <ResponsiveContainer> relies on React context/hooks that can break with
// an "Invalid hook call" / "Cannot read properties of null (reading
// 'useContext')" crash whenever more than one copy of React ends up on
// the page (a common outcome with Frappe custom-bundle setups). Plain SVG
// has no such dependency, so it can't hit that failure mode — and it
// keeps every color theme-adaptive via CHART_PALETTE / CSS variables.
// ---------------------------------------------------------------------

function ChartLegend({ items }) {
    return (
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
            {items.map((item, i) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length], flexShrink: 0 }} />
                    {item}
                </div>
            ))}
        </div>
    );
}

function PieChartSVG({ data, size = 180 }) {
    const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0) || 1;
    const radius = size / 2;
    const innerRadius = radius * 0.55;
    let cumulative = 0;

    const slices = data.map((d, idx) => {
        const value = Number(d.value) || 0;
        const startAngle = (cumulative / total) * 2 * Math.PI;
        cumulative += value;
        const endAngle = (cumulative / total) * 2 * Math.PI;
        const large = endAngle - startAngle > Math.PI ? 1 : 0;

        const x1 = radius + radius * Math.sin(startAngle);
        const y1 = radius - radius * Math.cos(startAngle);
        const x2 = radius + radius * Math.sin(endAngle);
        const y2 = radius - radius * Math.cos(endAngle);
        const ix1 = radius + innerRadius * Math.sin(startAngle);
        const iy1 = radius - innerRadius * Math.cos(startAngle);
        const ix2 = radius + innerRadius * Math.sin(endAngle);
        const iy2 = radius - innerRadius * Math.cos(endAngle);

        const path = value <= 0 ? '' : `M ${ix1} ${iy1} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${ix1} ${iy1} Z`;

        return {
            path,
            color: CHART_PALETTE[idx % CHART_PALETTE.length],
            name: d.name,
            value,
            pct: total ? ((value / total) * 100).toFixed(0) : 0
        };
    });

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {slices.map((s, idx) => s.path && (
                    <path key={idx} d={s.path} fill={s.color}>
                        <title>{`${s.name}: ${s.value} (${s.pct}%)`}</title>
                    </path>
                ))}
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {slices.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11.5px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: 'var(--text-color, #0f172a)' }}>{s.name}</span>
                        <span style={{ color: 'var(--text-muted, #64748b)' }}>{s.pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BarChartSVG({ data, seriesKeys, width = 520, height = 210 }) {
    const padding = { top: 12, right: 12, bottom: 28, left: 12 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const maxVal = Math.max(1, ...data.flatMap(d => seriesKeys.map(k => Number(d[k]) || 0)));
    const groupWidth = innerW / Math.max(1, data.length);
    const barGap = 6;
    const barWidth = Math.max(4, (groupWidth - barGap * (seriesKeys.length + 1)) / seriesKeys.length);

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                const y = padding.top + innerH * (1 - t);
                return <line key={i} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="var(--border-color, #e2e8f0)" strokeWidth="1" />;
            })}
            {data.map((d, gi) => {
                const groupX = padding.left + gi * groupWidth;
                return (
                    <g key={gi}>
                        {seriesKeys.map((k, si) => {
                            const val = Number(d[k]) || 0;
                            const barH = (val / maxVal) * innerH;
                            const x = groupX + barGap + si * (barWidth + barGap);
                            const y = padding.top + innerH - barH;
                            return (
                                <rect key={si} x={x} y={y} width={barWidth} height={Math.max(0, barH)} rx="3" fill={CHART_PALETTE[si % CHART_PALETTE.length]}>
                                    <title>{`${k}: ${val}`}</title>
                                </rect>
                            );
                        })}
                        <text x={groupX + groupWidth / 2} y={height - 8} textAnchor="middle" fontSize="9.5" fill="var(--text-muted, #64748b)">
                            {String(d.name).length > 10 ? String(d.name).slice(0, 9) + '…' : d.name}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

function LineChartSVG({ data, seriesKeys, width = 520, height = 210 }) {
    const padding = { top: 12, right: 16, bottom: 28, left: 12 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const maxVal = Math.max(1, ...data.flatMap(d => seriesKeys.map(k => Number(d[k]) || 0)));
    const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

    const pointsFor = (k) => data.map((d, i) => {
        const val = Number(d[k]) || 0;
        return {
            x: padding.left + i * stepX,
            y: padding.top + innerH - (val / maxVal) * innerH,
            val
        };
    });

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                const y = padding.top + innerH * (1 - t);
                return <line key={i} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="var(--border-color, #e2e8f0)" strokeWidth="1" />;
            })}
            {seriesKeys.map((k, si) => {
                const pts = pointsFor(k);
                const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                return (
                    <g key={si}>
                        <path d={d} fill="none" stroke={CHART_PALETTE[si % CHART_PALETTE.length]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {pts.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="3.2" fill={CHART_PALETTE[si % CHART_PALETTE.length]}>
                                <title>{`${k}: ${p.val}`}</title>
                            </circle>
                        ))}
                    </g>
                );
            })}
            {data.map((d, i) => (
                <text key={i} x={padding.left + i * stepX} y={height - 8} textAnchor="middle" fontSize="9.5" fill="var(--text-muted, #64748b)">
                    {String(d.name).length > 10 ? String(d.name).slice(0, 9) + '…' : d.name}
                </text>
            ))}
        </svg>
    );
}

function ChartBlock({ chartData }) {
    if (!chartData) return null;

    const isPie = chartData.type === 'pie';
    const pieData = isPie
        ? (chartData.labels || []).map((lbl, idx) => ({ name: lbl, value: (chartData.values || [])[idx] || 0 }))
        : null;
    const xyData = !isPie
        ? (chartData.xAxis || []).map((xVal, idx) => {
            const row = { name: xVal };
            (chartData.series || []).forEach(s => { row[s.name] = (s.data || [])[idx]; });
            return row;
        })
        : null;
    const seriesKeys = (chartData.series || []).map(s => s.name);

    return (
        <div style={{
            marginTop: '16px',
            padding: '16px 14px 12px 14px',
            backgroundColor: 'var(--control-bg, var(--card-bg, #f8fafc))',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)'
        }}>
            {chartData.title && (
                <h4 style={{ fontSize: '13px', color: 'var(--text-color, #0f172a)', fontWeight: '700', margin: '0 0 14px 0', textAlign: 'center' }}>
                    {chartData.title}
                </h4>
            )}

            {isPie && pieData && <PieChartSVG data={pieData} />}

            {chartData.type === 'line' && xyData && (
                <>
                    <LineChartSVG data={xyData} seriesKeys={seriesKeys} />
                    <ChartLegend items={seriesKeys} />
                </>
            )}

            {chartData.type === 'bar' && xyData && (
                <>
                    <BarChartSVG data={xyData} seriesKeys={seriesKeys} />
                    <ChartLegend items={seriesKeys} />
                </>
            )}
        </div>
    );
}

// AI Thinking Indicator
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
                        backgroundColor: 'var(--primary-color, #6366f1)', boxShadow: '0 0 8px var(--primary-color, #6366f1)'
                    }} />
                    <span style={{ fontSize: '11.5px', fontWeight: '650', color: 'var(--text-muted, #64748b)', letterSpacing: '-0.1px' }}>
                        Magna System Agent
                    </span>
                    <span style={{
                        fontSize: '9.5px', padding: '1px 6px', borderRadius: '50px',
                        backgroundColor: 'color-mix(in srgb, var(--primary-color, #6366f1) 12%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--primary-color, #6366f1) 22%, transparent)',
                        color: 'var(--primary-color, #6366f1)', fontWeight: '600'
                    }}>
                        Thinking...
                    </span>
                </div>

                {/* Thinking Card — solid, theme-adaptive, no blur */}
                <div style={{
                    padding: '12px 18px',
                    borderRadius: '18px 18px 18px 4px',
                    backgroundColor: 'var(--control-bg, var(--card-bg, #f8fafc))',
                    border: '1px solid var(--border-color, rgba(148, 163, 184, 0.15))',
                    boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-color, #0f172a)' }}>
                        Magna AI is thinking
                    </span>

                    {/* Pulsing Dots Animation */}
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
                                    backgroundColor: 'var(--primary-color, #6366f1)',
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

export default function ChatArea({ messages = [], isThinking }) {
    const scrollBottomRef = useRef(null);

    // Auto-detect thinking state: If last message in list was sent by 'user' OR explicitly passed via isThinking
    const lastMsg = messages[messages.length - 1];
    const showThinking = isThinking !== undefined ? isThinking : (lastMsg && lastMsg.sender === 'user');

    useEffect(() => {
        scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showThinking]);

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', backgroundColor: 'transparent' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => {
                        const isUser = msg.sender === 'user';
                        const isLast = index === messages.length - 1;
                        const { cleanText, chartData } = getCleanTextAndChart(msg.text);

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
                                                backgroundColor: 'var(--primary-color, #6366f1)', boxShadow: '0 0 8px var(--primary-color, #6366f1)'
                                            }} />
                                        )}
                                        <span style={{ fontSize: '11.5px', fontWeight: '650', color: 'var(--text-muted, #64748b)', letterSpacing: '-0.1px' }}>
                                            {isUser ? 'Workspace Executive' : 'Magna System Agent'}
                                        </span>
                                        <span style={{
                                            fontSize: '9.5px', padding: '1px 6px', borderRadius: '50px',
                                            backgroundColor: isUser
                                                ? 'var(--border-color, rgba(148, 163, 184, 0.15))'
                                                : 'color-mix(in srgb, var(--primary-color, #6366f1) 12%, transparent)',
                                            border: isUser
                                                ? '1px solid var(--border-color, rgba(148, 163, 184, 0.2))'
                                                : '1px solid color-mix(in srgb, var(--primary-color, #6366f1) 22%, transparent)',
                                            color: isUser ? 'var(--text-muted, #64748b)' : 'var(--primary-color, #6366f1)',
                                            fontWeight: '600'
                                        }}>
                                            {isUser ? 'Prompt' : 'Engine Response'}
                                        </span>
                                    </div>

                                    {/* Message Bubble — solid, theme-adaptive, no blur */}
                                    <div style={{
                                        padding: '14px 18px',
                                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        backgroundColor: isUser
                                            ? 'color-mix(in srgb, var(--primary-color, #6366f1) 10%, transparent)'
                                            : 'var(--control-bg, var(--card-bg, #f8fafc))',
                                        border: isUser
                                            ? '1px solid color-mix(in srgb, var(--primary-color, #6366f1) 25%, transparent)'
                                            : '1px solid var(--border-color, rgba(148, 163, 184, 0.15))',
                                        boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.05)',
                                        textAlign: 'left',
                                        position: 'relative',
                                        width: chartData ? '560px' : 'auto',
                                        maxWidth: '100%'
                                    }}>
                                        <div style={{
                                            fontSize: '13.5px',
                                            lineHeight: '1.6',
                                            color: 'var(--text-color, #0f172a)',
                                            letterSpacing: '-0.1px'
                                        }}>
                                            {!isUser && isLast ? (
                                                <StreamingText text={cleanText} />
                                            ) : (
                                                <FormattedMarkdownText text={cleanText} />
                                            )}
                                        </div>

                                        <ChartBlock chartData={chartData} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Show Thinking Card when AI is processing */}
                    {showThinking && <ThinkingIndicator key="thinking-state" />}
                </AnimatePresence>
                <div ref={scrollBottomRef} />
            </div>
        </div>
    );
}
