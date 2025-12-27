import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQRCodeData } from "@/lib/utils";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (
            !session ||
            !["hotel_admin", "hotel_staff"].includes(session.user.role)
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // For hotel staff, use their hotelId directly. For admins, find their hotel
        let hotelId = session.user.hotelId;

        if (session.user.role === "hotel_admin" && !hotelId) {
            const hotel = await prisma.hotel.findFirst({
                where: { adminId: session.user.id }
            });

            if (!hotel) {
                return NextResponse.json(
                    { error: "Hotel not found" },
                    { status: 404 }
                );
            }
            hotelId = hotel.id;
        }

        if (!hotelId) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        const room = await prisma.room.findFirst({
            where: {
                id: id,
                hotelId: hotelId
            },
            include: {
                hotel: true
            }
        });

        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        const roomTypeLabel = room.roomType || "Guest Room";

        // Generate QR code data
        const qrData = generateQRCodeData(
            room.hotelId,
            room.roomNumber,
            room.accessCode
        );

        // Create HTML content for a branded QR code
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title>QR Code | ${room.hotel.name} Room ${room.roomNumber}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
                :root {
                    color-scheme: light;
                    --accent-primary: #7c3aed;
                    --accent-secondary: #38bdf8;
                    --accent-muted: rgba(124, 58, 237, 0.12);
                    --surface: rgba(248, 250, 252, 0.92);
                    --text-primary: #0f172a;
                    --text-secondary: #475569;
                }
                * {
                    box-sizing: border-box;
                }
                body {
                    margin: 0;
                    min-height: 100vh;
                    font-family: "Inter", "Segoe UI", sans-serif;
                    background: radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.32), transparent 55%), radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.28), transparent 50%), #0b1120;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 64px 24px;
                    color: var(--text-primary);
                    position: relative;
                    overflow-x: hidden;
                    overflow-y: auto;
                }
                .aura {
                    position: absolute;
                    width: 420px;
                    height: 420px;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0.55;
                    pointer-events: none;
                }
                .aura.one {
                    top: -120px;
                    left: -120px;
                    background: rgba(56, 189, 248, 0.55);
                }
                .aura.two {
                    bottom: -140px;
                    right: -140px;
                    background: rgba(124, 58, 237, 0.6);
                }
                .print-button {
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
                }
                .print-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 22px 44px rgba(99, 102, 241, 0.45);
                }
                .print-button:focus-visible {
                    outline: 3px solid rgba(56, 189, 248, 0.6);
                    outline-offset: 3px;
                }
                .print-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 22px;
                    height: 22px;
                }
                .print-button.print-button--success {
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    box-shadow: 0 18px 40px rgba(34, 197, 94, 0.45);
                }
                .qr-card {
                    width: min(760px, 100%);
                    background: var(--surface);
                    border-radius: 28px;
                    padding: 48px;
                    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.35);
                    backdrop-filter: blur(18px);
                    border: 1px solid rgba(148, 163, 184, 0.12);
                    position: relative;
                }
                .qr-card::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    border: 1px solid rgba(56, 189, 248, 0.22);
                    mask: linear-gradient(#fff, transparent 35%);
                    pointer-events: none;
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }
                .brand-badge {
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
                .brand-badge svg {
                    width: 36px;
                    height: 36px;
                }
                .hotel-label {
                    text-transform: uppercase;
                    letter-spacing: 0.18em;
                    font-size: 11px;
                    color: #6366f1;
                    margin: 0 0 8px 0;
                }
                .hotel-name {
                    margin: 0;
                    font-size: 32px;
                    font-weight: 700;
                    line-height: 1.2;
                    color: var(--text-primary);
                }
                .room-code {
                    margin: 10px 0 0 0;
                    font-size: 16px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }
                .cta-ribbon {
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
                .cta-ribbon svg {
                    width: 28px;
                    height: 28px;
                    flex-shrink: 0;
                }
                .qr-display {
                    margin-top: 36px;
                    display: flex;
                    justify-content: center;
                }
                .qr-frame {
                    position: relative;
                    padding: 28px;
                    border-radius: 24px;
                    background: #ffffff;
                    border: 2px dashed rgba(99, 102, 241, 0.28);
                    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
                }
                .qr-frame::after {
                    content: "";
                    position: absolute;
                    inset: 18px;
                    border-radius: 18px;
                    border: 1px dashed rgba(148, 163, 184, 0.35);
                    pointer-events: none;
                }
                .qr-frame img {
                    display: block;
                    width: 260px;
                    height: 260px;
                }
                .instruction-section {
                    margin-top: 44px;
                }
                .instruction-title {
                    margin: 0 0 18px 0;
                    font-size: 18px;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    color: #4338ca;
                }
                .instruction-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    counter-reset: steps;
                }
                .instruction-list li {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 16px 18px;
                    border-radius: 16px;
                    background: rgba(99, 102, 241, 0.08);
                    border: 1px solid rgba(99, 102, 241, 0.12);
                }
                .step-icon {
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
                .step-icon::before {
                    content: counter(steps);
                }
                .step-body {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    color: var(--text-secondary);
                    font-size: 15px;
                    line-height: 1.5;
                }
                .step-title {
                    margin: 0;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .services {
                    margin-top: 36px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .service-chip {
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
                .service-chip svg {
                    width: 16px;
                    height: 16px;
                }
                @media (max-width: 720px) {
                    body {
                        padding: 40px 16px;
                    }
                    .print-button {
                        position: static;
                        margin-bottom: 24px;
                    }
                    .qr-card {
                        padding: 32px 24px;
                    }
                    .card-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .qr-frame img {
                        width: 220px;
                        height: 220px;
                    }
                }
                @media print {
                    body {
                        background: #ffffff !important;
                        padding: 16px;
                        overflow: visible;
                    }
                    .aura,
                    .print-button {
                        display: none !important;
                    }
                    .qr-card {
                        box-shadow: none;
                        background: #ffffff;
                        border: 1px solid #cbd5f5;
                    }
                    .qr-card::before {
                        display: none;
                    }
                    .instruction-list li,
                    .service-chip,
                    .cta-ribbon {
                        background: #f8fafc !important;
                        border-color: #cbd5f5 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <div class="aura one" aria-hidden="true"></div>
            <div class="aura two" aria-hidden="true"></div>
            <button class="print-button" type="button" onclick="window.print()" title="Print QR code">
                <span class="print-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M7 8V4h10v4" />
                        <path d="M6 12H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1" />
                        <path d="M7 16h10v4H7z" />
                        <path d="M17 13v-1" />
                    </svg>
                </span>
                <span>Print QR Placard</span>
            </button>
            <main class="qr-card">
                <header class="card-header">
                    <div class="brand-badge" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 21V5.5A2.5 2.5 0 0 1 6.5 3H17a3 3 0 0 1 3 3V21" />
                            <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                            <path d="M9 7h6" />
                            <path d="M9 11h6" />
                        </svg>
                    </div>
                    <div>
                        <p class="hotel-label">StayScan Hospitality</p>
                        <h1 class="hotel-name">${room.hotel.name}</h1>
                        <p class="room-code">Room ${
                            room.roomNumber
                        } &middot; ${roomTypeLabel}</p>
                    </div>
                </header>
                <section class="cta-ribbon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M12 3v6l2.5-2.5" />
                        <path d="M12 9L9.5 6.5" />
                        <path d="M4.27 10.27a9 9 0 1 0 15.46 0" />
                    </svg>
                    <span>Scan to unlock your StayScan concierge experience.</span>
                </section>
                <section class="qr-display">
                    <div class="qr-frame">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
                            qrData
                        )}&color=1f2937&bgcolor=ffffff&ecc=Q" alt="Room services QR code">
                    </div>
                </section>
                <section class="instruction-section">
                    <h2 class="instruction-title">How to access</h2>
                    <ol class="instruction-list">
                        <li>
                            <div class="step-icon"></div>
                            <div class="step-body">
                                <p class="step-title">Open your device camera</p>
                                <p>Most smartphones launch a QR reader directly in the camera app.</p>
                            </div>
                        </li>
                        <li>
                            <div class="step-icon"></div>
                            <div class="step-body">
                                <p class="step-title">Align the code inside the frame</p>
                                <p>Hold steady until the prompt appears confirming StayScan room services.</p>
                            </div>
                        </li>
                        <li>
                            <div class="step-icon"></div>
                            <div class="step-body">
                                <p class="step-title">Tap the StayScan link to continue</p>
                                <p>Instantly view room details, housekeeping requests, dining, and more.</p>
                            </div>
                        </li>
                    </ol>
                </section>
                <section class="services">
                    <span class="service-chip">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="m5 11 7-7 7 7" />
                            <path d="M12 18V4" />
                        </svg>
                        Concierge
                    </span>
                    <span class="service-chip">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M4 5h16" />
                            <path d="M4 10h16" />
                            <path d="M10 15h10" />
                            <path d="M10 20h10" />
                            <path d="M4 15h3" />
                            <path d="M4 20h3" />
                        </svg>
                        Housekeeping
                    </span>
                    <span class="service-chip">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
            <script>
                (function () {
                    var printButton = document.querySelector(".print-button");
                    if (!printButton) return;
                    var originalMarkup = printButton.innerHTML;
                    document.addEventListener("keydown", function (event) {
                        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
                            event.preventDefault();
                            window.print();
                        }
                    });
                    window.addEventListener("afterprint", function () {
                        printButton.classList.add("print-button--success");
                        printButton.innerHTML = '<span class="print-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span><span>Print ready</span>';
                        setTimeout(function () {
                            printButton.classList.remove("print-button--success");
                            printButton.innerHTML = originalMarkup;
                        }, 2200);
                    });
                })();
            </script>
        </body>
        </html>`;

        return new NextResponse(htmlContent, {
            headers: {
                "Content-Type": "text/html"
            }
        });
    } catch (error) {
        console.error("Branded QR code generation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
