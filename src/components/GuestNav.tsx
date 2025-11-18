"use client";

import Link from "next/link";
import LogoMark from "./LogoMark";

interface GuestNavProps {
    title: string;
    subtitle?: string;
    iconSrc?: string;
    backLink?: {
        href: string;
        label: string;
    };
    actions?: React.ReactNode;
    rightInfo?: React.ReactNode;
}

const GuestNav = ({
    title,
    subtitle,
    iconSrc = "/icon.png",
    backLink,
    actions,
    rightInfo
}: GuestNavProps) => {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-3">
                {/* Mobile Layout */}
                <div className="flex flex-col space-y-3 sm:hidden">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-minion-yellow rounded-full flex items-center justify-center flex-shrink-0">
                                <LogoMark size={24} rounded={false} src={iconSrc} alt={`${title} icon`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg font-bold text-gray-800 truncate">{title}</h1>
                                {subtitle && (
                                    <p className="text-sm text-gray-600 truncate">{subtitle}</p>
                                )}
                            </div>
                        </div>
                        {rightInfo && (
                            <div className="flex-shrink-0 text-right">
                                {rightInfo}
                            </div>
                        )}
                    </div>
                    {actions && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {actions}
                        </div>
                    )}
                    {backLink && (
                        <div className="text-center">
                            <Link
                                href={backLink.href}
                                className="text-minion-blue hover:underline text-sm"
                            >
                                {backLink.label}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-minion-yellow rounded-full flex items-center justify-center">
                            <LogoMark size={28} rounded={false} src={iconSrc} alt={`${title} icon`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                            {subtitle && (
                                <p className="text-gray-600">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {actions}
                        {rightInfo}
                        {backLink && (
                            <Link
                                href={backLink.href}
                                className="text-minion-blue hover:underline"
                            >
                                {backLink.label}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default GuestNav;
