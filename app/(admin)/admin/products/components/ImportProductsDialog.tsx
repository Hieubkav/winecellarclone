import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Card } from '@/app/components/ui';
import { useProductExcel } from '@/lib/hooks/useProductExcel';
import { cn } from '@/lib/utils';

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
  const [step, setStep] = useState<'select' | 'preview' | 'processing'>('select');
  
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
    
    setStep('processing');
    await importProducts(selectedFile, (data) => {
      setImportedData(data);
      setStep('preview');
    });
  };

  const handleConfirmImport = async () => {
    console.log('Importing products:', importedData);
    
    onImportSuccess();
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportedData([]);
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
                {step === 'processing' && 'Đang xử lý file...'}
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

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">
                Đang xử lý file Excel...
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isImporting || step === 'processing'}
          >
            Hủy
          </Button>
          
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
        </div>
      </Card>
    </div>
  );
}
