export const detectFileType = (dataUrl) => {
  if (!dataUrl) return { mime: "", ext: "", isPreviewable: false };

  const match = dataUrl.match(/^data:(.*?);base64,/i);
  if (match) {
    const mime = match[1];
    let ext = mime.split("/")[1];
    if (ext === "jpeg") ext = "jpg";
    const isPreviewable = mime.startsWith("image/") || mime === "application/pdf";
    return { mime, ext, isPreviewable };
  }

  // fallback: magic numbers
  const prefix = dataUrl.substring(0, 30);
  if (prefix.startsWith("/9j/")) return { mime: "image/jpeg", ext: "jpg", isPreviewable: true };
  if (prefix.startsWith("iVBOR")) return { mime: "image/png", ext: "png", isPreviewable: true };
  if (prefix.startsWith("JVBERi0")) return { mime: "application/pdf", ext: "pdf", isPreviewable: true };

  return { mime: "application/octet-stream", ext: "bin", isPreviewable: false };
};

export const openBase64AsBlob = (base64Data, fileName = "preview") => {
  const match = base64Data.match(/^data:(.*?);base64,/);
  const mimeType = match ? match[1] : "application/octet-stream";
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteNumbers = Array.from(byteCharacters, (c) => c.charCodeAt(0));
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
};


export const downloadBase64File = (dataUrl, fileName) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
