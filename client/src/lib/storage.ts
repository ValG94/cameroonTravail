import { API_BASE } from "./apiBase";

export async function storagePut(
  fileKey: string,
  file: File
): Promise<{ url: string; key: string }> {
  // Convertir le fichier en base64
  const buffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  
  // Appeler l'endpoint HTTP pour uploader le fichier
  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important pour envoyer les cookies
    body: JSON.stringify({
      fileData: base64,
      fileName: file.name,
      mimeType: file.type,
      fileKey,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
    console.error('Erreur upload:', errorData);
    throw new Error(errorData.error || 'Erreur lors de l\'upload du fichier');
  }
  
  const result = await response.json();
  
  return {
    url: result.url,
    key: result.key,
  };
}
