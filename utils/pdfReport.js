import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildReportHtml(report, meta) {
  const qa = Array.isArray(report.qaReview) ? report.qaReview : [];
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const qaRows = qa.map((item, i) => `
    <div class="qa-block">
      <div class="q-label">Q${i + 1}. ${esc(item.question)}</div>
      <div class="a-block candidate">
        <div class="a-tag">Your Answer</div>
        <div class="a-text">${esc(item.candidateAnswer)}</div>
      </div>
      <div class="a-block ideal">
        <div class="a-tag ideal-tag">Model Answer</div>
        <div class="a-text">${esc(item.idealAnswer)}</div>
      </div>
    </div>
  `).join('');

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a1a2e; padding: 32px; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
        .score-row { display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
        .score-card { border: 1px solid #e0e0e0; border-radius: 10px; padding: 12px 16px; min-width: 120px; }
        .score-num { font-size: 24px; font-weight: 700; color: #6366F1; }
        .score-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .qa-block { margin-bottom: 22px; page-break-inside: avoid; }
        .q-label { font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #1a1a2e; }
        .a-block { border-radius: 8px; padding: 10px 14px; margin-bottom: 6px; }
        .candidate { background: #f4f4f8; border-left: 3px solid #a0a0b0; }
        .ideal { background: #eef0ff; border-left: 3px solid #6366F1; }
        .a-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px; }
        .ideal-tag { color: #6366F1; }
        .a-text { font-size: 13px; line-height: 1.5; }
        hr { border: none; border-top: 1px solid #eee; margin: 24px 0; }
      </style>
    </head>
    <body>
      <h1>Interview Report — ${esc(meta.role || 'Interview')}</h1>
      <div class="sub">${esc(meta.level || '')} • ${date}</div>

      <div class="score-row">
        <div class="score-card"><div class="score-num">${report.overallScore ?? '-'}</div><div class="score-label">Overall</div></div>
        <div class="score-card"><div class="score-num">${report.technicalScore ?? '-'}</div><div class="score-label">Technical</div></div>
        <div class="score-card"><div class="score-num">${report.communicationScore ?? '-'}</div><div class="score-label">Communication</div></div>
        <div class="score-card"><div class="score-num">${report.problemSolvingScore ?? '-'}</div><div class="score-label">Problem Solving</div></div>
        <div class="score-card"><div class="score-num">${report.bestPracticesScore ?? '-'}</div><div class="score-label">Best Practices</div></div>
      </div>

      <hr />
      <h1 style="font-size:16px;">Questions &amp; Answers</h1>
      ${qaRows || '<p style="color:#888;font-size:13px;">No question review available for this session.</p>'}
    </body>
  </html>
  `;
}

export async function downloadReportPdf(report, meta = {}) {
  const html = buildReportHtml(report, meta);

  if (Platform.OS === 'web') {
    // expo-print's web shim just calls window.print() on the current page,
    // so build our own print window with the report HTML instead.
    const printWindow = window.open('', '_blank');
    if (!printWindow) throw new Error('Popup blocked');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
    return null;
  }

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Save Interview Report' });
  }
  return uri;
}
