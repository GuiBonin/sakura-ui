import type { PlaygroundProps } from '../docs-kit/Playground';
import type { PropDoc } from '../docs-kit/PropsTable';

export type Category = 'Ações' | 'Formulários' | 'Exibição' | 'Feedback' | 'Sobreposição';

export interface ExampleDoc {
  title: string;
  description?: string;
  /** Caminho em `src/examples`, sem extensão. Ex.: "button/Variants". */
  path: string;
}

export interface ComponentDoc {
  slug: string;
  name: string;
  category: Category;
  summary: string;
  /** Nomes exportados usados no import de exemplo. */
  imports: string[];
  playground?: PlaygroundProps;
  examples: ExampleDoc[];
  props: PropDoc[];
  /** Tabelas extras, como as subpartes de componentes compostos. */
  extraProps?: { title: string; props: PropDoc[] }[];
  a11y: string[];
}
