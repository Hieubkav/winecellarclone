import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button, Card } from '@/app/components/ui';
import { useProductExcel } from '@/lib/hooks/useProductExcel';
import { bulkImportProducts, BulkImportResult } from '@/lib/api/admin';
import { fetchProductFilters } from '@/lib/api/products';
import { mapMultipleProducts, ProductImportData } from '@/lib/utils/productMapper';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface ImportProductsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export function ImportProductsDialog({ 
  isOpen, 
  onClose,
  onImportSuccess 
}: ImportProductsDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<Record<string, unknown>[]>([]);
  const [step, setStep] = useState<'select' | 'preview' | 'importing' | 'complete'>('select');
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  
  const { isImporting, importProducts } = useProductExcel();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStep('select');
      setImportedData([]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
      setStep('select');
      setImportedData([]);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) return;
    
    setStep('preview');
    await importProducts(selectedFile, (data) => {
      setImportedData(data);
    });
  };

  const handleConfirmImport = async () => {
    if (importedData.length === 0) return;

    setStep('importing');
    setImportProgress({ current: 0, total: importedData.length });

    try {
      const filters = await fetchProductFilters();
      
      const mappedResults = mapMultipleProducts(
        importedData as ProductImportData[],
        filters.types,
        filters.categories
      );

      const validProducts = mappedResults
        .filter(r => r.data !== null)
        .map(r => r.data!);

      const mappingErrors = mappedResults.filter(r => r.error);

      if (mappingErrors.length > 0) {
        toast.error(
          <div>
            <div className="font-semibold mb-1">
              Phát hiện {mappingErrors.length} lỗi mapping:
            </div>
            <div className="text-xs whitespace-pre-line">
              {mappingErrors.slice(0, 3).map(e => `Dòng ${e.row}: ${e.error}`).join('\n')}
              {mappingErrors.length > 3 && '\n...và các lỗi khác'}
            </div>
          </div>,
          { duration: 8000 }
        );
      }

      if (validProducts.length === 0) {
        toast.error('Không có sản phẩm hợp lệ để import');
        setStep('preview');
        return;
      }

      const result = await bulkImportProducts(validProducts as Record<string, unknown>[]);
      setImportResult(result);
      setStep('complete');

      if (result.success) {
        toast.success(result.message);
        onImportSuccess();
      } else {
        toast.warning(result.message);
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import thất bại. Vui lòng thử lại.');
      setStep('preview');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportedData([]);
    setImportResult(null);
    setStep('select');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Upload className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Import sản phẩm từ Excel
              </h2>
              <p className="text-sm text-slate-500">
                {step === 'select' && 'Chọn file Excel để import'}
                {step === 'preview' && `Xem trước ${importedData.length} sản phẩm`}
                {step === 'importing' && 'Đang import sản phẩm...'}
                {step === 'complete' && 'Hoàn tất import'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClose}
            disabled={isImporting}
          >
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {step === 'select' && (
            <div className="space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  selectedFile 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" 
                    : "border-slate-300 dark:border-slate-600 hover:border-blue-400"
                )}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileSpreadsheet className="text-blue-600" size={48} />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Chọn file khác
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="text-slate-400" size={48} />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        Kéo thả file Excel vào đây
                      </p>
                      <p className="text-sm text-slate-500">
                        hoặc
                      </p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Chọn file từ máy tính
                    </Button>
                    <p className="text-xs text-slate-500">
                      Hỗ trợ: .xlsx, .xls (tối đa 10MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <p className="font-medium mb-2">Lưu ý khi import:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>File Excel phải có cấu trúc đúng theo template mẫu</li>
                      <li>Các trường có dấu (*) là bắt buộc</li>
                      <li>Nếu có ID, sản phẩm sẽ được cập nhật; nếu không có ID, sản phẩm mới sẽ được tạo</li>
                      <li>Giá trị &quot;Phân loại&quot; và &quot;Danh mục&quot; phải khớp với dữ liệu hiện có</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && importedData.length > 0 && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <p className="font-medium">
                      Đã xác thực thành công {importedData.length} sản phẩm
                    </p>
                    <p className="text-xs mt-1">
                      Nhấn &quot;Xác nhận Import&quot; để tiến hành import vào hệ thống
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 font-medium text-sm">
                  Xem trước dữ liệu ({importedData.length} sản phẩm)
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left">STT</th>
                        <th className="px-4 py-2 text-left">Tên sản phẩm</th>
                        <th className="px-4 py-2 text-left">Phân loại</th>
                        <th className="px-4 py-2 text-left">Giá bán</th>
                        <th className="px-4 py-2 text-left">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importedData.slice(0, 100).map((item, index) => (
                        <tr key={index} className="border-t border-slate-200 dark:border-slate-700">
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">{String(item.name || '')}</td>
                          <td className="px-4 py-2">{String(item.type_name || '')}</td>
                          <td className="px-4 py-2">
                            {item.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.price)) : 'Liên hệ'}
                          </td>
                          <td className="px-4 py-2">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs",
                              item.active 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                            )}>
                              {item.active ? 'Hiển thị' : 'Ẩn'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importedData.length > 100 && (
                    <div className="p-4 text-center text-sm text-slate-500 border-t border-slate-200 dark:border-slate-700">
                      Và {importedData.length - 100} sản phẩm khác...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-slate-900 dark:text-slate-100 font-medium mb-2">
                Đang import sản phẩm...
              </p>
              <p className="text-sm text-slate-500">
                {importProgress.current} / {importProgress.total}
              </p>
              <div className="w-full max-w-md mt-4 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {step === 'complete' && importResult && (
            <div className="space-y-4">
              <div className={cn(
                "border rounded-lg p-4",
                importResult.success 
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                  : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
              )}>
                <div className="flex gap-3">
                  {importResult.success ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                      {importResult.message}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="bg-white dark:bg-slate-800 rounded p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {importResult.results.created}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Tạo mới</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {importResult.results.updated}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Cập nhật</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded p-3 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {importResult.results.failed}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Lỗi</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {importResult.results.errors.length > 0 && (
                <div className="border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
                  <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2 font-medium text-sm border-b border-red-200 dark:border-red-800">
                    Chi tiết lỗi ({importResult.results.errors.length})
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {importResult.results.errors.map((error, index) => (
                      <div 
                        key={index}
                        className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-mono bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                            Dòng {error.row}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {error.name}
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {error.error}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          {step !== 'importing' && step !== 'complete' && (
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isImporting}
            >
              Hủy
            </Button>
          )}
          
          {step === 'select' && selectedFile && (
            <Button 
              onClick={handlePreview}
              disabled={isImporting}
            >
              {isImporting ? 'Đang xử lý...' : 'Xem trước'}
            </Button>
          )}
          
          {step === 'preview' && (
            <Button 
              onClick={handleConfirmImport}
              disabled={isImporting || importedData.length === 0}
            >
              Xác nhận Import
            </Button>
          )}

          {step === 'complete' && (
            <Button onClick={handleClose}>
              Đóng
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
