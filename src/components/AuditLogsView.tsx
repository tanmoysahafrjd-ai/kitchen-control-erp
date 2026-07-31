import React from 'react';
import { AuditLog, Branch } from '../types';
import { ShieldAlert, Calendar, UserCheck } from 'lucide-react';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
  branches: Branch[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs, branches }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit & Activity Logs</h2>
          <p className="text-sm text-slate-500 mt-1">
            Complete traceability of all purchases, store issues, recipe changes, and user operations.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Action Type</th>
              <th className="py-3.5 px-4">Activity Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {auditLogs.map((log) => {
              const branch = branches.find((b) => b.id === log.branchId);
              return (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>{log.timestamp}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{log.userName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg uppercase font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">{log.details}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
