/**
 * Tiện ích xuất dữ liệu mảng đối tượng ra file CSV chuẩn UTF-8 có BOM
 * Giúp Microsoft Excel hiển thị tiếng Việt có dấu chuẩn 100% không bị vỡ font.
 */
export function exportToCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  headers: { key: keyof T; label: string }[]
) {
  if (!rows || rows.length === 0) {
    alert("Không có dữ liệu để xuất file!");
    return;
  }

  // Tiêu đề cột
  const headerLine = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(",");

  // Các dòng dữ liệu
  const dataLines = rows.map((row) => {
    return headers
      .map((h) => {
        const val = row[h.key];
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(",");
  });

  // Nối BOM \uFEFF + header + data
  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
