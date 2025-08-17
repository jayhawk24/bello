#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// List of pages that need suspense boundary fixes
const pages = [
    'src/app/guest/dashboard/page.tsx',
    'src/app/guest/booking-id/page.tsx',
    'src/app/guest/requests/page.tsx',
    'src/app/guest/room/page.tsx',
    'src/app/guest/services/page.tsx'
];

function addSuspenseToPage(filePath) {
    const fullPath = path.join(__dirname, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if already has Suspense
    if (content.includes('Suspense') && content.includes('export default function')) {
        console.log(`${filePath} already has suspense wrapper`);
        return;
    }
    
    // Add Suspense import if not present
    if (!content.includes('Suspense')) {
        content = content.replace(
            'import { useState',
            'import { useState, Suspense'
        );
        content = content.replace(
            'import { useEffect',
            'import { useEffect, Suspense'
        );
        content = content.replace(
            'import { useSession',
            'import { useSession, Suspense'
        );
        // If no existing imports with curly braces, add as separate import
        if (!content.includes(', Suspense')) {
            content = content.replace(
                'import React from "react";',
                'import React, { Suspense } from "react";'
            );
            if (!content.includes(', Suspense')) {
                const lines = content.split('\n');
                const firstImportIndex = lines.findIndex(line => line.startsWith('import'));
                if (firstImportIndex >= 0) {
                    lines.splice(firstImportIndex, 0, 'import { Suspense } from "react";');
                    content = lines.join('\n');
                }
            }
        }
    }
    
    // Find the export default function
    const exportMatch = content.match(/export default function (\w+)\(/);
    if (exportMatch) {
        const functionName = exportMatch[1];
        const componentName = functionName.replace('Page', 'Component');
        
        // Rename the main function
        content = content.replace(
            `export default function ${functionName}(`,
            `function ${componentName}(`
        );
        
        // Add new export with suspense wrapper at the end
        const lastClosingBrace = content.lastIndexOf('}');
        const beforeLastBrace = content.substring(0, lastClosingBrace);
        const afterLastBrace = content.substring(lastClosingBrace);
        
        const suspenseWrapper = `
export default function ${functionName}() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <${componentName} />
        </Suspense>
    );
}`;
        
        content = beforeLastBrace + afterLastBrace + suspenseWrapper;
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
}

// Process all pages
pages.forEach(addSuspenseToPage);

console.log('All pages fixed!');
