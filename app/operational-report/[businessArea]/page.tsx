"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportItem {
  label: string;
  description: string;
  status: string;
  percent: string;
  placeholder?: boolean;
}

interface QualityObjectivesData {
  status: string;
  percentage: number;
  count: number;
}

type TableCell = { content: string; colSpan?: number; styles?: Record<string, unknown> };

const BusinessAreaReportPage = () => {
  const router = useRouter();
  const params = useParams();
  const businessArea = decodeURIComponent(params.businessArea as string);
  const [qualityObjectivesData, setQualityObjectivesData] = useState<QualityObjectivesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Color coding function for status cell backgrounds
  const getStatusCellColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-600 text-white';
      case 'On-Track':
        return 'bg-blue-600 text-white';
      case 'Minor Challenges':
        return 'bg-yellow-500 text-white';
      case 'Major Challenges':
        return 'bg-red-600 text-white';
      case 'Not Started':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch quality objectives data for this business area
  useEffect(() => {
    const fetchQualityObjectivesData = async () => {
      try {
        const response = await fetch(`/api/operational-report/quality-objectives?businessArea=${encodeURIComponent(businessArea)}`);
        if (response.ok) {
          const data = await response.json();
          setQualityObjectivesData(data);
        } else {
          console.error('Failed to fetch quality objectives data');
        }
      } catch (error) {
        console.error('Error fetching quality objectives data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (businessArea) {
      fetchQualityObjectivesData();
    }
  }, [businessArea]);

  // Create report sections with real data
  const getReportSections = (): { section: string; items: ReportItem[] }[] => [
    {
      section: "1. Establishing clear Quality Objectives",
      items: [
        {
          label: "Quality Objectives Status",
          description:
            "Specific, measurable goals that align with the company's overall strategic objectives & status .",
          status: qualityObjectivesData?.status || "",
          percent: `${qualityObjectivesData?.percentage || 0}%`,
        },
      ],
    },
    {
      section: "2. Process & Document Management and Control",
      items: [
        {
          label: "Standard Operating Procedures Status",
          description: "Well-documented processes to ensure consistency in delivery.",
          status: "",
          percent: "0%",
        },
        {
          label: "Process monitoring Status",
          description:
            "Regular monitoring and tracking of processes to ensure they are being followed effectively",
          status: "On-Track",
          percent: "45%",
        },
        {
          label: "Record Keeping Status",
          description:
            "Proper maintenance of quality records to ensure traceability and accountability.",
          status: "",
          percent: "0%",
        },
        {
          label: "Version Control Status",
          description:
            "Keeping track of document revisions to maintain current and accurate procedures and policies (use the Registers)",
          status: "",
          percent: "0%",
        },
      ],
    },
    {
      section: "3. Customer Feedback & Satisfaction",
      items: [
        {
          label: "Customer Satisfaction Monitoring Status",
          description:
            "Collecting and analyzing customer feedback to gauge the effectiveness of the quality management system.",
          status: "",
          percent: "0%",
          placeholder: true,
        },
      ],
    },
    {
      section: "4. Risk Management Corrective Action & Improvement",
      items: [
        {
          label: "Risk Assessment Status",
          description:
            "Identification and mitigation of potential risks that could affect product/service quality.",
          status: "",
          percent: "0%",
        },
        {
          label: "Corrective & Preventive Actions Status",
          description:
            "Implementing actions based on customer complaints or quality issues. A system to identify, document, and track any deviations from established quality standards. Proactive measures to eliminate or reduce potential risks and errors.",
          status: "",
          percent: "0%",
        },
      ],
    },
    {
      section: "5. Performance Monitoring & Reporting",
      items: [
        {
          label: "Key Performance Indicators Status",
          description:
            "Measuring performance against established quality objectives.",
          status: "",
          percent: "0%",
        },
        {
          label: "Reporting & Review Status",
          description:
            "Regular reporting on quality performance to management, with actionable insights for improvement.",
          status: "",
          percent: "0%",
        },
        {
          label: "Continuous Improvement Status",
          description: "Jira NC & CIA logging (Report)",
          status: "",
          percent: "0%",
        },
      ],
    },
    {
      section: "6. Internal Self- Assessment",
      items: [
        {
          label: "Internal Self- Assessment Status",
          description:
            "Quality Audits: Regular internal audits to ensure compliance with quality standards and policies.",
          status: "",
          percent: "0%",
        },
      ],
    },
    {
      section: "7. Supplier Management (Where applicable)",
      items: [
        {
          label: "Supplier Quality Assurance Status",
          description: "Ensuring that suppliers meet required quality standards.",
          status: "",
          percent: "0%",
          placeholder: true,
        },
        {
          label: "3rd Party Evaluations Status",
          description:
            "Regular evaluations of suppliers and service providers to ensure quality consistency.",
          status: "",
          percent: "0%",
          placeholder: true,
        },
      ],
    },
  ];

  const handleDownloadPDF = () => {
    const reportSections = getReportSections();
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text("Operationalisation Report", 14, 14);
    doc.setFontSize(12);
    doc.text(`Business Area: ${businessArea}`, 14, 22);
    doc.setFont('helvetica', 'normal');

    const tableBody: TableCell[][] = [];
    // Add the Operationalisation row
    tableBody.push([
      { content: "Operationalisation", styles: { fillColor: [0, 34, 102], textColor: 255, fontStyle: 'bold' } },
      { content: "", styles: { fillColor: [0, 34, 102], textColor: 255 } },
      { content: "Status", styles: { fillColor: [0, 34, 102], textColor: 255, fontStyle: 'bold' } },
      { content: "%", styles: { fillColor: [0, 34, 102], textColor: 255, fontStyle: 'bold' } },
    ]);
    reportSections.forEach((section) => {
      // Section header row
      tableBody.push([
        { content: section.section, colSpan: 4, styles: { fillColor: [229, 231, 235], textColor: 0, fontStyle: 'bold' } },
      ]);
      section.items.forEach((item) => {
        // Determine status cell color based on status value
        let statusCellColor = [240, 240, 240]; // Default gray
        let statusTextColor = 0; // Default black text
        
        if (item.status && !item.placeholder) {
          switch (item.status) {
            case 'Completed':
              statusCellColor = [34, 197, 94]; // Green
              statusTextColor = 255; // White text
              break;
            case 'On-Track':
              statusCellColor = [59, 130, 246]; // Blue
              statusTextColor = 255; // White text
              break;
            case 'Minor Challenges':
              statusCellColor = [234, 179, 8]; // Yellow
              statusTextColor = 255; // White text
              break;
            case 'Major Challenges':
              statusCellColor = [220, 38, 38]; // Red
              statusTextColor = 255; // White text
              break;
            case 'Not Started':
              statusCellColor = [107, 114, 128]; // Gray
              statusTextColor = 255; // White text
              break;
          }
        }

        tableBody.push([
          { content: item.label, styles: { fontStyle: 'bold' } },
          { content: item.description },
          { content: item.placeholder ? "Coming Soon" : (item.status || "-"), styles: { fillColor: statusCellColor, textColor: statusTextColor, halign: 'center', valign: 'middle' } },
          { content: item.percent, styles: { halign: 'center', valign: 'middle' } },
        ]);
      });
    });

    autoTable(doc, {
      // No head row
      body: tableBody,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 70 },  // Label column
        1: { cellWidth: 140 }, // Description column - wider but fits page
        2: { cellWidth: 35 },  // Status column
        3: { cellWidth: 25 },  // Percentage column
      },
      margin: { left: 15, right: 15 }, // Slightly more margin to prevent overlap
    });
    doc.save(`operationalisation_report_${businessArea}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  const reportSections = getReportSections();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Operationalisation Report</h1>
        <button
          onClick={() => router.push('/operational-report/business-areas')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Back to Business Areas"
        >
          Back to Business Areas
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-4 text-white">Business Area: <span className="text-white">{businessArea}</span></h2>
      <button
        onClick={handleDownloadPDF}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Download PDF"
      >
        Download PDF
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white">
          <thead>
            {/* Removed the top Status and % row */}
          </thead>
          <tbody>
            {/* Operationalisation header row */}
            <tr className="bg-brand-dark text-white">
              <td colSpan={2} className="px-4 py-2 font-bold">Operationalisation</td>
              <td className="px-4 py-2 font-bold">Status</td>
              <td className="px-4 py-2 font-bold">%</td>
            </tr>
            {reportSections.map((section) => (
              <React.Fragment key={section.section}>
                <tr className="bg-brand-gray3 text-black">
                  <td colSpan={4} className="font-bold px-4 py-2">{section.section}</td>
                </tr>
                {section.items.map((item, itemIndex) => (
                  <tr key={`${section.section}-${item.label}-${itemIndex}`} className="border-b border-gray-200">
                    <td className="px-4 py-2 font-semibold w-1/4 text-black">{item.label}</td>
                    <td className="px-4 py-2 w-2/4 text-black">{item.description}</td>
                    <td className={`px-4 py-2 w-1/8 text-center ${item.placeholder ? 'text-gray-400' : item.status ? getStatusCellColor(item.status) : 'text-gray-400'}`}>
                      {item.placeholder ? (
                        <span className="italic">Coming Soon</span>
                      ) : item.status ? (
                        item.status
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-2 w-1/8 text-black text-center">{item.percent}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessAreaReportPage; 