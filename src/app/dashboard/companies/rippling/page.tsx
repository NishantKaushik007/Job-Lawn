// src/app/page.tsx
import { Suspense } from 'react';
import Rippling from './Rippling';

export default async function Page() {
    // This will render the main application
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                {/* Pass the selected company */}
                <Rippling selectedCompany="Rippling" />
            </Suspense>
        </div>
    );
}
