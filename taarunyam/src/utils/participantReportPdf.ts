import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Participant } from '../types/participant.types';
import type { TEvent } from '../types/event.types';

export function exportParticipantsPDF(participants: Participant[], events: TEvent[]): void {
    const doc = new jsPDF('p', 'mm', 'a4');

    const addFooter = () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('TAARUNYAM 2026 — Confidential', 15, 287);
        doc.text(`Page ${doc.getNumberOfPages()}`, 195, 287, { align: 'right' });
    };

    // ========== COVER PAGE ==========
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('TAARUNYAM 2026', 105, 60, { align: 'center' });

    doc.setFontSize(20);
    doc.setFont('helvetica', 'normal');
    doc.text('PARTICIPANTS REPORT', 105, 80, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(
        `Report Generated: ${new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })}`,
        105,
        110,
        { align: 'center' }
    );

    doc.setFillColor(59, 130, 246);
    doc.roundedRect(50, 130, 110, 60, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT SUMMARY', 105, 140, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Participants: ${participants.length}`, 105, 155, { align: 'center' });
    doc.text(`Total Winners: ${participants.filter((p) => p.isWinner).length}`, 105, 165, { align: 'center' });
    doc.text(`Total Events: ${events.length}`, 105, 175, { align: 'center' });

    doc.addPage();

    // ========== TABLE OF CONTENTS ==========
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TABLE OF CONTENTS', 105, 13, { align: 'center' });

    let yPos = 40;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    doc.text('1. Executive Summary', 20, yPos);
    yPos += 10;
    doc.text('2. Event-wise Participation', 20, yPos);
    yPos += 10;

    events.forEach((event, idx) => {
        doc.setFont('helvetica', 'normal');
        doc.text(`  2.${idx + 1} ${event.title}`, 30, yPos);
        yPos += 8;
    });

    doc.setFont('helvetica', 'normal');
    doc.text('3. Winner Details', 20, yPos);
    yPos += 10;
    doc.text('4. Complete Participant List', 20, yPos);

    doc.addPage();

    // ========== EXECUTIVE SUMMARY ==========
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', 105, 13, { align: 'center' });

    yPos = 40;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    const uniqueColleges = new Set(participants.map((p) => p.college)).size;
    const avgEvents =
        participants.length > 0
            ? (participants.reduce((sum, p) => sum + p.events.length, 0) / participants.length).toFixed(1)
            : '0';

    doc.setFont('helvetica', 'bold');
    doc.text('Overall Statistics:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');

    doc.text(`Total Registered Participants: ${participants.length}`, 25, yPos);
    yPos += 7;
    doc.text(`Number of Colleges/Institutes: ${uniqueColleges}`, 25, yPos);
    yPos += 7;
    doc.text(`Average Events per Participant: ${avgEvents}`, 25, yPos);
    yPos += 7;
    doc.text(`Total Winners: ${participants.filter((p) => p.isWinner).length}`, 25, yPos);
    yPos += 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Event-wise Participation:', 20, yPos);
    yPos += 10;

    const eventSummaryData = events.map((event) => {
        const eventParticipants = participants.filter((p) => p.events.includes(event.id));
        const winners = eventParticipants.filter((p) => p.isWinner && p.winnerEvent === event.id);
        return [
            event.title,
            eventParticipants.length.toString(),
            winners.length.toString(),
            event.category,
            new Date(event.eventDate).toLocaleDateString(),
        ];
    });

    autoTable(doc, {
        startY: yPos,
        head: [['Event', 'Participants', 'Winners', 'Category', 'Date']],
        body: eventSummaryData,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9 },
        margin: { left: 15, right: 15 },
        didDrawPage: addFooter,
    });

    // ========== EVENT-WISE DETAILED REPORTS ==========
    events.forEach((event) => {
        doc.addPage();

        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`EVENT: ${event.title.toUpperCase()}`, 105, 13, { align: 'center' });

        yPos = 30;
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Category: ${event.category} | Date: ${new Date(event.eventDate).toLocaleDateString()} | Max Participants: ${event.maxParticipants}`,
            105,
            yPos,
            { align: 'center' }
        );

        yPos += 15;

        const eventParticipants = participants.filter((p) => p.events.includes(event.id));
        const winners = eventParticipants.filter((p) => p.isWinner && p.winnerEvent === event.id);
        const participantsOnly = eventParticipants.filter((p) => !winners.includes(p));

        if (winners.length > 0) {
            doc.setTextColor(202, 138, 4);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('WINNERS', 20, yPos);
            yPos += 7;

            const winnerData = winners.map((p) => [p.name, p.college, p.course || 'N/A', p.year || 'N/A', p.email, p.id]);

            autoTable(doc, {
                startY: yPos,
                head: [['Name', 'College', 'Course', 'Year', 'Email', 'ID']],
                body: winnerData,
                theme: 'striped',
                headStyles: { fillColor: [202, 138, 4], textColor: [255, 255, 255] },
                styles: { fontSize: 8 },
                margin: { left: 15, right: 15 },
                didDrawPage: addFooter,
            });

            yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
        }

        if (participantsOnly.length > 0) {
            if (yPos > 260) {
                doc.addPage();
                yPos = 30;
            }
            doc.setTextColor(30, 64, 175);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('PARTICIPANTS', 20, yPos);
            yPos += 7;

            const participantData = participantsOnly.map((p) => [
                p.name,
                p.college,
                p.course || 'N/A',
                p.year || 'N/A',
                p.email,
                p.id,
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Name', 'College', 'Course', 'Year', 'Email', 'ID']],
                body: participantData,
                theme: 'striped',
                headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255] },
                styles: { fontSize: 8 },
                margin: { left: 15, right: 15 },
                pageBreak: 'auto',
                didDrawPage: addFooter,
            });
        }
    });

    // ========== COMPLETE PARTICIPANT LIST ==========
    doc.addPage();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPLETE PARTICIPANT DIRECTORY', 105, 13, { align: 'center' });

    const allParticipantsData = participants.map((p) => [
        p.id,
        p.name,
        p.college,
        p.course || 'N/A',
        p.year || 'N/A',
        p.email,
        p.mobile,
        p.events.map((eid) => events.find((e) => e.id === eid)?.title || eid).join(', '),
        p.isWinner ? 'Yes' : 'No',
        p.registeredAt,
    ]);

    autoTable(doc, {
        startY: 30,
        head: [['ID', 'Name', 'College', 'Course', 'Year', 'Email', 'Mobile', 'Events', 'Winner', 'Reg Date']],
        body: allParticipantsData,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8 },
        styles: { fontSize: 7 },
        margin: { left: 15, right: 15 },
        pageBreak: 'auto',
        didDrawPage: addFooter,
    });

    // ========== FINAL PAGE ==========
    doc.addPage();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT COMPLETE', 105, 120, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated by: Admin Panel', 105, 140, { align: 'center' });
    doc.text(`Total Pages: ${doc.getNumberOfPages()}`, 105, 150, { align: 'center' });
    doc.text(`Data as of: ${new Date().toLocaleString()}`, 105, 160, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('© 2026 TAARUNYAM Tech Event. This report is confidential.', 105, 200, { align: 'center' });
    doc.text('For official use only.', 105, 210, { align: 'center' });

    const filename = `Taarunyam_2026_Participants_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
}
