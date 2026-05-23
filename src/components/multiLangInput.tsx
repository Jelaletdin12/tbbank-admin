import { FormInput, } from '@/components/formInput'

export interface MultiLangField {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export interface MultiLangInputProps {
  fields: {
    tk: MultiLangField;
    ru: MultiLangField;
    en: MultiLangField;
  };
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'textarea';
  rows?: number;
}

export function MultiLangInput({ fields, placeholder, disabled, type = 'text', rows }: MultiLangInputProps) {
  const langs = [
    { code: 'TK', key: 'tk' as const },
    { code: 'RU', key: 'ru' as const },
    { code: 'EN', key: 'en' as const },
  ];

  return (
    <div className="flex flex-col gap-3 w-full">
      {langs.map(({ code, key }) => {
        const field = fields[key];
        return (
          <div key={key} className="flex items-start gap-2.5">
            <span className=" inline-flex items-center justify-center border border-border bg-muted/50 text-muted-foreground text-[12px] font-bold p-1.5  rounded min-w-[28px] shrink-0 select-none">
              {code}
            </span>
            <div className="flex-1 min-w-0">
              <FormInput
                type={type}
                rows={rows}
                value={field.value}
                onChange={field.onChange}
                placeholder={placeholder ? `${placeholder} (${code})` : undefined}
                error={field.error}
                disabled={disabled}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
