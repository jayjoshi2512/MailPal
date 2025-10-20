-- ================================================
-- USEFUL VIEWS
-- ================================================

-- Campaign Analytics View
-- Provides comprehensive analytics for each campaign
CREATE VIEW campaign_analytics AS
SELECT 
    c.id AS campaign_id,
    c.name AS campaign_name,
    c.user_id,
    COUNT(DISTINCT co.id) AS total_contacts,
    COUNT(DISTINCT se.id) AS total_sent,
    COUNT(DISTINCT CASE WHEN se.opened_at IS NOT NULL THEN se.id END) AS total_opened,
    COUNT(DISTINCT CASE WHEN se.clicked_at IS NOT NULL THEN se.id END) AS total_clicked,
    COUNT(DISTINCT CASE WHEN se.replied_at IS NOT NULL THEN se.id END) AS total_replied,
    ROUND(
        COUNT(DISTINCT CASE WHEN se.opened_at IS NOT NULL THEN se.id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT se.id), 0) * 100, 
        2
    ) AS open_rate,
    ROUND(
        COUNT(DISTINCT CASE WHEN se.clicked_at IS NOT NULL THEN se.id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT se.id), 0) * 100, 
        2
    ) AS click_rate,
    ROUND(
        COUNT(DISTINCT CASE WHEN se.replied_at IS NOT NULL THEN se.id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT se.id), 0) * 100, 
        2
    ) AS reply_rate
FROM campaigns c
LEFT JOIN contacts co ON c.id = co.campaign_id
LEFT JOIN sent_emails se ON c.id = se.campaign_id
GROUP BY c.id, c.name, c.user_id;
