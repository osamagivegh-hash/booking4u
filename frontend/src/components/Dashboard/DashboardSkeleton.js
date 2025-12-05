import React from 'react';

/**
 * Skeleton loading component for dashboard cards and sections
 */

// Skeleton base component with pulse animation
const SkeletonBase = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// Stats card skeleton
export const StatsCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
            <SkeletonBase className="w-12 h-12 rounded-lg" />
            <div className="mr-4 flex-1">
                <SkeletonBase className="h-4 w-24 mb-2" />
                <SkeletonBase className="h-8 w-16" />
            </div>
        </div>
    </div>
);

// Stats grid skeleton (4 cards)
export const StatsGridSkeleton = ({ count = 4 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(count)].map((_, i) => (
            <StatsCardSkeleton key={i} />
        ))}
    </div>
);

// Table row skeleton
export const TableRowSkeleton = ({ columns = 5 }) => (
    <tr className="hover:bg-gray-50">
        {[...Array(columns)].map((_, i) => (
            <td key={i} className="px-6 py-4 whitespace-nowrap">
                <SkeletonBase className="h-4 w-full max-w-[120px]" />
            </td>
        ))}
    </tr>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
            <SkeletonBase className="h-6 w-40" />
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {[...Array(columns)].map((_, i) => (
                            <th key={i} className="px-6 py-3">
                                <SkeletonBase className="h-4 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {[...Array(rows)].map((_, i) => (
                        <TableRowSkeleton key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// Quick action card skeleton
export const QuickActionSkeleton = () => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
            <SkeletonBase className="w-10 h-10 rounded-lg" />
            <div className="mr-4 flex-1">
                <SkeletonBase className="h-5 w-32 mb-2" />
                <SkeletonBase className="h-4 w-40" />
            </div>
        </div>
    </div>
);

// Quick actions grid skeleton
export const QuickActionsGridSkeleton = ({ count = 3 }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(count)].map((_, i) => (
            <QuickActionSkeleton key={i} />
        ))}
    </div>
);

// Service card skeleton
export const ServiceCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
        <SkeletonBase className="w-full h-48" />
        <div className="p-4">
            <SkeletonBase className="h-6 w-3/4 mb-2" />
            <SkeletonBase className="h-4 w-full mb-2" />
            <SkeletonBase className="h-4 w-1/2 mb-4" />
            <div className="flex justify-between items-center">
                <SkeletonBase className="h-6 w-20" />
                <SkeletonBase className="h-8 w-24 rounded-md" />
            </div>
        </div>
    </div>
);

// Services grid skeleton
export const ServicesGridSkeleton = ({ count = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(count)].map((_, i) => (
            <ServiceCardSkeleton key={i} />
        ))}
    </div>
);

// Full dashboard skeleton
export const DashboardSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header skeleton */}
            <div className="mb-8">
                <SkeletonBase className="h-8 w-48 mb-2" />
                <SkeletonBase className="h-5 w-32" />
            </div>

            {/* Stats skeleton */}
            <StatsGridSkeleton />

            {/* Quick actions skeleton */}
            <QuickActionsGridSkeleton />

            {/* Table skeleton */}
            <TableSkeleton />
        </div>
    </div>
);

export default {
    StatsCardSkeleton,
    StatsGridSkeleton,
    TableRowSkeleton,
    TableSkeleton,
    QuickActionSkeleton,
    QuickActionsGridSkeleton,
    ServiceCardSkeleton,
    ServicesGridSkeleton,
    DashboardSkeleton
};
