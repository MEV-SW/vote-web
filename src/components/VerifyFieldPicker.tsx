import type { VerifyField } from '../lib/verifyFields';
import { VERIFY_FIELD_OPTIONS } from '../lib/verifyFields';
import { Label } from '@/components/ui/label';

interface VerifyFieldPickerProps {
  value: VerifyField[];
  onChange: (next: VerifyField[]) => void;
  disabled?: boolean;
}

export function VerifyFieldPicker({ value, onChange, disabled }: VerifyFieldPickerProps) {
  const toggle = (field: VerifyField) => {
    if (disabled) return;
    if (value.includes(field)) {
      if (value.length <= 1) return;
      onChange(value.filter((f) => f !== field));
    } else {
      onChange([...value, field]);
    }
  };

  return (
    <div className="vf-picker">
      <Label>인증 항목</Label>
      <p className="vf-hint">투표자가 입력·대조할 항목만 선택하세요. 선택한 항목만 목록에 등록합니다.</p>
      <div className="vf-picker-row">
        {VERIFY_FIELD_OPTIONS.map((opt) => {
          const on = value.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              className={`vf-chip${on ? ' is-on' : ''}`}
              disabled={disabled}
              onClick={() => toggle(opt.id)}
              aria-pressed={on}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
