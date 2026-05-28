import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, ShieldAlert, Award, TrendingUp, CheckSquare, Download, Calendar, Clock, Database } from 'lucide-react';

function Reports() {
  const { lots, stats, logs } = useSelector(state => state.mes);

  // LEVEL 3 Log Card filters states
  const [logFilterDate, setLogFilterDate] = useState('2026-05-28'); // default date for seed data
  const [logFilterHour, setLogFilterHour] = useState('all'); // 'all', '00'~'23'

  // Aggregate quantities
  const totalProduction = lots.reduce((sum, l) => sum + l.productionQty, 0);
  const totalGood = lots.reduce((sum, l) => sum + l.goodQty, 0);
  const totalDefect = lots.reduce((sum, l) => sum + l.defectQty, 0);
  const overallDefectRate = totalProduction > 0 ? parseFloat(((totalDefect / totalProduction) * 100).toFixed(2)) : 0;

  // Process specific summaries
  const getProcessSummary = (step) => {
    const stepLots = lots.filter(l => l.processStep === step);
    const prod = stepLots.reduce((sum, l) => sum + l.productionQty, 0);
    const good = stepLots.reduce((sum, l) => sum + l.goodQty, 0);
    const defect = stepLots.reduce((sum, l) => sum + l.defectQty, 0);
    const defectRate = prod > 0 ? parseFloat(((defect / prod) * 100).toFixed(2)) : 0;
    
    return { name: step.toUpperCase(), 생산량: prod, 양품수: good, 불량수: defect, 불량률: defectRate };
  };

  const processData = [
    getProcessSummary('electrode'),
    getProcessSummary('assembly'),
    getProcessSummary('formation'),
    getProcessSummary('module')
  ];

  // LEVEL 3: 30-day logs archival filtering logic (auto expire logs > 30 days)
  const getThirtyDaysLogs = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      // 1. Auto-expire rule (logs > 30 days vanish)
      if (logDate < thirtyDaysAgo) return false;

      // 2. Conditional date query filter
      if (logFilterDate) {
        const logDateString = log.timestamp ? log.timestamp.slice(0, 10) : '';
        if (logDateString !== logFilterDate) return false;
      }

      // 3. Conditional hour query filter
      if (logFilterHour !== 'all') {
        const logHourString = log.timestamp ? log.timestamp.slice(11, 13) : '';
        if (logHourString !== logFilterHour) return false;
      }

      return true;
    });
  };

  const archivedLogs = getThirtyDaysLogs();

  // Excel spreadsheet export helper (including current aggregate)
  const handleDownloadExcel = () => {
    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>배터리 MES 생산보고서</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta charset="utf-8">
        <style>
          body { font-family: 'Malgun Gothic', 'Segoe UI', sans-serif; }
          .title { font-size: 16pt; font-weight: bold; text-align: center; height: 40px; background-color: #1E3A8A; color: #FFFFFF; vertical-align: middle; }
          .meta-text { font-size: 9pt; color: #64748B; text-align: right; height: 22px; vertical-align: middle; }
          .header { background-color: #1E293B; color: #FFFFFF; font-weight: bold; border: 0.5pt solid #CBD5E1; text-align: center; font-size: 10pt; height: 26px; vertical-align: middle; }
          .data { border: 0.5pt solid #E2E8F0; text-align: center; font-size: 10pt; height: 24px; vertical-align: middle; font-weight: bold; }
          .data-num { border: 0.5pt solid #E2E8F0; text-align: right; font-size: 10pt; font-family: 'Consolas', monospace; height: 24px; vertical-align: middle; }
          .total { background-color: #F1F5F9; font-weight: bold; border: 0.5pt solid #94A3B8; text-align: center; font-size: 10pt; height: 26px; vertical-align: middle; }
          .total-num { background-color: #F1F5F9; font-weight: bold; border: 0.5pt solid #94A3B8; text-align: right; font-size: 10pt; font-family: 'Consolas', monospace; height: 26px; vertical-align: middle; }
        </style>
      </head>
      <body>
        <table border="1" style="border-collapse:collapse;">
          <tr>
            <td colspan="5" class="title">최종 가동 결과 보고서 (MES Production Summary Report)</td>
          </tr>
          <tr>
            <td colspan="5" class="meta-text">보고서 출력 일시: ${new Date().toLocaleString()} | 배터리 스마트 팩토리 MES 시스템</td>
          </tr>
          <tr>
            <td class="header" style="width:140px;">공정 구분 (Process Step)</td>
            <td class="header" style="width:120px;">총 생산 수량 (ea)</td>
            <td class="header" style="width:120px;">양품 수량 (ea)</td>
            <td class="header" style="width:120px;">불량 수량 (ea)</td>
            <td class="header" style="width:110px;">불량률 (%)</td>
          </tr>
    `;

    processData.forEach(row => {
      tableHtml += `
        <tr>
          <td class="data" style="text-align:left; padding-left:10px; background-color:#F8FAFC;">${row.name}</td>
          <td class="data-num" style="padding-right:5px;">${row.생산량.toLocaleString()}</td>
          <td class="data-num" style="padding-right:5px; color:#059669; font-weight:bold;">${row.양품수.toLocaleString()}</td>
          <td class="data-num" style="padding-right:5px; color:#DC2626;">${row.불량수.toLocaleString()}</td>
          <td class="data-num" style="padding-right:5px; color:${row.불량률 > 1 ? '#DC2626' : '#2563EB'}; font-weight:bold;">${row.불량률.toFixed(2)}%</td>
        </tr>
      `;
    });

    tableHtml += `
          <tr>
            <td class="total" style="text-align:left; padding-left:10px;">공장 합계 (Total)</td>
            <td class="total-num" style="padding-right:5px;">${totalProduction.toLocaleString()}</td>
            <td class="total-num" style="padding-right:5px; color:#059669;">${totalGood.toLocaleString()}</td>
            <td class="total-num" style="padding-right:5px; color:#DC2626;">${totalDefect.toLocaleString()}</td>
            <td class="total-num" style="padding-right:5px; color:#DC2626; font-weight:bold;">${overallDefectRate.toFixed(2)}%</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MES_Factory_Production_Report_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upper Main Box (Metrics & Charts) */}
      <div className="flex flex-col gap-4 bg-white border border-slate-200 p-4">
        {/* Header with Excel Export Button */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-dense-base font-bold text-slate-800">최종 가동 결과 보고서 (Production Report)</h2>
          </div>
          
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-dense-xs font-semibold rounded-none transition-colors shadow-sm select-none"
            title="회사 공유용 정갈한 Excel 문서 양식으로 내보냅니다."
          >
            <Download className="h-4 w-4" />
            <span>Excel 다운로드</span>
          </button>
        </div>

        {/* Main KPI Summary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-dense-xs font-semibold">
          <div className="border border-slate-200 p-3 bg-slate-50">
            <div className="flex justify-between items-center text-slate-400 font-bold mb-1">
              <span className="select-none">총 생산 수량</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-dense-lg font-extrabold text-slate-800 font-mono">{totalProduction.toLocaleString()} ea</span>
          </div>

          <div className="border border-slate-200 p-3 bg-slate-50">
            <div className="flex justify-between items-center text-slate-400 font-bold mb-1">
              <span className="select-none">총 양품 수량</span>
              <CheckSquare className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-dense-lg font-extrabold text-emerald-600 font-mono">{totalGood.toLocaleString()} ea</span>
          </div>

          <div className="border border-slate-200 p-3 bg-slate-50">
            <div className="flex justify-between items-center text-slate-400 font-bold mb-1">
              <span className="select-none">총 불량 수량</span>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-dense-lg font-extrabold text-red-500 font-mono">{totalDefect.toLocaleString()} ea</span>
          </div>

          <div className="border border-slate-200 p-3 bg-slate-50">
            <div className="flex justify-between items-center text-slate-400 font-bold mb-1">
              <span className="select-none">종합 불량률</span>
              <Award className="h-4 w-4 text-violet-500" />
            </div>
            <span className="text-dense-lg font-extrabold text-slate-800 font-mono">{overallDefectRate.toFixed(2)}%</span>
          </div>
        </div>

        {/* Chart and process details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
          {/* Left: Bar chart (col-span-7) */}
          <div className="border border-slate-200 p-3 lg:col-span-7">
            <h3 className="text-dense-sm font-bold text-slate-700 mb-3 select-none">공정별 불량률 추이</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#64748B" />
                  <YAxis unit="%" tick={{ fontSize: 9 }} stroke="#64748B" />
                  <Tooltip formatter={(value) => [`${value}%`, '불량률']} contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="불량률" fill="#EF4444">
                    <Cell fill="#2563EB" />
                    <Cell fill="#10B981" />
                    <Cell fill="#8B5CF6" />
                    <Cell fill="#F97316" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Process summary list table (col-span-5) */}
          <div className="border border-slate-200 p-3 lg:col-span-5 text-dense-xs">
            <h3 className="text-dense-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1 select-none">
              공정별 생산 요약 리스트
            </h3>
            <div className="space-y-3 font-semibold">
              {processData.map((data, idx) => {
                const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-orange-600'];
                return (
                  <div key={idx} className="border border-slate-100 p-2.5 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${colors[idx]}`}></span>
                      <span className="text-slate-800">{data.name}</span>
                    </div>
                    <div className="flex gap-4 font-mono text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans select-none">생산수</span>
                        <span>{data.생산량.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans select-none">양품수</span>
                        <span className="text-emerald-600 font-bold">{data.양품수.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans select-none">불량률</span>
                        <span className="text-red-500 font-bold">{data.불량률}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* LEVEL 3: 30-Day Cumulative Log History Card */}
      <div className="flex flex-col gap-4 bg-white border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-violet-600" />
            <div className="flex flex-col">
              <h3 className="text-dense-base font-bold text-slate-800">30일 종합 가동 로그 이력 (Historical Logs Archive)</h3>
              <p className="text-[10px] text-slate-400 font-semibold select-none">30일 이내에 수집된 가동 결과, 이상 발생 및 현장 조치 이력이 삭제 없이 누적 보관됩니다.</p>
            </div>
          </div>

          {/* Conditional Query Filters */}
          <div className="flex gap-3 items-center">
            {/* Date Search */}
            <div className="relative flex items-center border border-slate-200 bg-white h-8 px-2 select-none">
              <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
              <input
                type="date"
                value={logFilterDate}
                onChange={(e) => setLogFilterDate(e.target.value)}
                className="bg-transparent border-0 text-[11px] font-semibold text-slate-700 outline-none w-26 cursor-pointer focus:ring-0"
              />
            </div>

            {/* Hour Search */}
            <div className="relative flex items-center border border-slate-200 bg-white h-8 px-2 select-none">
              <Clock className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
              <select
                value={logFilterHour}
                onChange={(e) => setLogFilterHour(e.target.value)}
                className="bg-transparent border-0 text-[11px] font-semibold text-slate-700 outline-none w-20 cursor-pointer focus:ring-0"
              >
                <option value="all">전체 시간</option>
                {Array.from({ length: 24 }).map((_, h) => {
                  const hourStr = String(h).padStart(2, '0');
                  return (
                    <option key={hourStr} value={hourStr}>
                      {hourStr}시
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Dense Table Grid for Logs Archive */}
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-left border-collapse text-dense-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold select-none sticky top-0 z-10">
                <th className="p-2.5">발생 시각 (Timestamp)</th>
                <th className="p-2.5">로그 분류 (Type)</th>
                <th className="p-2.5">발생 공정 (Process)</th>
                <th className="p-2.5">로그 세부 내용 (Message)</th>
                <th className="p-2.5">조치 상태 (Status)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {archivedLogs.map((log, idx) => {
                let typeBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                if (log.type === 'error') typeBadge = 'bg-red-50 text-red-700 border-red-200';
                else if (log.type === 'warning') typeBadge = 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <tr key={log.id || idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-mono text-slate-400">
                      {log.timestamp ? log.timestamp.replace('T', ' ').slice(0, 19) : '-'}
                    </td>
                    <td className="p-2.5">
                      <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold border rounded-none uppercase select-none ${typeBadge}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="p-2.5 font-semibold text-slate-700 uppercase font-mono">{log.processStep || 'general'}</td>
                    <td className="p-2.5 text-slate-700 font-semibold">{log.message}</td>
                    <td className="p-2.5">
                      {log.type === 'error' || log.type === 'warning' ? (
                        log.resolved ? (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">조치 완료</span>
                        ) : (
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 border border-red-200">조치 대기</span>
                        )
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold select-none">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {archivedLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-dense-xs text-slate-400 select-none">
                    지정된 조건(날짜: {logFilterDate || 'N/A'}, 시간: {logFilterHour === 'all' ? '전체' : logFilterHour + '시'})에 해당하는 누적 보관 로그가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
