import React from 'react';
import Skeleton from './Skeleton';

export default function FoodCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-[#D1FAE5] overflow-hidden shadow-sm flex flex-col">
            {/* Image area */}
            <Skeleton className="h-48 w-full rounded-t-2xl" />

            {/* Card Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-16" />
                    </div>

                    {/* Restaurant */}
                    <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>

                    {/* Location Info */}
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="h-3 w-1/4" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                </div>

                {/* Footer / Pricing & CTA */}
                <div className="flex items-center justify-between mt-auto">
                    <Skeleton className="h-7 w-20 rounded-md" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                </div>
            </div>
        </div>
    );
}
