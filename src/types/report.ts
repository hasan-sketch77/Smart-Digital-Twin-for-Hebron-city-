export interface ReportData {
  id: string;
  titleAr: string;
  type: string;
  status: string;
  fileSize: string | null;
  pageCount: number | null;
  dateAr: string;
  createdAt: string;
  completedAt: string | null;
}
