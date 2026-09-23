import { ContractAuditReport, ContractComparisonReport } from "@/types";
import jsPDF from "jspdf";

/**
 * Triggers a browser file download from a string content
 */
export function triggerBrowserDownload(
  content: string,
  filename: string,
  contentType: string = "text/plain;charset=utf-8"
) {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports the complete Contract Audit as Markdown
 */
export function generateAuditMarkdown(report: ContractAuditReport): string {
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let md = `# ClauseGuard Contract Audit Report: ${report.document_title}\n\n`;
  md += `*Generated on ${dateStr} via ClauseGuard AI Contract Assistant*\n\n`;
  md += `> **LEGAL DISCLAIMER:** This document is generated for informational, analytical, and intake-preparation purposes only. It does not constitute formal legal counsel or create an attorney-client relationship.\n\n`;
  md += `## 1. Executive Summary\n\n`;
  md += `- **Document Overview:** ${report.document_summary}\n`;
  md += `- **Overall Risk Score:** **${report.overall_risk_score} / 100** (${report.risk_tier} RISK)\n`;
  md += `- **Triage Recommendation:** **${report.triage_recommendation.replace(/_/g, " ")}**\n`;
  md += `- **Clause Breakdown:** ${report.summary_stats.red_flags} Red (Predatory) | ${report.summary_stats.amber_flags} Amber (Unbalanced) | ${report.summary_stats.green_flags} Green (Fair)\n\n`;

  if (report.custom_focus_analysis) {
    const focus = report.custom_focus_analysis;
    md += `## 2. Targeted Intake & Statutory Authorities Grounding\n\n`;
    md += `- **Target Persona / Role:** ${focus.target_role}\n`;
    if (focus.answers_to_user_questions && focus.answers_to_user_questions.length > 0) {
      md += `\n### Targeted Inquiries:\n`;
      focus.answers_to_user_questions.forEach((ans) => {
        md += `- ${ans}\n`;
      });
    }
    if (focus.statutory_origins && focus.statutory_origins.length > 0) {
      md += `\n### Governing Statutory Authorities & Precedents:\n`;
      focus.statutory_origins.forEach((statute) => {
        md += `- **${statute.topic}** (\`${statute.jurisdiction_context}\`): *${statute.governing_statute_or_rule}*\n  ${statute.plain_explanation}\n`;
      });
    }
    md += `\n---\n\n`;
  }

  md += `## ${report.custom_focus_analysis ? "3" : "2"}. Critical Redline & Risk Analysis\n\n`;

  report.clauses.forEach((clause, idx) => {
    const riskBadge =
      clause.risk_level === "RED"
        ? "[CRITICAL / PREDATORY]"
        : clause.risk_level === "AMBER"
        ? "[UNBALANCED / AGGRESSIVE]"
        : "[FAIR / STANDARD]";

    md += `### ${idx + 1}. ${clause.title} ${riskBadge}\n\n`;
    md += `**Category:** \`${clause.category}\` | **Fairness Score:** ${clause.fairness_score}/10\n\n`;
    md += `**Verbatim Excerpt:**\n> "${clause.verbatim_quote}"\n\n`;
    md += `**Plain-English Meaning:** ${clause.plain_english_meaning}\n\n`;

    if (clause.hidden_risks.length > 0) {
      md += `**Key Risk Traps:**\n`;
      clause.hidden_risks.forEach((r) => {
        md += `- ${r}\n`;
      });
      md += `\n`;
    }

    if (clause.counter_proposal) {
      md += `#### Recommended Counter-Proposal:\n`;
      md += `\`\`\`text\n${clause.counter_proposal.balanced_clause}\n\`\`\`\n\n`;
      md += `*Rationale:* ${clause.counter_proposal.negotiation_rationale}\n\n`;
      md += `#### Counterparty Pushback Email Script:\n`;
      md += `\`\`\`text\n${clause.counter_proposal.email_script}\n\`\`\`\n\n`;
    }

    md += `---\n\n`;
  });

  md += `## 3. Attorney Intake Dossier (Counsel Consultation Brief)\n\n`;
  md += `### Summary for Counsel\n${report.attorney_dossier.executive_summary}\n\n`;
  md += `### Parties Identified\n${report.attorney_dossier.parties_identified.map((p) => `- ${p}`).join("\n")}\n\n`;

  md += `### Critical Red Flags for Review\n`;
  report.attorney_dossier.critical_red_flags.forEach((f) => {
    md += `- ⚠️ ${f}\n`;
  });
  md += `\n`;

  md += `### Key Deadlines & Milestones\n`;
  report.attorney_dossier.key_deadlines_and_milestones.forEach((d) => {
    md += `- 📅 ${d}\n`;
  });
  md += `\n`;

  md += `### Top 5 Strategic Questions for Attorney Consultation\n`;
  report.attorney_dossier.top_5_attorney_questions.forEach((q) => {
    md += `- **${q}**\n`;
  });
  md += `\n`;

  return md;
}

/**
 * Exports the Attorney Dossier as an executive-quality, multi-page printable PDF using jsPDF
 */
export function generateAttorneyDossierPdf(report: ContractAuditReport) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 14;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkOverflow(needed: number) {
    if (y + needed > pageHeight - 22) {
      doc.addPage();
      y = 20;
      // Running header on page 2+
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `CLAUSEGUARD: ATTORNEY INTAKE DOSSIER — ${report.document_title.slice(0, 45)}`,
        margin,
        12
      );
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, 14, pageWidth - margin, 14);
    }
  }

  // --- 1. COVER / TOP BANNER (Deep Berry + Fiery Orange) ---
  doc.setFillColor(31, 4, 15); // Deep Berry #1F040F
  doc.rect(0, 0, pageWidth, 26, "F");

  doc.setFillColor(252, 108, 38); // Fiery Berry Accent #FC6C26
  doc.rect(0, 26, pageWidth, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 248, 223); // Vanilla Cloud #FFF8DF
  doc.text("CLAUSEGUARD", margin, 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(252, 108, 38);
  doc.text("AI CONTRACT RISK & STATUTORY INTAKE DOSSIER", margin + 48, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 248, 223);
  doc.text("CONFIDENTIAL COUNSEL BRIEF", pageWidth - margin - 48, 14);

  y = 34;

  // --- 2. DOCUMENT METADATA ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(report.document_title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 5.5 + 1;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(
    `Audit Date: ${dateStr} | Engine: Google Gemini GenAI | Triage: ${report.triage_recommendation.replace(/_/g, " ")}`,
    margin,
    y
  );
  y += 7;

  // --- 3. RISK SCORECARD CONTAINER ---
  checkOverflow(28);
  // Scorecard Background (Vanilla Cloud)
  doc.setFillColor(255, 253, 245);
  doc.setDrawColor(252, 108, 38);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  // Big Risk Score
  const isCritical = report.risk_tier === "CRITICAL" || report.overall_risk_score >= 80;
  const isHigh = report.risk_tier === "HIGH" || report.overall_risk_score >= 60;
  const isMod = report.risk_tier === "MODERATE" || report.overall_risk_score >= 35;

  if (isCritical) {
    doc.setTextColor(153, 27, 27); // Dark Crimson
  } else if (isHigh) {
    doc.setTextColor(194, 65, 12); // Dark Orange
  } else if (isMod) {
    doc.setTextColor(180, 83, 9); // Amber
  } else {
    doc.setTextColor(6, 95, 70); // Emerald
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(`${report.overall_risk_score}`, margin + 6, y + 16);

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("/100", margin + 20, y + 16);

  // Score Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  if (isCritical) {
    doc.setTextColor(153, 27, 27);
  } else if (isHigh) {
    doc.setTextColor(194, 65, 12);
  } else {
    doc.setTextColor(180, 83, 9);
  }
  doc.text(`${report.risk_tier} RISK TIER`, margin + 40, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Action: ${report.triage_recommendation.replace(/_/g, " ")}`, margin + 40, y + 14.5);
  doc.text(
    `Flags: ${report.summary_stats.red_flags} Red (Predatory) | ${report.summary_stats.amber_flags} Amber (Unbalanced) | ${report.summary_stats.green_flags} Green (Standard)`,
    margin + 40,
    y + 20
  );

  y += 28;

  // --- 4. PRIVILEGE NOTICE CALLOUT ---
  checkOverflow(16);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 13, 1.5, 1.5, "FD");

  doc.setFillColor(252, 108, 38);
  doc.rect(margin, y, 2.5, 13, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("CONFIDENTIAL CLIENT INTAKE & REDLINE DOSSIER", margin + 5, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Prepared for legal counsel review to isolate predatory clauses, eliminate preliminary intake billable hours, and provide counter-proposals.",
    margin + 5,
    y + 9.5
  );

  y += 18;

  // --- 5. SECTION 1: EXECUTIVE BRIEFING FOR COUNSEL ---
  checkOverflow(26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(31, 4, 15);
  doc.text("1. Executive Briefing for Legal Counsel", margin, y);
  doc.setDrawColor(252, 108, 38);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 1.5, margin + 65, y + 1.5);
  y += 6.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const execLines = doc.splitTextToSize(
    report.attorney_dossier.executive_summary,
    contentWidth
  );
  doc.text(execLines, margin, y);
  y += execLines.length * 4.4 + 4;

  // Parties & Deadlines
  if (report.attorney_dossier.parties_identified.length > 0) {
    checkOverflow(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Parties Identified: ${report.attorney_dossier.parties_identified.join("  •  ")}`,
      margin,
      y
    );
    y += 5;
  }

  if (report.attorney_dossier.key_deadlines_and_milestones.length > 0) {
    checkOverflow(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Key Deadlines / Notice: ${report.attorney_dossier.key_deadlines_and_milestones.join("  •  ")}`,
      margin,
      y
    );
    y += 6;
  }

  y += 4;

  // --- 6. SECTION 2: TARGETED INTAKE & STATUTORY GROUNDS ---
  if (report.custom_focus_analysis) {
    const focus = report.custom_focus_analysis;
    checkOverflow(25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(31, 4, 15);
    doc.text("2. Targeted Intake & Statutory Authorities Grounding", margin, y);
    doc.setDrawColor(252, 108, 38);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 1.5, margin + 85, y + 1.5);
    y += 6.5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(194, 65, 12);
    doc.text(`Target Role: ${focus.target_role}`, margin, y);
    y += 5;

    if (focus.answers_to_user_questions && focus.answers_to_user_questions.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      focus.answers_to_user_questions.forEach((ans) => {
        checkOverflow(10);
        const ansLines = doc.splitTextToSize(`• ${ans}`, contentWidth - 4);
        doc.text(ansLines, margin + 2, y);
        y += ansLines.length * 4;
      });
      y += 3;
    }

    if (focus.statutory_origins && focus.statutory_origins.length > 0) {
      checkOverflow(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("Governing Statutes, Rules & Judicial Precedents:", margin, y);
      y += 5;

      focus.statutory_origins.forEach((statute) => {
        const statLines = doc.splitTextToSize(
          `• ${statute.topic}: ${statute.governing_statute_or_rule} (${statute.jurisdiction_context}) — ${statute.plain_explanation}`,
          contentWidth - 6
        );
        checkOverflow(statLines.length * 4 + 4);

        doc.setFillColor(255, 253, 245);
        doc.setDrawColor(252, 108, 38);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin, y - 3, contentWidth, statLines.length * 4 + 4, 1, 1, "FD");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(31, 4, 15);
        doc.text(statLines, margin + 3, y);
        y += statLines.length * 4 + 5;
      });
    }

    y += 4;
  }

  // --- 7. SECTION 3: TOP 5 STRATEGIC QUESTIONS FOR COUNSEL ---
  checkOverflow(25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(31, 4, 15);
  doc.text("3. Strategic Attorney Consultation Questions", margin, y);
  doc.setDrawColor(252, 108, 38);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 1.5, margin + 75, y + 1.5);
  y += 6.5;

  report.attorney_dossier.top_5_attorney_questions.forEach((q, idx) => {
    const qLines = doc.splitTextToSize(
      q.startsWith(`${idx + 1}.`) ? q : `${idx + 1}. ${q}`,
      contentWidth - 6
    );
    checkOverflow(qLines.length * 4.2 + 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(qLines, margin + 2, y);
    y += qLines.length * 4.2 + 2.5;
  });

  y += 6;

  // --- 8. SECTION 4: CLAUSE-BY-CLAUSE AUDITS & REDLINES ---
  checkOverflow(25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(31, 4, 15);
  doc.text("4. Clause-by-Clause Risk Breakdown & Redline Counter-Proposals", margin, y);
  doc.setDrawColor(252, 108, 38);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 1.5, margin + 115, y + 1.5);
  y += 8;

  report.clauses.forEach((clause, idx) => {
    checkOverflow(40);

    // Clause Header Card
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);

    const isRed = clause.risk_level === "RED";
    const isAmber = clause.risk_level === "AMBER";

    // Card boundary
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "FD");

    // Indicator pill
    if (isRed) {
      doc.setFillColor(153, 27, 27);
    } else if (isAmber) {
      doc.setFillColor(194, 65, 12);
    } else {
      doc.setFillColor(6, 95, 70);
    }
    doc.rect(margin, y, 3, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `${idx + 1}. ${clause.title} [${clause.risk_level}] (Fairness: ${clause.fairness_score}/10)`,
      margin + 6,
      y + 5.5
    );

    y += 12;

    // Verbatim quote
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const quoteLines = doc.splitTextToSize(`"${clause.verbatim_quote}"`, contentWidth - 8);
    checkOverflow(quoteLines.length * 3.8 + 4);
    doc.text(quoteLines, margin + 4, y);
    y += quoteLines.length * 3.8 + 3;

    // Plain English meaning
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    checkOverflow(10);
    doc.text("Plain-English Meaning:", margin + 4, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const meaningLines = doc.splitTextToSize(clause.plain_english_meaning, contentWidth - 8);
    checkOverflow(meaningLines.length * 3.8 + 3);
    doc.text(meaningLines, margin + 4, y);
    y += meaningLines.length * 3.8 + 3;

    // Hidden risks
    if (clause.hidden_risks.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(153, 27, 27);
      checkOverflow(6);
      doc.text("Key Risk Traps:", margin + 4, y);
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      clause.hidden_risks.forEach((hr) => {
        const hrLines = doc.splitTextToSize(`• ${hr}`, contentWidth - 10);
        checkOverflow(hrLines.length * 3.5 + 2);
        doc.text(hrLines, margin + 6, y);
        y += hrLines.length * 3.5;
      });
      y += 2;
    }

    // Counter Proposal Box
    if (clause.counter_proposal) {
      const prop = clause.counter_proposal;
      const propLines = doc.splitTextToSize(
        `Proposed Redline: "${prop.balanced_clause}"`,
        contentWidth - 12
      );
      const boxHeight = propLines.length * 3.6 + 8;
      checkOverflow(boxHeight + 4);

      doc.setFillColor(255, 253, 245); // Vanilla
      doc.setDrawColor(252, 108, 38);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin + 4, y, contentWidth - 8, boxHeight, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(194, 65, 12);
      doc.text("Balanced Counter-Proposal (Recommended Language):", margin + 7, y + 4.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(31, 4, 15);
      doc.text(propLines, margin + 7, y + 8.5);

      y += boxHeight + 4;
    }

    y += 4;
  });

  // --- 9. RUNNING FOOTER ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.text(
      "CONFIDENTIAL & PRIVILEGED ATTORNEY-CLIENT INTAKE BRIEF | Generated by ClauseGuard AI",
      margin,
      pageHeight - 6.5
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 6.5);
  }

  const safeTitle = report.document_title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
  doc.save(`ClauseGuard_Attorney_Dossier_${safeTitle}.pdf`);
}

/**
 * Generates comparison markdown report
 */
export function generateComparisonMarkdown(report: ContractComparisonReport): string {
  let md = `# ClauseGuard Contract Comparison Audit\n\n`;
  md += `**Document A:** ${report.doc_a_name}\n`;
  md += `**Document B:** ${report.doc_b_name}\n\n`;
  md += `## Verdict\n${report.overall_verdict}\n\n`;
  md += `## Risk Shift\n${report.risk_drift_summary}\n\n`;
  md += `## Strategic Takeaway\n${report.strategic_takeaway}\n\n`;
  md += `## Clause Differences\n\n`;

  report.differences.forEach((diff, idx) => {
    md += `### ${idx + 1}. ${diff.clause_title} [${diff.change_type} | ${diff.risk_shift}]\n\n`;
    if (diff.doc_a_version) {
      md += `**Version A:**\n> "${diff.doc_a_version}"\n\n`;
    }
    if (diff.doc_b_version) {
      md += `**Version B:**\n> "${diff.doc_b_version}"\n\n`;
    }
    md += `**Impact:** ${diff.plain_english_impact}\n\n`;
    md += `**Recommendation:** ${diff.recommendation}\n\n---\n\n`;
  });

  return md;
}
