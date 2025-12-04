import React, { useState, useEffect } from 'react';

/**
 * AnimatedNumber - Animates a number on page load/reload
 */
export const AnimatedNumber = ({ value, duration = 1000 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [shouldAnimate, setShouldAnimate] = useState(true);
    
    useEffect(() => {
        const navigationType = performance.getEntriesByType('navigation')[0]?.type;
        const lastPath = sessionStorage.getItem('dashboard_last_path');
        const currentPath = window.location.pathname;
        const isSPANavigation = lastPath && lastPath !== currentPath;
        
        sessionStorage.setItem('dashboard_last_path', currentPath);
        
        if (isSPANavigation && currentPath === '/dashboard') {
            setDisplayValue(value);
            setShouldAnimate(false);
            return;
        }
        
        if (!shouldAnimate) {
            setDisplayValue(value);
            return;
        }
        
        let startTime;
        const startValue = 0;
        const endValue = value;
        
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            setDisplayValue(Math.round(startValue + (endValue - startValue) * easeOutQuad));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setShouldAnimate(false);
            }
        };
        
        requestAnimationFrame(animate);
    }, [value, duration, shouldAnimate]);
    
    return <span>{displayValue}</span>;
};

/**
 * AreaChart - Simple SVG area chart
 */
export const AreaChart = ({ data, color = '#3b82f6', height = 80 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-end gap-1.5" style={{ height }}>
                {[...Array(14)].map((_, i) => (
                    <div key={i} className="flex-1 bg-muted/20 rounded-t" style={{ height: '20%' }}></div>
                ))}
            </div>
        );
    }
    
    const values = data.map(d => d.count || 0);
    const maxValue = Math.max(...values, 1);
    const width = 200;
    const chartHeight = height;
    const padding = 5;
    
    // Handle edge case where there's only 1 data point
    const divisor = values.length > 1 ? values.length - 1 : 1;
    
    const points = values.map((v, i) => {
        const x = values.length === 1 ? width / 2 : (i / divisor) * width;
        const y = chartHeight - padding - (v / maxValue) * (chartHeight - padding * 2);
        return { x, y, value: v };
    });
    
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${width} ${chartHeight} L 0 ${chartHeight} Z`;
    
    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full" style={{ height }} preserveAspectRatio="none">
                <path d={areaPath} fill={color} fillOpacity="0.1" />
                <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                    <g key={i} className="group cursor-pointer">
                        <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
                        <circle cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <rect x={p.x - 15} y={p.y - 22} width="30" height="16" rx="3" fill="currentColor" className="text-popover" />
                            <text x={p.x} y={p.y - 11} textAnchor="middle" fontSize="8" fill="currentColor" className="text-popover-foreground">{p.value}</text>
                        </g>
                    </g>
                ))}
            </svg>
        </div>
    );
};

/**
 * DonutChart - Circular progress chart
 */
export const DonutChart = ({ value, max, size = 100, color = '#3b82f6' }) => {
    const percent = Math.min((value / max) * 100, 100);
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;
    
    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/10" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{Math.round(percent)}%</span>
            </div>
        </div>
    );
};

/**
 * ActivityHeatmap - GitHub-style contribution heatmap
 */
export const ActivityHeatmap = ({ data, color = '#3b82f6' }) => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = data?.find(d => d.date?.split('T')[0] === dateStr);
        days.push({
            date: dateStr,
            count: dayData?.count || 0,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
        });
    }
    
    const maxCount = Math.max(...days.map(d => d.count), 1);
    
    const getOpacity = (count) => {
        if (count === 0) return 0.1;
        return 0.2 + (count / maxCount) * 0.8;
    };
    
    return (
        <div className="flex gap-1">
            {days.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                        className="w-full aspect-square rounded-sm transition-all duration-300 hover:scale-110 cursor-pointer relative group"
                        style={{ backgroundColor: color, opacity: getOpacity(day.count) }}
                        title={`${day.count} emails on ${new Date(day.date).toLocaleDateString()}`}
                    >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[9px] px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border">
                            {day.count} sent
                        </div>
                    </div>
                    <span className="text-[8px] text-muted-foreground">{day.dayName}</span>
                </div>
            ))}
        </div>
    );
};

export default { AnimatedNumber, AreaChart, DonutChart, ActivityHeatmap };
