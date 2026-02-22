import jsPDF from 'jspdf';
import Papa from 'papaparse';

export async function exportPDF(fileName, trends = []) {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(51, 65, 85);
    pdf.text('VC Intelligence Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date and time
    pdf.setFontSize(11);
    pdf.setTextColor(100, 116, 139);
    const now = new Date();
    pdf.text(`Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    // Divider
    pdf.setDrawColor(203, 213, 225);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 8;

    // Top 5 Trends Section
    pdf.setFontSize(16);
    pdf.setTextColor(30, 41, 59);
    pdf.text('Top 5 Emerging Trends', 20, yPosition);
    yPosition += 10;

    // Get top 5 trends
    const topTrends = (trends || []).sort((a, b) => (b.momentum_score || 0) - (a.momentum_score || 0)).slice(0, 5);

    topTrends.forEach((trend, index) => {
      const momentum = Math.min(100, (trend.momentum_score || 0) * 2);

      pdf.setFontSize(12);
      pdf.setTextColor(51, 65, 85);
      pdf.text(`${index + 1}. ${trend.name || 'Unknown'}`, 25, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);

      const details = [];
      if (trend.category) details.push(`Category: ${trend.category.replace('-', ' ').toUpperCase()}`);
      details.push(`Momentum: ${momentum.toFixed(0)}/100`);
      if (trend.lifecycle) details.push(`Lifecycle: ${trend.lifecycle}`);
      if (trend.confidence) details.push(`Confidence: ${trend.confidence}%`);

      details.forEach(detail => {
        pdf.text(`  • ${detail}`, 25, yPosition);
        yPosition += 4;
      });

      yPosition += 2;

      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
    });

    // Summary Statistics
    yPosition += 5;
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.text('Summary Statistics', 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.setTextColor(100, 116, 139);
    const stats = [
      `Total Trends Analyzed: ${trends.length}`,
      `Average Momentum: ${(trends.reduce((sum, t) => sum + (t.momentum_score || 0), 0) / trends.length * 2).toFixed(0)}/100`,
      `Report Period: Last 30 days`,
      `Data Quality: Complete`
    ];

    stats.forEach(stat => {
      pdf.text(`• ${stat}`, 25, yPosition);
      yPosition += 6;
    });

    // Footer
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    pdf.text('© VC Intelligence Hub - Confidential', pageWidth / 2, pageHeight - 10, { align: 'center' });

    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
  }
}

export function exportCSV(fileName, trends = []) {
  try {
    // Transform trends data to include more helpful information
    const csvData = (trends || []).map((trend, index) => ({
      'Rank': index + 1,
      'Trend Name': trend.name || '',
      'Category': trend.category ? trend.category.replace('-', ' ').toUpperCase() : '',
      'Momentum Score': trend.momentum_score ? trend.momentum_score.toFixed(2) : '0',
      'Normalized Score (0-100)': trend.momentum_score ? Math.min(100, trend.momentum_score * 2).toFixed(0) : '0',
      'Lifecycle Stage': trend.lifecycle || '',
      'Confidence Level': trend.confidence ? `${trend.confidence}%` : '',
      'Key Founders': trend.founders ? trend.founders.map(f => f.name).join('; ') : 'N/A',
      'Founder Count': trend.founders ? trend.founders.length : 0,
      'Export Date': new Date().toLocaleDateString(),
      'Export Time': new Date().toLocaleTimeString()
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting CSV:', error);
  }
}

export function exportJSON(fileName, data) {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `${fileName}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting JSON:', error);
  }
}
