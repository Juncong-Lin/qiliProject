/**
 * Document Content Extractor
 * This script handles extracting and displaying the content of PDF and DOC/DOCX files directly
 */

import { parseMarkdown } from './markdown-parser.js';

/**
 * Extract and display document content directly in the product details
 * @param {string} productId - ID of the product
 * @param {string} documentPath - Path to the document file (PDF, DOC, DOCX)
 */
export async function displayDocumentContent(productId, documentPath) {
  try {
    const fileExtension = documentPath.split('.').pop().toLowerCase();
    const detailsContainer = document.querySelector('.js-product-details-content');
    
    // Show loading indicator
    detailsContainer.innerHTML = '<div class="document-loading">Loading document content...</div>';
    
    console.log('Attempting to load document:', documentPath);
    
    // First check if the file exists
    try {
      const response = await fetch(documentPath, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Document not found: ${documentPath}`);
      }
    } catch (error) {
      console.error('Document fetch check failed:', error);
      throw error;
    }
    
    if (fileExtension === 'pdf') {
      await extractPdfContent(documentPath, detailsContainer);
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      await extractDocContent(documentPath, detailsContainer);
    }
  } catch (error) {
    console.error('Error extracting document content:', error);
    const detailsContainer = document.querySelector('.js-product-details-content');
    detailsContainer.innerHTML = `
      <div class="document-error">
        <p>There was an error loading the document content: ${error.message}</p>
        <p>Please <a href="${documentPath}" download>download the document</a> to view its contents.</p>
      </div>
    `;
  }
}

/**
 * Extract content from a DOCX file and display it
 * @param {string} docPath - Path to the DOC/DOCX file
 * @param {HTMLElement} container - Container to display content in
 */
async function extractDocContent(docPath, container) {
  try {
    console.log('Extracting DOCX content from:', docPath);
    
    // Show loading indicator
    container.innerHTML = '<div class="document-loading">Converting document to HTML...</div>';
    
    // Fetch the document file
    const response = await fetch(docPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('Document fetched, size:', Math.round(blob.size / 1024), 'KB');
    
    // Check if mammoth is loaded
    if (typeof mammoth === 'undefined') {
      console.error('Mammoth.js is not loaded!');
      throw new Error('Mammoth.js library not found');
    }
    
    // Use mammoth.js to convert DOCX to HTML
    const result = await mammoth.convertToHtml({ 
      arrayBuffer: await blob.arrayBuffer(),
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Title'] => h1.document-title:fresh"
      ]
    });
    
    const html = result.value;
    console.log('Document converted to HTML');
    
    // If there are any warnings, log them
    if (result.messages.length > 0) {
      console.log('Mammoth conversion warnings:', result.messages);
    }
    
    // Display the extracted content with download link
    container.innerHTML = `
      <div class="document-content docx-content">${html}</div>
      <div class="doc-download-link">
        <a href="${docPath}" download class="download-btn">Download Document</a>
      </div>
    `;
    
    // Apply styling to make it match the site design
    applyContentStyling();
    
    // Add special handling for tables in DOCX
    const tables = container.querySelectorAll('table');
    tables.forEach(table => {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      
      // Ensure all cells have borders
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        cell.style.border = '1px solid #ddd';
        cell.style.padding = '8px';
      });
    });
    
    // Fix images in the document
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    });
    
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Error extracting DOCX content: ${error.message}`);
  }
}

/**
 * Extract content from a PDF file and display it
 * 
 * Note: This is a simplified implementation. PDF text extraction is inherently
 * difficult to preserve formatting. For production use, consider using a
 * server-side solution or PDF.js with more complex rendering.
 * 
 * @param {string} pdfPath - Path to the PDF file
 * @param {HTMLElement} container - Container to display content in
 */
async function extractPdfContent(pdfPath, container) {
  try {
    console.log('Extracting PDF content from:', pdfPath);
    
    // Check if PDF.js is loaded
    if (typeof pdfjsLib === 'undefined') {
      console.log('PDF.js not loaded, loading it now...');
      
      // Load PDF.js from CDN
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load PDF.js'));
        document.head.appendChild(script);
      });
      
      // Set up worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.worker.min.js';
    }
    
    console.log('PDF.js loaded, processing document...');
    
    // Fetch the PDF document
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    console.log('Loading PDF document...');
    
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    // Create a better container for PDF content with fallback option
    container.innerHTML = `
      <div class="document-content pdf-content"></div>
      <div class="doc-download-link">
        <a href="${pdfPath}" download class="download-btn">Download PDF</a>
      </div>
    `;
    const contentDiv = container.querySelector('.document-content');
    
    // Get all pages and extract text
    const numPages = pdf.numPages;
    
    // Process pages in sequence
    for (let i = 1; i <= Math.min(numPages, 10); i++) { // Limit to first 10 pages for performance
      console.log(`Processing page ${i} of ${numPages}`);
      
      const page = await pdf.getPage(i);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      
      // Create a canvas for this page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      
      // Add page number indicator
      const pageHeader = document.createElement('div');
      pageHeader.className = 'pdf-page-header';
      pageHeader.textContent = `Page ${i} of ${numPages}`;
      
      // Create page container
      const pageDiv = document.createElement('div');
      pageDiv.className = 'pdf-page';
      pageDiv.appendChild(pageHeader);
      pageDiv.appendChild(canvas);
      
      contentDiv.appendChild(pageDiv);
      
      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Also get text content for accessibility and search
      const textContent = await page.getTextContent();
      const textLayer = document.createElement('div');
      textLayer.className = 'pdf-text-layer';
      textLayer.setAttribute('style', `width: ${viewport.width}px; height: ${viewport.height}px; position: absolute; top: 0; left: 0;`);
      
      pdfjsLib.renderTextLayer({
        textContent: textContent,
        container: textLayer,
        viewport: viewport,
        textDivs: []
      });
      
      // For simplicity, we'll show page images instead of trying to extract and format text
      // This gives a more accurate representation of the PDF
    }
    
    if (numPages > 10) {
      const morePages = document.createElement('div');
      morePages.className = 'pdf-more-pages';
      morePages.innerHTML = `
        <p>Showing first 10 pages. Download the full PDF to view all ${numPages} pages.</p>
      `;
      contentDiv.appendChild(morePages);
    }
    
    // Apply styling
    applyContentStyling();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Error extracting PDF content: ${error.message}`);
  }
}

/**
 * Apply styling to the document content to match the site design
 */
function applyContentStyling() {
  const documentContent = document.querySelector('.document-content');
  if (!documentContent) return;
  
  // Add classes to headings, tables, lists, etc.
  documentContent.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
    heading.classList.add('document-heading');
  });
  
  documentContent.querySelectorAll('table').forEach(table => {
    table.classList.add('document-table');
    // Make sure tables are responsive
    const wrapper = document.createElement('div');
    wrapper.classList.add('document-table-wrapper');
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
  
  documentContent.querySelectorAll('img').forEach(img => {
    img.classList.add('document-image');
    // Make images responsive
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
  });
}
