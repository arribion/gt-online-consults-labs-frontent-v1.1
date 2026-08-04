import { FileSpreadsheet, Trash2, CheckCircle, Loader2 } from "lucide-react";

type ExcelPreviewProps = {
  data?: Array<Record<string, unknown>>;
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
};

const ExcelPreview = ({
  data,
  onCancel,
  onSave,
  isSaving,
}: ExcelPreviewProps) => {
  if (!data || data.length === 0) return null;

  // Extract headers from the keys of the first row object dynamically
  const headers = Object.keys(data[0]);

  return (
    /* Forced width to completely fill the parent container boundaries */
    <div className="w-full min-w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6 animate-in fade-in duration-200 text-left">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
          <span className="font-semibold text-slate-700 text-sm">
            File Preview ({data.length} rows detected)
          </span>
        </div>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50 disabled:opacity-50"
          title="Clear data">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Table Area - Optimized with full width parameters to enable clean horizontal scrolling */}
      <div className="w-full max-h-[60vh] overflow-auto scrollbar-thin">
        <table className="w-full min-w-full text-left border-collapse text-xs table-auto">
          <thead>
            <tr className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold sticky top-0 border-b border-slate-200 z-10">
              {headers.map((header, idx) => (
                /* Added right borders to structurally divide headers on wide screens */
                <th
                  key={idx}
                  className="p-3 whitespace-nowrap bg-slate-100 border-r border-slate-200/60 last:border-r-0">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-slate-50/80 transition-colors">
                {headers.map((header, colIndex) => (
                  /* Replaced max-w-xs truncation with whitespace-nowrap to let cells expand naturally */
                  <td
                    key={colIndex}
                    className="p-3 whitespace-nowrap border-r border-slate-100 last:border-r-0">
                    {row[header] !== undefined && row[header] !== null
                      ? row[header].toString()
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50">
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-75 disabled:cursor-not-allowed">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Save
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExcelPreview;