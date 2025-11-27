// Clipboard utility with fallback for browsers without Clipboard API permissions

export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.log('Clipboard API failed, using fallback method');
      // Fall through to fallback method
    }
  }

  // Fallback method using textarea
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Make it invisible and non-interactive
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    textarea.setAttribute('readonly', '');
    
    document.body.appendChild(textarea);
    
    // Select the text
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    // Copy using the older execCommand method
    const success = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textarea);
    
    return success;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}
