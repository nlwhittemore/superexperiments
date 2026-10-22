import "server-only";
import mammoth from "mammoth";

export async function extractDocumentText(opts: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}): Promise<string> {
  const name = opts.fileName.toLowerCase();

  if (opts.mimeType === "application/pdf" || name.endsWith(".pdf")) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(opts.buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text.trim();
  }

  if (
    name.endsWith(".docx") ||
    opts.mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const { value } = await mammoth.extractRawText({ buffer: opts.buffer });
    return value.trim();
  }

  if (
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    opts.mimeType.startsWith("text/")
  ) {
    return opts.buffer.toString("utf8").trim();
  }

  throw new Error("Unsupported file type — upload PDF, DOCX, TXT, or MD.");
}
