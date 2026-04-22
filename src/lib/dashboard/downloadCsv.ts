type CsvCell = string | number | boolean | null | undefined;

function escapeCsvCell(value: CsvCell): string {
  const normalized = value == null ? "" : String(value);
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: CsvCell[][],
): void {
  if (typeof window === "undefined") return;

  const csv = [
    headers.map((cell) => escapeCsvCell(cell)).join(","),
    ...rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
