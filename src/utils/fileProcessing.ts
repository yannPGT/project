import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Erreur lors de la lecture du fichier Word');
  }
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Erreur lors de la lecture du fichier PDF');
  }
};

export const parseQuestionsFromText = (text: string): Array<{ question: string; answer: string }> => {
  const qaList: Array<{ question: string; answer: string }> = [];
  
  // Simple regex patterns to detect Q&A format
  const patterns = [
    /Q\s*:\s*(.+?)\n\s*R\s*:\s*(.+?)(?=\n\s*Q\s*:|$)/gis,
    /Question\s*:\s*(.+?)\n\s*Réponse\s*:\s*(.+?)(?=\n\s*Question\s*:|$)/gis,
    /\d+\.\s*(.+?)\n\s*(.+?)(?=\n\s*\d+\.|$)/gis
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const question = match[1].trim();
      const answer = match[2].trim();
      
      if (question.length > 10 && answer.length > 10) {
        qaList.push({ question, answer });
      }
    }
    
    if (qaList.length > 0) break;
  }

  return qaList;
};