import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NumberedPaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
    onPageChange: (page: number) => void;
    compact?: boolean;
}

function getPageNumbers(current: number, last: number): (number | '...')[] {
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(last - 1, current + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (current < last - 2) pages.push('...');

    pages.push(last);

    return pages;
}

export default function NumberedPagination({
    currentPage,
    lastPage,
    total,
    onPageChange,
    compact = false,
}: NumberedPaginationProps) {
    if (lastPage <= 1) return null;

    const pages = getPageNumbers(currentPage, lastPage);

    const btnBase = compact
        ? 'h-6 min-w-6 px-1 text-[11px]'
        : 'h-8 min-w-8 px-2 text-sm';

    const btnClass = `${btnBase} rounded border border-border inline-flex items-center justify-center transition-colors`;

    return (
        <div className={`flex items-center ${compact ? 'justify-center gap-1' : 'justify-between'}`}>
            {!compact && (
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {lastPage} &mdash; {total} records
                </span>
            )}
            <div className={`flex items-center ${compact ? 'gap-0.5' : 'gap-1'}`}>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`${btnClass} hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    <ChevronLeft className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                </button>

                {pages.map((p, idx) =>
                    p === '...' ? (
                        <span key={`ellipsis-${idx}`} className={`${btnBase} inline-flex items-center justify-center text-muted-foreground`}>
                            ...
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`${btnClass} ${
                                p === currentPage
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'hover:bg-muted'
                            }`}
                        >
                            {p}
                        </button>
                    ),
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= lastPage}
                    className={`${btnClass} hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    <ChevronRight className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                </button>
            </div>
        </div>
    );
}
