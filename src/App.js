import React, { useState, useEffect } from 'react';
import { Search, Settings, User, Plus, Minus, Edit3, Calculator, Eye, EyeOff } from 'lucide-react';

const AttendanceApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([
    { id: '001', firstName: 'สมชาย', lastName: 'ใจดี', attendance: {} },
    { id: '002', firstName: 'สมหญิง', lastName: 'รักงาน', attendance: {} },
  ]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showSalaryPopup, setShowSalaryPopup] = useState(null);

  // Generate 31 days starting from 16th to 15th next month
  const generateDateRange = (month, year) => {
    const dates = [];
    const startDate = new Date(year, month, 16);
    for (let i = 0; i < 31; i++) {
      const date = new Date(startDate);
      date.setDate(16 + i);
      dates.push({
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        key: `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      });
    }
    return dates;
  };

  const dateRange = generateDateRange(selectedMonth, selectedYear);

  const toggleAttendance = (employeeId, dateKey) => {
    if (!isAdminMode) return;
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const currentStatus = emp.attendance[dateKey];
        const newStatus = currentStatus === 'N' ? 'F' : currentStatus === 'F' ? '' : 'N';
        return {
          ...emp,
          attendance: { ...emp.attendance, [dateKey]: newStatus }
        };
      }
      return emp;
    }));
  };

  const addEmployee = () => {
    const newId = String(employees.length + 1).padStart(3, '0');
    setEmployees(prev => [...prev, {
      id: newId,
      firstName: 'พนักงานใหม่',
      lastName: '',
      attendance: {},
      allowances: {
        holiday: { enabled: false, amount: 0 },
        meal: { enabled: false, amount: 0 },
        diligence: { enabled: false, amount: 0 },
        transport: { enabled: false, amount: 0 }
      },
      deductions: {
        socialSecurity: { enabled: false, amount: 0 },
        lifeInsurance: { enabled: false, amount: 0 },
        advance: { enabled: false, amount: 0 },
        equipment: { enabled: false, amount: 0 }
      }
    }]);
  };

  const removeEmployee = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const updateEmployee = (id, field, value) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
  };

  const updateAllowanceOrDeduction = (id, type, field, key, value) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        return {
          ...emp,
          [type]: {
            ...emp[type],
            [field]: { ...emp[type][field], [key]: value }
          }
        };
      }
      return emp;
    }));
  };

  const calculateSalary = (employee) => {
    const dailyWage = 600;
    let workDays = 0;
    let bonusDays = 0;

    // Count work days and calculate 7-day bonus
    const attendanceKeys = Object.keys(employee.attendance).sort();
    let consecutiveDays = 0;
    for (const key of attendanceKeys) {
      if (employee.attendance[key] === 'N') {
        workDays++;
        consecutiveDays++;
        if (consecutiveDays === 7) {
          bonusDays++;
          consecutiveDays = 0;
        }
      } else {
        consecutiveDays = 0;
      }
    }

    let baseSalary = (workDays + bonusDays) * dailyWage;

    // Calculate allowances
    let totalAllowances = 0;
    if (employee.allowances) {
      Object.values(employee.allowances).forEach(allowance => {
        if (allowance.enabled && allowance.amount) {
          totalAllowances += parseFloat(allowance.amount) || 0;
        }
      });
    }

    // Calculate deductions
    let totalDeductions = 0;
    if (employee.deductions) {
      Object.values(employee.deductions).forEach(deduction => {
        if (deduction.enabled && deduction.amount) {
          totalDeductions += parseFloat(deduction.amount) || 0;
        }
      });
    }

    const netSalary = baseSalary + totalAllowances - totalDeductions;

    return {
      workDays,
      bonusDays,
      baseSalary,
      totalAllowances,
      totalDeductions,
      netSalary
    };
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin') {
      setIsAdminMode(true);
      setShowPasswordInput(false);
      setAdminPassword('');
    } else {
      alert('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.firstName.includes(searchTerm) ||
    emp.lastName.includes(searchTerm) ||
    emp.id.includes(searchTerm)
  );

  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ระบบลงเวลาทำงาน
          </h1>
          <div className="flex gap-2">
            {!isAdminMode ? (
              <button
                onClick={() => setShowPasswordInput(!showPasswordInput)}
                className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin
              </button>
            ) : (
              <button
                onClick={() => setIsAdminMode(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 px-4 py-2 rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
              >
                ออกจาก Admin
              </button>
            )}
          </div>
        </div>

        {showPasswordInput && (
          <div className="mb-4 flex gap-2">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="รหัสผ่าน Admin"
              className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
            <button
              onClick={handleAdminLogin}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        )}

        {/* Date Selection */}
        <div className="flex gap-2 mb-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {months.map((month, index) => (
              <option key={index} value={index} className="bg-gray-800 text-white">
                {month}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {Array.from({ length: 10 }, (_, i) => selectedYear - 5 + i).map(year => (
              <option key={year} value={year} className="bg-gray-800 text-white">
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
          <input
            type="text"
            placeholder="ค้นหาพนักงาน (ชื่อ, สกุล, รหัส)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Admin Controls */}
        {isAdminMode && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={addEmployee}
              className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              เพิ่มพนักงาน
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            {/* Employee Info */}
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    {editingEmployee === employee.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={employee.firstName}
                          onChange={(e) => updateEmployee(employee.id, 'firstName', e.target.value)}
                          className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
                        />
                        <input
                          type="text"
                          value={employee.lastName}
                          onChange={(e) => updateEmployee(employee.id, 'lastName', e.target.value)}
                          className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
                        />
                        <input
                          type="text"
                          value={employee.id}
                          onChange={(e) => updateEmployee(employee.id, 'id', e.target.value)}
                          className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm w-20"
                        />
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-lg">{employee.firstName} {employee.lastName}</h3>
                        <p className="text-white/70">รหัส: {employee.id}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSalaryPopup(employee.id)}
                    className="bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 rounded-lg text-sm hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-1"
                  >
                    <Calculator className="w-4 h-4" />
                    สรุป
                  </button>
                  {isAdminMode && (
                    <>
                      <button
                        onClick={() => setEditingEmployee(editingEmployee === employee.id ? null : employee.id)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeEmployee(employee.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingEmployee === employee.id && (
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => setEditingEmployee(null)}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    บันทึก
                  </button>
                </div>
              )}
            </div>

            {/* Attendance Grid */}
            <div className="p-4">
              <div className="grid grid-cols-8 gap-1 mb-4">
                {dateRange.map((date) => (
                  <div key={date.key} className="text-center">
                    <div className="text-xs text-white/70 mb-1">{date.day}</div>
                    <button
                      onClick={() => toggleAttendance(employee.id, date.key)}
                      disabled={!isAdminMode}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-300 ${
                        employee.attendance[date.key] === 'N'
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : employee.attendance[date.key] === 'F'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-white/20 hover:bg-white/30 text-white/70'
                      } ${isAdminMode ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {employee.attendance[date.key] || '-'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Allowances and Deductions - Only in Admin Mode */}
              {isAdminMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Allowances */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-400">รายได้เพิ่มเติม</h4>
                    {[
                      { key: 'holiday', label: 'วันหยุดนักขัตฤกษ์' },
                      { key: 'meal', label: 'เบี้ยเลี้ยง' },
                      { key: 'diligence', label: 'เบี้ยขยัน' },
                      { key: 'transport', label: 'ค่าจราจร' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={employee.allowances?.[key]?.enabled || false}
                          onChange={(e) => updateAllowanceOrDeduction(employee.id, 'allowances', key, 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="flex-1">{label}</span>
                        <input
                          type="number"
                          value={employee.allowances?.[key]?.amount || 0}
                          onChange={(e) => updateAllowanceOrDeduction(employee.id, 'allowances', key, 'amount', e.target.value)}
                          className="w-20 bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Deductions */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-400">รายจ่าย</h4>
                    {[
                      { key: 'socialSecurity', label: 'ค่าประกันสังคม' },
                      { key: 'lifeInsurance', label: 'ค่าประกันชีวิต' },
                      { key: 'advance', label: 'ค่าเบิกล่วงหน้า' },
                      { key: 'equipment', label: 'ค่าเบิกอุปกรณ์' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={employee.deductions?.[key]?.enabled || false}
                          onChange={(e) => updateAllowanceOrDeduction(employee.id, 'deductions', key, 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="flex-1">{label}</span>
                        <input
                          type="number"
                          value={employee.deductions?.[key]?.amount || 0}
                          onChange={(e) => updateAllowanceOrDeduction(employee.id, 'deductions', key, 'amount', e.target.value)}
                          className="w-20 bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-xs"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Salary Summary Popup */}
      {showSalaryPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">สรุปรายได้</h3>
              <button
                onClick={() => setShowSalaryPopup(null)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            {(() => {
              const employee = employees.find(emp => emp.id === showSalaryPopup);
              const salary = calculateSalary(employee);
              return (
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-lg">{employee.firstName} {employee.lastName}</h4>
                    <p className="text-white/70">รหัส: {employee.id}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>วันที่ทำงาน:</span>
                      <span className="text-green-400">{salary.workDays} วัน</span>
                    </div>
                    <div className="flex justify-between">
                      <span>โบนัส 7 วันติด:</span>
                      <span className="text-green-400">{salary.bonusDays} วัน</span>
                    </div>
                    <div className="flex justify-between">
                      <span>เงินเดือนพื้นฐาน:</span>
                      <span className="text-blue-400">{salary.baseSalary.toLocaleString()} บาท</span>
                    </div>
                    <div className="flex justify-between">
                      <span>รายได้เพิ่มเติม:</span>
                      <span className="text-green-400">+{salary.totalAllowances.toLocaleString()} บาท</span>
                    </div>
                    <div className="flex justify-between">
                      <span>รายจ่าย:</span>
                      <span className="text-red-400">-{salary.totalDeductions.toLocaleString()} บาท</span>
                    </div>
                    <hr className="border-white/20" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>รวมทั้งหมด:</span>
                      <span className="text-yellow-400">{salary.netSalary.toLocaleString()} บาท</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceApp;
