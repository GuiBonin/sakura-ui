import { Input, Select, Switch } from '@guibonin/sakura-ui';
import { useId, useState, type ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';
import type { PropValue } from './jsx';

export type Control =
  | { type: 'select'; prop: string; label: string; options: string[]; default: string }
  | { type: 'boolean'; prop: string; label: string; default: boolean }
  | { type: 'text'; prop: string; label: string; default: string }
  | { type: 'number'; prop: string; label: string; default: number; min?: number; max?: number };

export type ControlValues = Record<string, PropValue>;

export interface PlaygroundProps {
  controls: Control[];
  render: (values: ControlValues) => ReactNode;
  code: (values: ControlValues) => string;
}

export function initialValues(controls: Control[]): ControlValues {
  return Object.fromEntries(controls.map((control) => [control.prop, control.default]));
}

/** Prévia ao vivo com controles de props e o código correspondente. */
export function Playground({ controls, render, code }: PlaygroundProps) {
  const id = useId();
  const [values, setValues] = useState<ControlValues>(() => initialValues(controls));
  const set = (prop: string, value: PropValue) =>
    setValues((current) => ({ ...current, [prop]: value }));

  return (
    <section className="docs-playground" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="docs-playground__title">
        Playground
      </h2>
      <div className="docs-playground__grid">
        <div className="docs-preview docs-playground__preview">{render(values)}</div>
        <form
          className="docs-playground__controls"
          aria-label="Propriedades"
          onSubmit={(event) => event.preventDefault()}
        >
          {controls.map((control) => {
            const value = values[control.prop];
            switch (control.type) {
              case 'select':
                return (
                  <Select
                    key={control.prop}
                    label={control.label}
                    size="sm"
                    value={String(value)}
                    onValueChange={(next) => set(control.prop, next)}
                    options={control.options.map((option) => ({ value: option, label: option }))}
                  />
                );
              case 'boolean':
                return (
                  <Switch
                    key={control.prop}
                    label={control.label}
                    size="sm"
                    checked={Boolean(value)}
                    onCheckedChange={(next) => set(control.prop, next)}
                  />
                );
              case 'number':
                return (
                  <Input
                    key={control.prop}
                    label={control.label}
                    size="sm"
                    type="number"
                    min={control.min}
                    max={control.max}
                    value={String(value ?? '')}
                    onChange={(event) =>
                      set(
                        control.prop,
                        event.target.value === '' ? undefined : Number(event.target.value),
                      )
                    }
                  />
                );
              default:
                return (
                  <Input
                    key={control.prop}
                    label={control.label}
                    size="sm"
                    value={String(value ?? '')}
                    onChange={(event) => set(control.prop, event.target.value)}
                  />
                );
            }
          })}
        </form>
      </div>
      <CodeBlock code={code(values)} title="Código gerado" />
    </section>
  );
}
