import React from 'react';
import { Card } from '@/components/components/ui/card';
import { AnimatedNumber, DonutChart } from './Charts';

/**
 * StatCard - Individual stat display card
 */
const StatCard = ({ 
    label, 
    value, 
    subLabel, 
    icon, 
    iconBgColor = 'bg-blue-500/10', 
    iconColor = 'text-blue-500',
    showDonut = false,
    donutMax,
    donutColor,
    valueColor = ''
}) => (
    <Card className="p-4">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-2xl font-bold ${valueColor}`}>
                    <AnimatedNumber value={value} />
                    {donutMax && (
                        <span className="text-sm font-normal text-muted-foreground">/{donutMax}</span>
                    )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{subLabel}</p>
            </div>
            {showDonut ? (
                <DonutChart value={value} max={donutMax} size={70} color={donutColor} />
            ) : (
                <div className={`w-12 h-12 rounded-xl ${iconBgColor} flex items-center justify-center`}>
                    <i className={`${icon} text-xl ${iconColor}`}></i>
                </div>
            )}
        </div>
    </Card>
);

/**
 * StatsRow - Grid of stat cards
 */
const StatsRow = ({ emailStats, campaignStats }) => {
    const DAILY_LIMIT = 500;
    const emailsSentToday = emailStats.sentToday || 0;
    const dailyUsagePercent = Math.round((emailsSentToday / DAILY_LIMIT) * 100);

    return (
        <div className="grid grid-cols-4 gap-4 mb-5">
            {/* Daily Usage */}
            <StatCard
                label="Daily Usage"
                value={emailsSentToday}
                subLabel="emails sent today"
                showDonut={true}
                donutMax={DAILY_LIMIT}
                donutColor={dailyUsagePercent >= 80 ? '#ef4444' : '#3b82f6'}
            />

            {/* Remaining */}
            <StatCard
                label="Remaining"
                value={DAILY_LIMIT - emailsSentToday}
                subLabel={
                    <span className="flex flex-col gap-0.5">
                        <span>via MailPal only</span>
                        <span className="text-[10px] text-amber-500 font-medium flex items-center gap-1">
                            <i className="ri-error-warning-line"></i>
                            Gmail's 500/day limit (all sources)
                        </span>
                    </span>
                }
                icon="ri-inbox-unarchive-line"
                iconBgColor="bg-green-500/10"
                iconColor="text-green-500"
                valueColor="text-green-600"
            />

            {/* Total Sent */}
            <StatCard
                label="Total Sent"
                value={emailStats.totalSent || 0}
                subLabel={
                    <span className="text-green-500">
                        <i className="ri-arrow-up-line"></i> +{emailStats.sentThisWeek || 0} this week
                    </span>
                }
                icon="ri-mail-check-line"
                iconBgColor="bg-cyan-500/10"
                iconColor="text-cyan-500"
            />

            {/* Campaigns */}
            <StatCard
                label="Campaigns"
                value={campaignStats.totalCampaigns || 0}
                subLabel={`${campaignStats.activeCampaigns || 0} active, ${campaignStats.completedCampaigns || 0} completed`}
                icon="ri-megaphone-line"
                iconBgColor="bg-orange-500/10"
                iconColor="text-orange-500"
            />
        </div>
    );
};

export default StatsRow;
export { StatCard };
