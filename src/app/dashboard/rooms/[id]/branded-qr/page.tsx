import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQRCodeData } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

interface BrandedQRPageProps {
    params: Promise<{
        id: string;
    }>;
}

export const metadata: Metadata = {
    title: "Room QR Placard | StayScan",
    description: "Branded QR placard for StayScan guest room services."
};

export default async function BrandedQRCodePage({ params }: BrandedQRPageProps) {
    const { id: roomId } = await params;
    const session = await auth();

    if (!session) {
        redirect(`/login?callbackUrl=${encodeURIComponent(`/dashboard/rooms/${roomId}/branded-qr`)}`);
    }

    if (!['hotel_admin', 'hotel_staff'].includes(session.user.role)) {
        redirect("/dashboard");
    }

    let hotelId = session.user.hotelId ?? undefined;

    if (session.user.role === "hotel_admin" && !hotelId) {
        const hotel = await prisma.hotel.findFirst({
            where: { adminId: session.user.id }
        });

        if (!hotel) {
            notFound();
        }

        hotelId = hotel.id;
    }

    if (!hotelId) {
        notFound();
    }

    const room = await prisma.room.findFirst({
        where: {
            id: roomId,
            hotelId
        },
        include: {
            hotel: true
        }
    });

    if (!room) {
        notFound();
    }

    const roomTypeLabel = room.roomType || "Guest Room";
    const qrData = generateQRCodeData(room.hotelId, room.roomNumber, room.accessCode);
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrData)}&color=1f2937&bgcolor=ffffff&ecc=Q`;

    const styles = `
    .stayscan-branded-qr {
        --accent-primary: #7c3aed;
        --accent-secondary: #38bdf8;
        --accent-muted: rgba(124, 58, 237, 0.12);
        --surface: rgba(248, 250, 252, 0.92);
        --text-primary: #0f172a;
        --text-secondary: #475569;
        min-height: 100vh;
        padding: 64px 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background: radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.32), transparent 55%), radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.28), transparent 50%), #0b1120;
        color: var(--text-primary);
        font-family: "Inter", "Segoe UI", sans-serif;
        overflow-x: hidden;
        overflow-y: auto;
    }
    .stayscan-branded-qr *,
    .stayscan-branded-qr *::before,
    .stayscan-branded-qr *::after {
        box-sizing: border-box;
    }
    .stayscan-aura {
        position: absolute;
        width: 420px;
        height: 420px;
        border-radius: 50%;
        filter: blur(120px);
        opacity: 0.55;
        pointer-events: none;
    }
    .stayscan-aura.one {
        top: -120px;
        left: -120px;
        background: rgba(56, 189, 248, 0.55);
    }
    .stayscan-aura.two {
        bottom: -140px;
        right: -140px;
        background: rgba(124, 58, 237, 0.6);
    }
    .stayscan-print-button {
        position: fixed;
        top: 28px;
        right: 28px;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        border-radius: 999px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: #ffffff;
        font-weight: 600;
        font-size: 15px;
        border: none;
        cursor: pointer;
        box-shadow: 0 18px 40px rgba(99, 102, 241, 0.35);
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        z-index: 10;
    }
    .stayscan-print-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 22px 44px rgba(99, 102, 241, 0.45);
    }
    .stayscan-print-button:focus-visible {
        outline: 3px solid rgba(56, 189, 248, 0.6);
        outline-offset: 3px;
    }
    .stayscan-print-button.print-success {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        box-shadow: 0 18px 40px rgba(34, 197, 94, 0.45);
    }
    .stayscan-print-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
    }
    .stayscan-qr-card {
        width: min(760px, 100%);
        background: var(--surface);
        border-radius: 28px;
        padding: 48px;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.35);
        backdrop-filter: blur(18px);
        border: 1px solid rgba(148, 163, 184, 0.12);
        position: relative;
    }
    .stayscan-qr-card::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        border: 1px solid rgba(56, 189, 248, 0.22);
        mask: linear-gradient(#fff, transparent 35%);
        pointer-events: none;
    }
    .stayscan-card-header {
        display: flex;
        align-items: center;
        gap: 24px;
    }
    .stayscan-brand-badge {
        width: 72px;
        height: 72px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(129, 140, 248, 0.4));
        display: flex;
        align-items: center;
        justify-content: center;
        color: #312e81;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
    }
    .stayscan-brand-badge svg {
        width: 36px;
        height: 36px;
    }
    .stayscan-hotel-label {
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 11px;
        color: #6366f1;
        margin: 0 0 8px 0;
    }
    .stayscan-hotel-name {
        margin: 0;
        font-size: 32px;
        font-weight: 700;
        line-height: 1.2;
        color: var(--text-primary);
    }
    .stayscan-room-code {
        margin: 10px 0 0 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--text-secondary);
    }
    .stayscan-cta-ribbon {
        margin-top: 32px;
        border-radius: 18px;
        padding: 18px 26px;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(244, 114, 182, 0.22));
        display: flex;
        align-items: center;
        gap: 16px;
        font-weight: 600;
        color: #312e81;
    }
    .stayscan-cta-ribbon svg {
        width: 28px;
        height: 28px;
        flex-shrink: 0;
    }
    .stayscan-qr-display {
        margin-top: 36px;
        display: flex;
        justify-content: center;
    }
    .stayscan-qr-frame {
        position: relative;
        padding: 28px;
        border-radius: 24px;
        background: #ffffff;
        border: 2px dashed rgba(99, 102, 241, 0.28);
        box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
    }
    .stayscan-qr-frame::after {
        content: "";
        position: absolute;
        inset: 18px;
        border-radius: 18px;
        border: 1px dashed rgba(148, 163, 184, 0.35);
        pointer-events: none;
    }
    .stayscan-qr-frame img {
        display: block;
        width: 260px;
        height: 260px;
    }
    .stayscan-instruction-section {
        margin-top: 44px;
    }
    .stayscan-instruction-title {
        margin: 0 0 18px 0;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #4338ca;
    }
    .stayscan-instruction-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
        counter-reset: steps;
    }
    .stayscan-instruction-list li {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 16px 18px;
        border-radius: 16px;
        background: rgba(99, 102, 241, 0.08);
        border: 1px solid rgba(99, 102, 241, 0.12);
    }
    .stayscan-step-icon {
        flex-shrink: 0;
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(129, 140, 248, 0.9), rgba(56, 189, 248, 0.9));
        color: #ffffff;
        font-weight: 700;
        font-size: 16px;
        counter-increment: steps;
    }
    .stayscan-step-icon::before {
        content: counter(steps);
    }
    .stayscan-step-body {
        display: flex;
        flex-direction: column;
        gap: 4px;
        color: var(--text-secondary);
        font-size: 15px;
        line-height: 1.5;
    }
    .stayscan-step-title {
        margin: 0;
        font-weight: 600;
        color: var(--text-primary);
    }
    .stayscan-services {
        margin-top: 32px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }
    .stayscan-service-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(226, 232, 240, 0.75);
        color: #1e293b;
        font-weight: 500;
        font-size: 14px;
        border: 1px solid rgba(148, 163, 184, 0.35);
    }
    .stayscan-service-chip svg {
        width: 16px;
        height: 16px;
    }
    @media (max-width: 720px) {
        .stayscan-branded-qr {
            padding: 40px 16px;
        }
        .stayscan-print-button {
            position: static;
            margin-bottom: 24px;
        }
        .stayscan-qr-card {
            padding: 32px 24px;
        }
        .stayscan-card-header {
            flex-direction: column;
            align-items: flex-start;
        }
        .stayscan-qr-frame img {
            width: 220px;
            height: 220px;
        }
    }
    @media print {
        body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .stayscan-branded-qr {
            padding: 16px;
            background: #ffffff !important;
            overflow: visible;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .stayscan-aura,
        .stayscan-print-button {
            display: none !important;
        }
        .stayscan-qr-card {
            box-shadow: none;
            background: var(--surface);
            border: 1px solid #cbd5f5;
            padding: 28px;
            max-width: 640px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .stayscan-qr-card::before {
            display: none;
        }
        .stayscan-card-header {
            gap: 16px;
        }
        .stayscan-brand-badge {
            width: 60px;
            height: 60px;
        }
        .stayscan-hotel-name {
            font-size: 26px;
        }
        .stayscan-room-code {
            margin-top: 6px;
            font-size: 14px;
        }
        .stayscan-cta-ribbon {
            margin-top: 20px;
            padding: 14px 18px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.24), rgba(244, 114, 182, 0.28));
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .stayscan-qr-display {
            margin-top: 24px;
        }
        .stayscan-qr-frame {
            padding: 20px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .stayscan-qr-frame img {
            width: 220px;
            height: 220px;
        }
        .stayscan-instruction-section {
            margin-top: 28px;
        }
        .stayscan-instruction-list li {
            padding: 12px 14px;
            background: rgba(99, 102, 241, 0.12);
            border: 1px solid rgba(99, 102, 241, 0.24);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .stayscan-step-icon {
            width: 30px;
            height: 30px;
            font-size: 14px;
            background: linear-gradient(135deg, rgba(129, 140, 248, 0.85), rgba(56, 189, 248, 0.85));
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .stayscan-step-body {
            font-size: 13px;
        }
        .stayscan-instruction-title {
            margin-bottom: 14px;
            font-size: 16px;
        }
        .stayscan-services {
            margin-top: 24px;
        }
        .stayscan-service-chip {
            padding: 8px 12px;
            font-size: 12px;
            background: rgba(226, 232, 240, 0.85);
            border: 1px solid rgba(148, 163, 184, 0.42);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }
    `;

    const script = `
        (function () {
            var printButton = document.querySelector('.stayscan-print-button');
            if (!printButton) return;
            var originalMarkup = printButton.innerHTML;

            printButton.addEventListener('click', function () {
                window.print();
            });

            document.addEventListener('keydown', function (event) {
                if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
                    event.preventDefault();
                    window.print();
                }
            });

            window.addEventListener('afterprint', function () {
                printButton.classList.add('print-success');
                printButton.innerHTML = '<span class="stayscan-print-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span><span>Print ready</span>';
                setTimeout(function () {
                    printButton.classList.remove('print-success');
                    printButton.innerHTML = originalMarkup;
                }, 2200);
            });
        })();
    `;

    return (
        <div className="stayscan-branded-qr">
            <style>{styles}</style>
            <div className="stayscan-aura one" aria-hidden="true"></div>
            <div className="stayscan-aura two" aria-hidden="true"></div>
            <button className="stayscan-print-button" type="button">
                <span className="stayscan-print-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 8V4h10v4" />
                        <path d="M6 12H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1" />
                        <path d="M7 16h10v4H7z" />
                        <path d="M17 13v-1" />
                    </svg>
                </span>
                <span>Print QR Placard</span>
            </button>

            <main className="stayscan-qr-card">
                <header className="stayscan-card-header">
                    <div className="stayscan-brand-badge" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 21V5.5A2.5 2.5 0 0 1 6.5 3H17a3 3 0 0 1 3 3V21" />
                            <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                            <path d="M9 7h6" />
                            <path d="M9 11h6" />
                        </svg>
                    </div>
                    <div>
                        <p className="stayscan-hotel-label">StayScan Hospitality</p>
                        <h1 className="stayscan-hotel-name">{room.hotel.name}</h1>
                        <p className="stayscan-room-code">Room {room.roomNumber} · {roomTypeLabel}</p>
                    </div>
                </header>

                <section className="stayscan-cta-ribbon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3v6l2.5-2.5" />
                        <path d="M12 9L9.5 6.5" />
                        <path d="M4.27 10.27a9 9 0 1 0 15.46 0" />
                    </svg>
                    <span>Scan to unlock your StayScan concierge experience.</span>
                </section>

                <section className="stayscan-qr-display">
                    <div className="stayscan-qr-frame">
                        <img src={qrImageUrl} alt="Room services QR code" />
                    </div>
                </section>

                <section className="stayscan-instruction-section">
                    <h2 className="stayscan-instruction-title">How to access</h2>
                    <ol className="stayscan-instruction-list">
                        <li>
                            <div className="stayscan-step-icon"></div>
                            <div className="stayscan-step-body">
                                <p className="stayscan-step-title">Open your device camera</p>
                                <p>Most smartphones launch a QR reader directly in the camera app.</p>
                            </div>
                        </li>
                        <li>
                            <div className="stayscan-step-icon"></div>
                            <div className="stayscan-step-body">
                                <p className="stayscan-step-title">Align &amp; follow the StayScan prompt</p>
                                <p>Hold steady until the StayScan link appears, then tap it to explore room services.</p>
                            </div>
                        </li>
                    </ol>
                </section>

                <section className="stayscan-services">
                    <span className="stayscan-service-chip">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m5 11 7-7 7 7" />
                            <path d="M12 18V4" />
                        </svg>
                        Concierge
                    </span>
                    <span className="stayscan-service-chip">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 5h16" />
                            <path d="M4 10h16" />
                            <path d="M10 15h10" />
                            <path d="M10 20h10" />
                            <path d="M4 15h3" />
                            <path d="M4 20h3" />
                        </svg>
                        Housekeeping
                    </span>
                    <span className="stayscan-service-chip">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 10h18" />
                            <path d="m8 2 2 8" />
                            <path d="m14 2-2 8" />
                            <path d="m7 16 1 6" />
                            <path d="m17 16-1 6" />
                            <path d="M5 10v4h14v-4" />
                        </svg>
                        Dining &amp; Room Service
                    </span>
                </section>
            </main>

            <script dangerouslySetInnerHTML={{ __html: script }} />
        </div>
    );
}
