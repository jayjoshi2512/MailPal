import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/components/ui/tabs';

const TemplatesFilters = ({ 
    activeSection, 
    setActiveSection, 
    category, 
    setCategory, 
    searchQuery, 
    setSearchQuery,
    featuredCategory,
    setFeaturedCategory,
    featuredCategories
}) => {
    return (
        <div className="flex items-center gap-3 mb-5">
            {/* Section Toggle */}
            <div className="flex bg-muted/50 rounded-lg p-1">
                <button
                    onClick={() => setActiveSection('featured')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                        activeSection === 'featured' 
                            ? 'bg-background shadow text-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <i className="ri-star-line mr-1.5"></i>
                    Featured
                </button>
                <button
                    onClick={() => setActiveSection('my-templates')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                        activeSection === 'my-templates' 
                            ? 'bg-background shadow text-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <i className="ri-user-line mr-1.5"></i>
                    My Templates
                </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border"></div>

            {/* Type Filter */}
            <Tabs value={category} onValueChange={setCategory}>
                <TabsList className="h-9">
                    <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                    <TabsTrigger value="campaign" className="text-xs px-3">Campaign</TabsTrigger>
                    <TabsTrigger value="compose" className="text-xs px-3">Compose</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Search */}
            <div className="relative w-180">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none"></i>
                <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-8 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        type="button"
                    >
                        <i className="ri-close-line text-sm"></i>
                    </button>
                )}
            </div>

            {/* Category Filter - only for featured */}
            {activeSection === 'featured' && (
                <select
                    value={featuredCategory}
                    onChange={(e) => setFeaturedCategory(e.target.value)}
                    className="h-9 px-3 rounded-md border bg-background text-xs min-w-[140px]"
                >
                    {featuredCategories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat === 'all' ? 'All Categories' : cat}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default TemplatesFilters;
