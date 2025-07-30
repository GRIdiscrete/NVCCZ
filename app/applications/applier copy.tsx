'use client'

import { useState, ChangeEvent } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import * as mammoth from 'mammoth';

// IMPORTANT: This is the key configuration that works in Next.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Define our keywords and phrases with weights
const KEYWORDS = [
  { term: "Kudzai", weight: 1.0 },
  { term: "typescript", weight: 0.9 },
  { term: "next.js", weight: 1.2 },
  { term: "Jaure", weight: 1.5 },
  { term: "Niakazi", weight: 0.8 },
  { term: "word document", weight: 0.8 },
  { term: "text extraction", weight: 1.3 },
  { term: "artificial intelligence", weight: 1.4 },
];

export default function DocumentTextExtractor() {
  const [extractedText, setExtractedText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [foundKeywords, setFoundKeywords] = useState<string[]>([]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);
    setExtractedText('');
    setError('');
    setScore(0);
    setFoundKeywords([]);

    try {
      if (file.type === 'application/pdf') {
        await extractTextFromPDF(file);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.name.endsWith('.docx')
      ) {
        await extractTextFromDocx(file);
      } else if (file.name.endsWith('.doc')) {
        setError('Please upload .docx or PDF files only. Older .doc format is not supported.');
      } else {
        setError('Unsupported file type. Please upload a PDF or Word document.');
      }
    } catch (err) {
      console.error('Error extracting text:', err);
      setError('Error extracting text from the document. Please try another file.');
    } finally {
      setIsLoading(false);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<void> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);
      
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

      setExtractedText(fullText);
      calculateDocumentScore(fullText);
    } catch (err) {
      console.error('PDF processing error:', err);
      setError('Failed to process PDF. Please try another file.');
      throw err;
    }
  };

  const extractTextFromDocx = async (file: File): Promise<void> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    setExtractedText(result.value);
    calculateDocumentScore(result.value);
  };

  const calculateDocumentScore = (text: string) => {
    const lowerText = text.toLowerCase();
    let totalScore = 0;
    const found: string[] = [];
    
    KEYWORDS.forEach(({ term, weight }) => {
      if (lowerText.includes(term.toLowerCase())) {
        totalScore += weight;
        found.push(term);
      }
    });

    setScore(totalScore);
    setFoundKeywords(found);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '3rem 1rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.75rem' }}>
            Application Analyzer
          </h1>
          <p style={{ color: '#4b5563' }}>Upload your documents and extract text instantly</p>
        </div>

        {/* Upload Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '28rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e3a8a', marginBottom: '0.5rem' }}>
                Upload PDF or Word Document
              </label>
              <div style={{
                marginTop: '0.25rem',
                display: 'flex',
                justifyContent: 'center',
                padding: '1.25rem 1.5rem',
                border: '2px dashed #bfdbfe',
                borderRadius: '0.5rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <svg
                    style={{ height: '3rem', width: '3rem', margin: '0 auto', color: '#93c5fd' }}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div style={{ display: 'flex', fontSize: '0.875rem', color: '#4b5563' }}>
                    <label
                      htmlFor="file-upload"
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        borderRadius: '0.375rem',
                        fontWeight: 500,
                        color: '#2563eb',
                        marginRight: '0.25rem'
                      }}
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileUpload}
                        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}
                      />
                    </label>
                    <p>or drag and drop</p>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>PDF, DOCX up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '2rem 0', gap: '1rem' }}>
            <div style={{
              animation: 'spin 1s linear infinite',
              borderRadius: '9999px',
              height: '3rem',
              width: '3rem',
              borderTop: '2px solid #1e3a8a',
              borderBottom: '2px solid #1e3a8a'
            }}></div>
            <span style={{ color: '#1e3a8a', fontWeight: 500 }}>Processing document...</span>
          </div>
        )}

        {/* File Info */}
        {fileName && !isLoading && (
          <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
            <svg style={{ height: '1.25rem', width: '1.25rem', color: '#1e40af', marginRight: '0.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span style={{ color: '#1e3a8a', fontWeight: 500 }}>File: {fileName}</span>
          </div>
        )}

        {/* Score Card */}
        {score > 0 && !isLoading && (
          <div style={{ 
            backgroundColor: '#f0f9ff', 
            borderRadius: '0.75rem', 
            padding: '1.5rem', 
            marginBottom: '1.5rem',
            border: '1px solid #bae6fd'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              color: '#0369a1',
              marginBottom: '1rem'
            }}>
              Document Relevance Score
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `conic-gradient(#0ea5e9 ${score * 25}%, #e0f2fe 0)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700, 
                  color: '#0c4a6e' 
                }}>
                  {score.toFixed(1)}
                </span>
              </div>
              
              <div>
                <p style={{ color: '#4b5563', marginBottom: '0.5rem' }}>
                  <strong>Keywords found:</strong> {foundKeywords.length} of {KEYWORDS.length}
                </p>
                {foundKeywords.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {foundKeywords.map((keyword, index) => (
                      <span 
                        key={index}
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
                )}
              </div>
            </div>
            
            <p style={{ 
              color: '#64748b', 
              fontSize: '0.875rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px dashed #cbd5e1'
            }}>
              Scoring based on presence of relevant terms in document. Higher scores indicate better keyword coverage.
            </p>
          </div>
        )}

        {/* Results */}
        {extractedText && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', overflow: 'hidden', border: '1px solid #f3f4f6' }}>
            <div style={{ backgroundColor: '#1e3a8a', padding: '0.75rem 1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>Extracted Text</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                maxWidth: 'none',
                backgroundColor: '#f9fafb',
                padding: '1rem',
                borderRadius: '0.5rem',
                whiteSpace: 'pre-wrap',
                color: '#1f2937',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}>
                {extractedText}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => navigator.clipboard.writeText(extractedText)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    color: '#ffffff',
                    backgroundColor: '#1e3a8a',
                    cursor: 'pointer'
                  }}
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg style={{ height: '1.25rem', width: '1.25rem', color: '#dc2626', marginRight: '0.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ color: '#b91c1c', fontWeight: 500 }}>{error}</span>
            </div>
          </div>
        )}

        {/* Add spin animation */}
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}