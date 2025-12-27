import Link from "next/link";
import LogoMark from "../LogoMark";

interface DashboardCardButton {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

interface DashboardCardProps {
    icon?: string;
    iconSrc?: string;
    title: string;
    description: string;
    // Support both single button (backward compatibility) and multiple buttons
    buttonText?: string;
    href?: string;
    buttons?: DashboardCardButton[];
    className?: string;
}

export default function DashboardCard({
    icon,
    iconSrc,
    title,
    description,
    buttonText,
    href,
    buttons,
    className = ""
}: DashboardCardProps) {
    // Determine which buttons to render
    const buttonsToRender = buttons || (buttonText && href ? [{ text: buttonText, href, variant: 'primary' as const }] : []);

    const getButtonClassName = (variant: string = 'primary') => {
        switch (variant) {
            case 'secondary':
                return 'btn-minion-secondary';
            case 'success':
                return 'btn-minion-success';
            case 'danger':
                return 'btn-minion-danger';
            default:
                return 'btn-minion';
        }
    };

    const renderIcon = () => {
        if (iconSrc) {
            return (
                <LogoMark
                    size={40}
                    className="mx-auto"
                    src={iconSrc}
                    alt={`${title} icon`}
                    rounded={false}
                />
            );
        }

        if (icon) {
            return <span>{icon}</span>;
        }

        return <LogoMark size={40} className="mx-auto" alt="StayScan logo" />;
    };

    return (
        <div className={`card-minion text-center flex flex-col h-full ${className}`}>
            <div className="text-4xl mb-4 flex justify-center">
                {renderIcon()}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4 flex-grow">
                {description}
            </p>
            {buttonsToRender.length > 0 && (
                <div className="mt-auto space-y-2">
                    {buttonsToRender.length === 1 ? (
                        <Link href={buttonsToRender[0].href} className={getButtonClassName(buttonsToRender[0].variant)}>
                            {buttonsToRender[0].text}
                        </Link>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {buttonsToRender.map((button, index) => (
                                <Link
                                    key={index}
                                    href={button.href}
                                    className={`${getButtonClassName(button.variant)} text-sm`}
                                >
                                    {button.text}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
