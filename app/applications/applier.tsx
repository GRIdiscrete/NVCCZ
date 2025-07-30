'use client'

import { useState, useEffect, ChangeEvent } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import * as mammoth from 'mammoth';

// IMPORTANT: This is the key configuration that works in Next.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Define fund data structure
interface Fund {
  id: string;
  name: string;
  defaultKeywords: { term: string; weight: number }[];
  documents: { id: string; name: string; path: string }[];
}

// Sample funds data
const FUNDS: Fund[] = [
  {
    id: "venture-capital",
    name: "Venture Capital Fund",
    defaultKeywords: [
      { term: "startup", weight: 1.0 },
      { term: "investment", weight: 0.9 },
      { term: "technology", weight: 1.2 },
      { term: "growth", weight: 1.5 },
      { term: "market size", weight: 0.8 },
    ],
    documents: [
      { id: "doc1", name: "Startup Business Plan.pdf", path: "/documents/startup-plan.pdf" },
      { id: "doc2", name: "Investment Proposal.docx", path: "/documents/investment-proposal.docx" },
      { id: "doc3", name: "Tech Innovation Report.pdf", path: "/documents/tech-report.pdf" },
    ]
  },
  {
    id: "real-estate",
    name: "Real Estate Fund",
    defaultKeywords: [
      { term: "property", weight: 1.2 },
      { term: "development", weight: 1.0 },
      { term: "commercial", weight: 0.9 },
      { term: "residential", weight: 0.8 },
      { term: "zoning", weight: 1.3 },
      { term: "ROI", weight: 1.4 },
    ],
    documents: [
      { id: "doc4", name: "Property Development Plan.pdf", path: "/documents/property-plan.pdf" },
      { id: "doc5", name: "Market Analysis.docx", path: "/documents/market-analysis.docx" },
      { id: "doc6", name: "Financial Projections.pdf", path: "/documents/financial-projections.pdf" },
    ]
  },
  {
    id: "green-energy",
    name: "Green Energy Fund",
    defaultKeywords: [
      { term: "sustainability", weight: 1.4 },
      { term: "renewable", weight: 1.3 },
      { term: "solar", weight: 1.0 },
      { term: "wind", weight: 0.9 },
      { term: "carbon footprint", weight: 1.5 },
      { term: "energy efficiency", weight: 1.2 },
    ],
    documents: [
      { id: "doc7", name: "Solar Farm Proposal.pdf", path: "/documents/solar-proposal.pdf" },
      { id: "doc8", name: "Sustainability Report.docx", path: "/documents/sustainability-report.docx" },
      { id: "doc9", name: "Energy Efficiency Study.pdf", path: "/documents/energy-study.pdf" },
    ]
  }
];

// Document score result
interface DocumentScore {
  id: string;
  name: string;
  score: number;
  foundKeywords: string[];
}

export default function FundDocumentAnalyzer() {
  const [selectedFundId, setSelectedFundId] = useState<string>("");
  const [keywords, setKeywords] = useState<{ term: string; weight: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [documentScores, setDocumentScores] = useState<DocumentScore[]>([]);
  const [error, setError] = useState<string>("");
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [newWeight, setNewWeight] = useState<number>(1.0);

  // Initialize keywords when fund is selected
  useEffect(() => {
    if (selectedFundId) {
      const fund = FUNDS.find(f => f.id === selectedFundId);
      if (fund) {
        setKeywords([...fund.defaultKeywords]);
      }
    } else {
      setKeywords([]);
      setDocumentScores([]);
    }
  }, [selectedFundId]);

  // Extract text from PDF
  const extractTextFromPDF = async (buffer: ArrayBuffer): Promise<string> => {
    try {
      const typedArray = new Uint8Array(buffer);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let lastY = 0;
        let pageText = '';
        
        for (const item of textContent.items) {
          const textItem = item as TextItem;
          if (Math.abs(lastY - textItem.transform[5]) > 5) {
            pageText += '\n';
          }
          lastY = textItem.transform[5];
          pageText += textItem.str;
        }
        
        fullText += pageText + '\n\n';
      }

      return fullText;
    } catch (err) {
      console.error('PDF processing error:', err);
      throw new Error('Failed to process PDF');
    }
  };

  // Extract text from DOCX
  const extractTextFromDocx = async (buffer: ArrayBuffer): Promise<string> => {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  };

  // Calculate document score based on keywords
  const calculateDocumentScore = (text: string): { score: number; foundKeywords: string[] } => {
    const lowerText = text.toLowerCase();
    let totalScore = 0;
    const found: string[] = [];
    
    keywords.forEach(({ term, weight }) => {
      const lowerTerm = term.toLowerCase();
      if (lowerText.includes(lowerTerm)) {
        totalScore += weight;
        found.push(term);
      }
    });

    return { score: totalScore, foundKeywords: found };
  };

  // Process all documents for the selected fund
  const processDocuments = async () => {
    if (!selectedFundId || keywords.length === 0) return;
    
    setIsProcessing(true);
    setDocumentScores([]);
    setError("");
    
    try {
      const fund = FUNDS.find(f => f.id === selectedFundId);
      if (!fund) throw new Error("Fund not found");
      
      const scores: DocumentScore[] = [];
      
      for (const document of fund.documents) {
        try {
          // Fetch document from server (simulated with public URLs)
          const response = await fetch(document.path);
          if (!response.ok) throw new Error(`Failed to fetch document: ${document.name}`);
          
          const buffer = await response.arrayBuffer();
          let text = "";
          
          // Process based on file extension
          if (document.name.toLowerCase().endsWith('.pdf')) {
            text = await extractTextFromPDF(buffer);
          } else if (document.name.toLowerCase().endsWith('.docx')) {
            text = await extractTextFromDocx(buffer);
          } else {
            throw new Error(`Unsupported file type: ${document.name}`);
          }
          
          // Calculate score
          const { score, foundKeywords } = calculateDocumentScore(text);
          scores.push({
            id: document.id,
            name: document.name,
            score,
            foundKeywords
          });
        } catch (docErr) {
          console.error(`Error processing document ${document.name}:`, docErr);
          // Add document with error state
          scores.push({
            id: document.id,
            name: document.name,
            score: -1,
            foundKeywords: []
          });
        }
      }
      
      setDocumentScores(scores);
    } catch (err) {
      console.error('Processing error:', err);
      setError(`Error processing documents: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add a new keyword
  const addKeyword = () => {
    if (newKeyword.trim() && newWeight > 0) {
      setKeywords([...keywords, { term: newKeyword.trim(), weight: newWeight }]);
      setNewKeyword("");
      setNewWeight(1.0);
    }
  };

  // Remove a keyword
  const removeKeyword = (index: number) => {
    const updatedKeywords = [...keywords];
    updatedKeywords.splice(index, 1);
    setKeywords(updatedKeywords);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.5rem' }}>
            Fund Document Analyzer
          </h1>
          <p style={{ color: '#4b5563' }}>
            Select a fund, define keywords, and analyze application documents
          </p>
        </div>

        {/* Fund Selection */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '0.75rem', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: '0.5rem' }}>
              Select Fund
            </label>
            <select
              value={selectedFundId}
              onChange={(e) => setSelectedFundId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.875rem',
                color: '#1e293b',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            >
              <option value="">Select a fund</option>
              {FUNDS.map(fund => (
                <option key={fund.id} value={fund.id}>{fund.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Keyword Management */}
        {selectedFundId && (
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '0.75rem', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
              Keywords for Scoring
            </h2>
            
            {/* Add keyword form */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: '0.25rem' }}>
                  Keyword
                </label>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Enter keyword or phrase"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    color: '#1e293b',
                  }}
                />
              </div>
              
              <div style={{ width: '120px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: '0.25rem' }}>
                  Weight
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    color: '#1e293b',
                  }}
                />
              </div>
              
              <div style={{ alignSelf: 'flex-end' }}>
                <button
                  onClick={addKeyword}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    borderRadius: '0.375rem',
                    border: 'none',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    height: '2.5rem'
                  }}
                >
                  Add Keyword
                </button>
              </div>
            </div>
            
            {/* Keywords list */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#334155', marginBottom: '0.75rem' }}>
                Current Keywords ({keywords.length})
              </h3>
              
              {keywords.length === 0 ? (
                <div style={{ 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '0.5rem', 
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#64748b'
                }}>
                  No keywords defined. Add keywords to score documents.
                </div>
              ) : (
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '0.5rem', 
                  border: '1px solid #e2e8f0',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {keywords.map((keyword, index) => (
                    <div 
                      key={index} 
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          backgroundColor: '#dbeafe', 
                          color: '#1d4ed8', 
                          borderRadius: '9999px', 
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {keyword.weight.toFixed(1)}
                        </span>
                        <span>{keyword.term}</span>
                      </div>
                      <button
                        onClick={() => removeKeyword(index)}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          borderRadius: '0.375rem',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analyze Button */}
        {selectedFundId && keywords.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <button
              onClick={processDocuments}
              disabled={isProcessing}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: isProcessing ? '#93c5fd' : '#1e3a8a',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isProcessing ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </span>
                  Processing Documents...
                </>
              ) : (
                <>
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Analyze Documents
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Table */}
        {documentScores.length > 0 && (
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '0.75rem', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ backgroundColor: '#1e3a8a', padding: '0.75rem 1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>
                Document Analysis Results
              </h2>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#334155', borderBottom: '1px solid #e2e8f0' }}>Document</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#334155', borderBottom: '1px solid #e2e8f0', width: '120px' }}>Score</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#334155', borderBottom: '1px solid #e2e8f0' }}>Keywords Found</th>
                  </tr>
                </thead>
                <tbody>
                  {documentScores.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1e293b' }}>{doc.name}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {doc.score >= 0 ? (
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: doc.score > 2 ? '#dcfce7' : doc.score > 1 ? '#fef9c3' : '#fee2e2',
                            color: doc.score > 2 ? '#166534' : doc.score > 1 ? '#854d0e' : '#b91c1c',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>
                            {doc.score.toFixed(1)}
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#e2e8f0',
                            color: '#64748b',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>
                            Error
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        {doc.foundKeywords.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {doc.foundKeywords.map((keyword, idx) => (
                              <span 
                                key={idx}
                                style={{
                                  backgroundColor: '#dbeafe',
                                  color: '#1d4ed8',
                                  borderRadius: '9999px',
                                  padding: '0.25rem 0.75rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 500
                                }}
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>No keywords found</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isProcessing && documentScores.length === 0 && (
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '0.75rem', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ animation: 'spin 1s linear infinite', width: '3rem', height: '3rem', borderRadius: '9999px', borderTop: '2px solid #1e3a8a', borderBottom: '2px solid #1e3a8a', margin: '0 auto 1.5rem' }}></div>
            <p style={{ color: '#1e3a8a', fontWeight: 500 }}>Analyzing documents...</p>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Processing may take a few moments depending on document sizes</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            borderRadius: '0.5rem', 
            padding: '1rem', 
            marginBottom: '1.5rem',
            border: '1px solid #fecaca'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg style={{ height: '1.25rem', width: '1.25rem', color: '#dc2626', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ color: '#b91c1c', fontWeight: 500 }}>{error}</span>
            </div>
          </div>
        )}

        {/* No Documents Message */}
        {!selectedFundId && (
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '0.75rem', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '2rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <svg style={{ height: '3rem', width: '3rem', color: '#93c5fd', margin: '0 auto 1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>Select a Fund</h3>
            <p style={{ color: '#64748b' }}>Please select a fund from the dropdown to begin analyzing documents</p>
          </div>
        )}

        {/* Add spin animation */}
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}