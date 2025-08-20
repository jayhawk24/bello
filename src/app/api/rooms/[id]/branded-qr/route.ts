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
        if (!session || !['hotel_admin', 'hotel_staff'].includes(session.user.role)) {
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

        // Generate QR code data
        const qrData = generateQRCodeData(
            room.hotelId,
            room.roomNumber,
            room.accessCode
        );

        // Create HTML content for a branded QR code
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>QR Code for ${room.hotel.name} - Room ${room.roomNumber}</title>
            <style>
                body {
                    margin: 0;
                    padding: 40px;
                    font-family: 'Arial', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .print-button {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    transition: all 0.3s ease;
                    z-index: 1000;
                }
                .print-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                }
                .qr-container {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 500px;
                    width: 100%;
                }
                .hotel-header {
                    margin-bottom: 30px;
                }
                .hotel-name {
                    font-size: 32px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .room-info {
                    font-size: 24px;
                    color: #34495e;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                .catchphrase {
                    font-size: 18px;
                    color: #e74c3c;
                    font-weight: bold;
                    margin-bottom: 30px;
                    padding: 15px;
                    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
                    border-radius: 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .qr-code {
                    margin: 30px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 15px;
                    border: 3px solid #e9ecef;
                }
                .instructions {
                    font-size: 16px;
                    color: #7f8c8d;
                    margin-top: 20px;
                    line-height: 1.6;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 2px solid #ecf0f1;
                    color: #95a5a6;
                    font-size: 14px;
                }
                .emoji {
                    font-size: 2em;
                    margin: 0 10px;
                }
                
                /* Print styles */
                @media print {
                    body {
                        background: white !important;
                        padding: 20px;
                    }
                    .print-button {
                        display: none !important;
                    }
                    .qr-container {
                        box-shadow: none;
                        border: 2px solid #ddd;
                        page-break-inside: avoid;
                    }
                    .hotel-header {
                        margin-bottom: 20px;
                    }
                    .catchphrase {
                        background: #f0f0f0 !important;
                        color: #333 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <button class="print-button" onclick="window.print()" title="Print QR Code">
                🖨️ Print QR Code
            </button>
            
            <div class="qr-container">
                <div class="hotel-header">
                    <div class="hotel-name">
                        <span class="emoji">🏨</span>
                        ${room.hotel.name}
                        <span class="emoji">🏨</span>
                    </div>
                    <div class="room-info">
                        🛏️ Room ${room.roomNumber} - ${room.roomType}
                    </div>
                </div>
                
                <div class="catchphrase">
                    ✨ Scan to Unlock Premium Services ✨
                </div>
                
                <div class="qr-code">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=2c3e50&bgcolor=ffffff&ecc=M" 
                         alt="QR Code for Room Services" 
                         style="max-width: 100%; height: auto;">
                </div>
                
                <div class="instructions">
                    <strong>📱 How to use:</strong><br>
                    1. Open your phone's camera<br>
                    2. Point it at this QR code<br>
                    3. Tap the notification that appears<br>
                    4. Enjoy our premium concierge services!
                </div>
                
                <div class="footer">
                    🌟 Experience luxury at your fingertips 🌟<br>
                    Room Service • Housekeeping • Concierge • Spa Services
                </div>
            </div>

            <script>
                // Add keyboard shortcut for printing
                document.addEventListener('keydown', function(e) {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                        e.preventDefault();
                        window.print();
                    }
                });

                // Add print success feedback
                window.addEventListener('afterprint', function() {
                    const button = document.querySelector('.print-button');
                    const originalText = button.innerHTML;
                    button.innerHTML = '✅ Print Ready!';
                    button.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
                    
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    }, 2000);
                });
            </script>
        </body>
        </html>`;

        return new NextResponse(htmlContent, {
            headers: {
                'Content-Type': 'text/html',
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
