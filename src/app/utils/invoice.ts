import httpStatus from "http-status-codes";
import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/appError";

export interface IInvoiceData {
    transactionId: string;
    bookingDate: Date;
    userName: string;
    tourTitle: string;
    guestCount: number;
    totalAmount: number;
}

export const generatePdf = async (invoiceData: IInvoiceData): Promise<Buffer<ArrayBufferLike>> => {
    try {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: "A4", margin: 50 });
            const buffer: Uint8Array[] = [];

            doc.on("data", (chunk) => buffer.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffer)));
            doc.on("error", (err) => reject(err));

            // invoice pdf setup
            doc.font("Helvetica");
            doc.fontSize(22).text("INVOICE", { align: "center" });

            doc.moveDown(1.5);

            // Divider
            doc
                .moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke();

            doc.moveDown();

            // Invoice meta
            doc.fontSize(12);
            doc.text(`Transaction ID: ${invoiceData.transactionId}`);
            doc.text(`Booking Date: ${invoiceData.bookingDate.toLocaleDateString()}`);
            doc.text(`Customer Name: ${invoiceData.userName}`);

            doc.moveDown(1.5);

            // Booking details section
            doc.fontSize(14).text("Booking Details", { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(12);
            doc.text(`Tour Title: ${invoiceData.tourTitle}`);
            doc.text(`Number of Guests: ${invoiceData.guestCount}`);

            doc.moveDown(1);

            // Amount box
            const boxTop = doc.y;
            doc
                .rect(50, boxTop, 500, 50)
                .stroke();

            doc.fontSize(14).text(
                `Total Amount Paid: $${invoiceData.totalAmount.toFixed(2)}`,
                60,
                boxTop + 15
            );

            doc.moveDown(3);

            // Footer divider
            doc
                .moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke();

            doc.moveDown();

            // Footer message
            doc
                .fontSize(11)
                .fillColor("gray")
                .text("Thank you for booking with us. We hope you enjoy your experience!", {
                    align: "center",
                });

            // Reset color
            doc.fillColor("black");

            // Finalize PDF
            doc.end();

        })


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log("Error generating pdf:", error);
        throw new AppError(httpStatus.BAD_REQUEST, `Pdf creation error ${error.message}`)
    }
}