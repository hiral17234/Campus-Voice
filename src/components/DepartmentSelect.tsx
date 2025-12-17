import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Department, DEPARTMENT_LABELS } from '@/types';

interface DepartmentSelectProps {
  value: Department | '';
  customValue?: string;
  onValueChange: (department: Department, customDepartment?: string) => void;
  disabled?: boolean;
  className?: string;
}

export function DepartmentSelect({ 
  value, 
  customValue = '', 
  onValueChange, 
  disabled = false,
  className = ''
}: DepartmentSelectProps) {
  const [showCustomInput, setShowCustomInput] = useState(value === 'other');
  const [customDepartment, setCustomDepartment] = useState(customValue);

  const handleValueChange = (newValue: string) => {
    const dept = newValue as Department;
    if (dept === 'other') {
      setShowCustomInput(true);
      // Don't call onValueChange until custom input is provided
    } else {
      setShowCustomInput(false);
      setCustomDepartment('');
      onValueChange(dept);
    }
  };

  const handleCustomInputChange = (input: string) => {
    setCustomDepartment(input);
    if (input.trim()) {
      onValueChange('other', input.trim());
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Select 
        value={value} 
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full h-8 text-xs">
          <SelectValue placeholder="Assign Dept" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {(showCustomInput || value === 'other') && (
        <Input
          placeholder="Please specify department *"
          value={customDepartment}
          onChange={(e) => handleCustomInputChange(e.target.value)}
          className="h-8 text-xs"
          disabled={disabled}
        />
      )}
    </div>
  );
}
