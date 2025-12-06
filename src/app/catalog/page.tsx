import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CatalogContent from '@/components/products/CatalogContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function CatalogFallback() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    );
}

export default function CatalogPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <Suspense fallback={<CatalogFallback />}>
                <CatalogContent />
            </Suspense>
            <Footer />
        </div>
    );
}