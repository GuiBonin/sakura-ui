import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Input,
  ProgressBar,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Tooltip,
  useToast,
  type AvatarSize,
  type AvatarStatus,
  type BadgeAppearance,
  type BadgeTone,
  type ButtonSize,
  type ButtonVariant,
  type CardVariant,
  type InputSize,
  type ProgressTone,
  type Side,
  type SkeletonVariant,
  type SpinnerSize,
  type SpinnerTone,
  type ToastTone,
} from '@guibonin/sakura-ui';
import { Mail } from 'lucide-react';
import { toJsx } from '../docs-kit/jsx';
import type { Category, ComponentDoc } from './types';

const sizes = ['sm', 'md', 'lg'];
const str = (value: unknown) => String(value ?? '');

function ToastDemo({ tone, title }: { tone: ToastTone; title: string }) {
  const { toast } = useToast();
  return (
    <Button variant="outline" onClick={() => toast({ title, tone })}>
      Mostrar notificação
    </Button>
  );
}

export const components: ComponentDoc[] = [
  {
    slug: 'button',
    name: 'Button',
    category: 'Ações',
    summary:
      'Botão para ações. Tem cinco variantes, três tamanhos, ícones e estado de carregamento que mantém o foco.',
    imports: ['Button'],
    playground: {
      controls: [
        {
          type: 'select',
          prop: 'variant',
          label: 'variant',
          options: ['solid', 'soft', 'outline', 'ghost', 'danger'],
          default: 'solid',
        },
        { type: 'select', prop: 'size', label: 'size', options: sizes, default: 'md' },
        { type: 'text', prop: 'children', label: 'Texto', default: 'Salvar alterações' },
        { type: 'boolean', prop: 'loading', label: 'loading', default: false },
        { type: 'boolean', prop: 'disabled', label: 'disabled', default: false },
        { type: 'boolean', prop: 'fullWidth', label: 'fullWidth', default: false },
      ],
      render: (v) => (
        <Button
          variant={v.variant as ButtonVariant}
          size={v.size as ButtonSize}
          loading={Boolean(v.loading)}
          disabled={Boolean(v.disabled)}
          fullWidth={Boolean(v.fullWidth)}
        >
          {str(v.children)}
        </Button>
      ),
      code: ({ children, ...v }) =>
        toJsx('Button', v, str(children), {
          variant: 'solid',
          size: 'md',
          loading: false,
          disabled: false,
          fullWidth: false,
        }),
    },
    examples: [
      { title: 'Variantes', path: 'button/Variants' },
      { title: 'Tamanhos', path: 'button/Sizes' },
      {
        title: 'Com ícones',
        description: 'Botões só com ícone precisam de aria-label.',
        path: 'button/WithIcons',
      },
      {
        title: 'Carregando',
        description: 'Clique para ver o estado de carregamento por 2 segundos.',
        path: 'button/Loading',
      },
    ],
    props: [
      {
        name: 'variant',
        type: "'solid' | 'soft' | 'outline' | 'ghost' | 'danger'",
        default: "'solid'",
        description: 'Estilo visual.',
      },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Tamanho.' },
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: 'Mostra spinner, marca aria-busy e bloqueia cliques sem tirar o foco.',
      },
      {
        name: 'loadingText',
        type: 'string',
        description: 'Nome acessível durante o carregamento.',
      },
      { name: 'leftIcon / rightIcon', type: 'ReactNode', description: 'Ícones decorativos.' },
      {
        name: 'iconOnly',
        type: 'boolean',
        default: 'false',
        description: 'Botão quadrado só com ícone. Exige aria-label.',
      },
      {
        name: 'fullWidth',
        type: 'boolean',
        default: 'false',
        description: 'Ocupa a largura toda.',
      },
      {
        name: 'type',
        type: "'button' | 'submit' | 'reset'",
        default: "'button'",
        description: 'Padrão button para não enviar formulários sem querer.',
      },
    ],
    a11y: [
      'Usa o elemento <button> nativo: Enter e Espaço funcionam sem código extra.',
      'Em loading usa aria-disabled em vez de disabled, então o botão continua na ordem do Tab.',
      'O anel de foco aparece só na navegação por teclado (:focus-visible).',
    ],
  },
  {
    slug: 'dropdown',
    name: 'Dropdown',
    category: 'Ações',
    summary: 'Menu de ações aberto por um botão, seguindo o padrão Menu Button do WAI-ARIA.',
    imports: ['Dropdown'],
    examples: [{ title: 'Menu de ações', path: 'dropdown/Actions' }],
    props: [
      {
        name: 'trigger',
        type: 'ReactElement',
        required: true,
        description: 'Elemento que abre o menu.',
      },
      {
        name: 'items',
        type: 'DropdownItem[]',
        required: true,
        description:
          "Itens: ação ({ label, onSelect, icon, shortcut, disabled, danger }), { type: 'separator' } ou { type: 'label', label }.",
      },
      {
        name: 'placement',
        type: 'Placement',
        default: "'bottom-start'",
        description: 'Posição preferida. Inverte sozinho quando falta espaço.',
      },
      {
        name: 'aria-label',
        type: 'string',
        description: 'Nome do menu. Padrão: texto do gatilho.',
      },
      {
        name: 'onOpenChange',
        type: '(open: boolean) => void',
        description: 'Avisa quando abre ou fecha.',
      },
    ],
    a11y: [
      'Enter, Espaço ou ↓ abrem no primeiro item. ↑ abre no último.',
      'Setas circulam pelos itens, Home e End vão às pontas e letras buscam pelo nome.',
      'Esc fecha e devolve o foco ao gatilho. Dentro de um Modal, fecha só o menu.',
    ],
  },
  {
    slug: 'input',
    name: 'Input',
    category: 'Formulários',
    summary: 'Campo de texto com rótulo, ajuda e erro ligados ao campo para leitores de tela.',
    imports: ['Input'],
    playground: {
      controls: [
        { type: 'text', prop: 'label', label: 'label', default: 'E-mail' },
        { type: 'text', prop: 'placeholder', label: 'placeholder', default: 'voce@exemplo.com' },
        { type: 'text', prop: 'hint', label: 'hint', default: 'Nunca compartilhamos seu e-mail.' },
        { type: 'text', prop: 'error', label: 'error', default: '' },
        { type: 'select', prop: 'size', label: 'size', options: sizes, default: 'md' },
        { type: 'boolean', prop: 'required', label: 'required', default: false },
        { type: 'boolean', prop: 'disabled', label: 'disabled', default: false },
      ],
      render: (v) => (
        <div style={{ width: '100%', maxWidth: 320 }}>
          <Input
            label={str(v.label)}
            placeholder={str(v.placeholder)}
            hint={str(v.hint) || undefined}
            error={str(v.error) || undefined}
            size={v.size as InputSize}
            required={Boolean(v.required)}
            disabled={Boolean(v.disabled)}
            rightIcon={<Mail />}
          />
        </div>
      ),
      code: (v) =>
        toJsx(
          'Input',
          { ...v, hint: str(v.hint) || undefined, error: str(v.error) || undefined },
          undefined,
          {
            size: 'md',
            required: false,
            disabled: false,
          },
        ),
    },
    examples: [
      { title: 'Básico', path: 'input/Basic' },
      { title: 'Com ícones', path: 'input/WithIcon' },
      {
        title: 'Validação',
        description: 'Digite menos de 8 caracteres.',
        path: 'input/Validation',
      },
    ],
    props: [
      { name: 'label', type: 'ReactNode', description: 'Rótulo visível. Sem ele, use aria-label.' },
      { name: 'hint', type: 'ReactNode', description: 'Ajuda abaixo do campo.' },
      { name: 'error', type: 'ReactNode', description: 'Mensagem de erro. Marca aria-invalid.' },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description: 'Altura do campo.',
      },
      { name: 'leftIcon / rightIcon', type: 'ReactNode', description: 'Ícones decorativos.' },
      {
        name: 'wrapperClassName',
        type: 'string',
        description: 'Classe do wrapper. className vai no <input>.',
      },
      {
        name: '...props',
        type: 'InputHTMLAttributes',
        description: 'Qualquer atributo nativo de <input>.',
      },
    ],
    a11y: [
      'Rótulo associado por htmlFor. Ajuda e erro entram no aria-describedby, somando o que você passar.',
      'O asterisco de obrigatório é decorativo. O campo usa o atributo required.',
    ],
  },
  {
    slug: 'select',
    name: 'Select',
    category: 'Formulários',
    summary:
      'Seleção única com lista estilizada, teclado completo e busca por digitação. Segue o padrão select-only combobox do WAI-ARIA.',
    imports: ['Select'],
    playground: {
      controls: [
        { type: 'text', prop: 'label', label: 'label', default: 'Cor favorita' },
        { type: 'text', prop: 'placeholder', label: 'placeholder', default: 'Selecione uma opção' },
        { type: 'select', prop: 'size', label: 'size', options: sizes, default: 'md' },
        { type: 'text', prop: 'error', label: 'error', default: '' },
        { type: 'boolean', prop: 'disabled', label: 'disabled', default: false },
      ],
      render: (v) => (
        <div style={{ width: '100%', maxWidth: 320 }}>
          <Select
            label={str(v.label)}
            placeholder={str(v.placeholder)}
            size={v.size as InputSize}
            error={str(v.error) || undefined}
            disabled={Boolean(v.disabled)}
            options={[
              { value: 'sakura', label: 'Rosa sakura' },
              { value: 'violeta', label: 'Violeta' },
              { value: 'carvao', label: 'Preto carvão' },
            ]}
          />
        </div>
      ),
      code: (v) =>
        toJsx(
          'Select',
          { ...v, error: str(v.error) || undefined, options: { expr: 'cores' } },
          undefined,
          { size: 'md', disabled: false, placeholder: 'Selecione uma opção' },
        ),
    },
    examples: [
      {
        title: 'Básico',
        description: 'Inclui uma opção desabilitada e outra com descrição.',
        path: 'select/Basic',
      },
      { title: 'Controlado', path: 'select/Controlled' },
    ],
    props: [
      {
        name: 'options',
        type: 'SelectOption[]',
        required: true,
        description: '{ value, label, disabled?, description? }.',
      },
      {
        name: 'value / defaultValue',
        type: 'string | null',
        description: 'Valor controlado ou inicial.',
      },
      {
        name: 'onValueChange',
        type: '(value: string) => void',
        description: 'Chamado quando a seleção muda.',
      },
      {
        name: 'label / hint / error',
        type: 'ReactNode',
        description: 'Mesmo comportamento do Input.',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: "'Selecione uma opção'",
        description: 'Texto sem seleção.',
      },
      {
        name: 'name',
        type: 'string',
        description: 'Envia o valor em formulários por um input oculto.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description: 'Altura do campo.',
      },
    ],
    a11y: [
      'Fechado: ↓, ↑, Enter, Espaço, Home e End abrem a lista. Uma letra abre na opção correspondente.',
      'Aberto: setas pulam opções desabilitadas, Enter e Espaço escolhem, Esc fecha sem mudar e Tab escolhe e segue.',
      'A lista abre em portal, então não é cortada por containers com overflow, como o corpo de um Modal.',
    ],
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    category: 'Formulários',
    summary: 'Caixa de seleção nativa estilizada, com estado indeterminado para "selecionar tudo".',
    imports: ['Checkbox'],
    playground: {
      controls: [
        { type: 'text', prop: 'label', label: 'label', default: 'Aceito os termos' },
        { type: 'text', prop: 'description', label: 'description', default: '' },
        { type: 'boolean', prop: 'indeterminate', label: 'indeterminate', default: false },
        { type: 'boolean', prop: 'disabled', label: 'disabled', default: false },
        { type: 'select', prop: 'size', label: 'size', options: ['sm', 'md'], default: 'md' },
      ],
      render: (v) => (
        <Checkbox
          label={str(v.label)}
          description={str(v.description) || undefined}
          indeterminate={Boolean(v.indeterminate)}
          disabled={Boolean(v.disabled)}
          size={v.size as 'sm' | 'md'}
        />
      ),
      code: (v) =>
        toJsx('Checkbox', { ...v, description: str(v.description) || undefined }, undefined, {
          indeterminate: false,
          disabled: false,
          size: 'md',
        }),
    },
    examples: [
      { title: 'Básico', path: 'checkbox/Basic' },
      {
        title: 'Selecionar tudo',
        description: 'O estado misto aparece quando só alguns itens estão marcados.',
        path: 'checkbox/SelectAll',
      },
    ],
    props: [
      { name: 'label', type: 'ReactNode', description: 'Rótulo clicável.' },
      {
        name: 'description',
        type: 'ReactNode',
        description: 'Texto auxiliar, ligado por aria-describedby.',
      },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Estado misto.' },
      {
        name: 'onCheckedChange',
        type: '(checked: boolean) => void',
        description: 'Atalho para o novo estado.',
      },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Tamanho da caixa.' },
      {
        name: '...props',
        type: 'InputHTMLAttributes',
        description: 'checked, defaultChecked, name, value, onChange...',
      },
    ],
    a11y: [
      'É um <input type="checkbox"> real: teclado, formulário e leitores de tela funcionam como no navegador.',
      'O estado indeterminado é anunciado como "misto".',
    ],
  },
  {
    slug: 'switch',
    name: 'Switch',
    category: 'Formulários',
    summary: 'Interruptor liga/desliga para preferências que valem na hora.',
    imports: ['Switch'],
    playground: {
      controls: [
        { type: 'text', prop: 'label', label: 'label', default: 'Modo avião' },
        { type: 'select', prop: 'size', label: 'size', options: ['sm', 'md'], default: 'md' },
        { type: 'boolean', prop: 'defaultChecked', label: 'defaultChecked', default: true },
        { type: 'boolean', prop: 'disabled', label: 'disabled', default: false },
      ],
      render: (v) => (
        <Switch
          key={String(v.defaultChecked)}
          label={str(v.label)}
          size={v.size as 'sm' | 'md'}
          defaultChecked={Boolean(v.defaultChecked)}
          disabled={Boolean(v.disabled)}
        />
      ),
      code: (v) =>
        toJsx('Switch', v, undefined, { size: 'md', defaultChecked: false, disabled: false }),
    },
    examples: [{ title: 'Básico', path: 'switch/Basic' }],
    props: [
      {
        name: 'checked / defaultChecked',
        type: 'boolean',
        description: 'Estado controlado ou inicial.',
      },
      {
        name: 'onCheckedChange',
        type: '(checked: boolean) => void',
        description: 'Chamado ao alternar.',
      },
      {
        name: 'label / description',
        type: 'ReactNode',
        description: 'Rótulo clicável e texto auxiliar.',
      },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Tamanho.' },
      {
        name: 'name / value',
        type: 'string',
        default: "value: 'on'",
        description: 'Envia value no formulário só quando ligado.',
      },
    ],
    a11y: [
      'Botão com role="switch" e aria-checked. Espaço e Enter alternam.',
      'Com movimento reduzido, o polegar troca de lado sem deslizar.',
    ],
  },
  {
    slug: 'card',
    name: 'Card',
    category: 'Exibição',
    summary: 'Container para agrupar conteúdo. Componha com Card.Header, Card.Body e Card.Footer.',
    imports: ['Card'],
    playground: {
      controls: [
        {
          type: 'select',
          prop: 'variant',
          label: 'variant',
          options: ['elevated', 'outlined', 'filled'],
          default: 'elevated',
        },
        {
          type: 'select',
          prop: 'padding',
          label: 'padding',
          options: ['none', 'sm', 'md', 'lg'],
          default: 'md',
        },
        { type: 'boolean', prop: 'interactive', label: 'interactive', default: false },
      ],
      render: (v) => (
        <Card
          variant={v.variant as CardVariant}
          padding={v.padding as 'none' | 'sm' | 'md' | 'lg'}
          interactive={Boolean(v.interactive)}
          style={{ width: '100%', maxWidth: 320 }}
        >
          <Card.Header title="Relatório mensal" description="Atualizado hoje às 9h" />
          <Card.Body>Receita de R$ 12.400, 8% acima do mês passado.</Card.Body>
        </Card>
      ),
      code: (v) =>
        toJsx(
          'Card',
          v,
          '\n  <Card.Header title="Relatório mensal" description="Atualizado hoje às 9h" />\n  <Card.Body>Receita de R$ 12.400, 8% acima do mês passado.</Card.Body>\n',
          { variant: 'elevated', padding: 'md', interactive: false },
        ),
    },
    examples: [
      { title: 'Com cabeçalho, corpo e rodapé', path: 'card/Basic' },
      { title: 'Variantes', path: 'card/Variants' },
    ],
    props: [
      {
        name: 'variant',
        type: "'elevated' | 'outlined' | 'filled'",
        default: "'elevated'",
        description: 'Estilo.',
      },
      {
        name: 'padding',
        type: "'none' | 'sm' | 'md' | 'lg'",
        default: "'md'",
        description: 'Espaço interno.',
      },
      {
        name: 'interactive',
        type: 'boolean',
        default: 'false',
        description: 'Eleva no hover. Para cards clicáveis.',
      },
    ],
    extraProps: [
      {
        title: 'Card.Header',
        props: [
          { name: 'title', type: 'ReactNode', description: 'Título, renderizado como h3.' },
          { name: 'description', type: 'ReactNode', description: 'Texto abaixo do título.' },
          { name: 'action', type: 'ReactNode', description: 'Elemento no canto, como um menu.' },
          {
            name: 'headingLevel',
            type: '2 | 3 | 4 | 5 | 6',
            default: '3',
            description: 'Nível do título.',
          },
        ],
      },
    ],
    a11y: [
      'O título usa um heading real. Ajuste headingLevel para manter a hierarquia da página.',
      'Card interativo não vira botão sozinho: coloque um link ou botão dentro dele.',
    ],
  },
  {
    slug: 'accordion',
    name: 'Accordion',
    category: 'Exibição',
    summary: 'Seções que abrem e fecham, uma por vez ou várias ao mesmo tempo.',
    imports: ['Accordion'],
    examples: [
      { title: 'Perguntas frequentes', path: 'accordion/Faq' },
      { title: 'Vários abertos', path: 'accordion/Multiple' },
    ],
    props: [
      {
        name: 'type',
        type: "'single' | 'multiple'",
        default: "'single'",
        description: 'Um ou vários abertos.',
      },
      {
        name: 'value / defaultValue',
        type: 'string | null | string[]',
        description: 'Itens abertos (array no modo multiple).',
      },
      {
        name: 'onValueChange',
        type: '(value) => void',
        description: 'Chamado ao abrir ou fechar.',
      },
      {
        name: 'collapsible',
        type: 'boolean',
        default: 'true',
        description: 'No modo single, permite fechar o item aberto.',
      },
      {
        name: 'headingLevel',
        type: '2 | 3 | 4 | 5 | 6',
        default: '3',
        description: 'Nível dos títulos.',
      },
    ],
    extraProps: [
      {
        title: 'Accordion.Item',
        props: [
          { name: 'value', type: 'string', required: true, description: 'Identificador do item.' },
          { name: 'title', type: 'ReactNode', required: true, description: 'Texto do cabeçalho.' },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Impede abrir e fechar.',
          },
        ],
      },
    ],
    a11y: [
      'Cada cabeçalho é um botão dentro de um heading, com aria-expanded e aria-controls.',
      '↑ e ↓ movem entre cabeçalhos, Home e End vão às pontas.',
      'Painel fechado fica inert: o conteúdo escondido não recebe foco.',
    ],
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    category: 'Exibição',
    summary: 'Abas para alternar entre visões relacionadas na mesma página.',
    imports: ['Tabs'],
    examples: [
      { title: 'Sublinhado', path: 'tabs/Basic' },
      {
        title: 'Pílulas com ativação manual',
        description: 'As setas movem o foco e Enter troca a aba.',
        path: 'tabs/Pills',
      },
    ],
    props: [
      { name: 'value / defaultValue', type: 'string', description: 'Aba ativa.' },
      {
        name: 'onValueChange',
        type: '(value: string) => void',
        description: 'Chamado ao trocar de aba.',
      },
      {
        name: 'activation',
        type: "'automatic' | 'manual'",
        default: "'automatic'",
        description: 'Troca ao focar ou só com Enter/Espaço.',
      },
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        description: 'Direção e teclas de seta.',
      },
      {
        name: 'variant',
        type: "'underline' | 'pills'",
        default: "'underline'",
        description: 'Estilo.',
      },
    ],
    extraProps: [
      {
        title: 'Tabs.List, Tabs.Tab e Tabs.Panel',
        props: [
          { name: 'Tabs.List aria-label', type: 'string', description: 'Nome do grupo de abas.' },
          {
            name: 'Tabs.Tab value',
            type: 'string',
            required: true,
            description: 'Liga a aba ao painel.',
          },
          {
            name: 'Tabs.Tab disabled',
            type: 'boolean',
            description: 'Aba indisponível, pulada pelas setas.',
          },
          {
            name: 'Tabs.Panel value',
            type: 'string',
            required: true,
            description: 'Mesmo value da aba.',
          },
        ],
      },
    ],
    a11y: [
      'Só a aba ativa entra na ordem do Tab. As setas movem entre abas.',
      'O painel ativo é focável, para quem chega nele pelo Tab.',
    ],
  },
  {
    slug: 'badge',
    name: 'Badge',
    category: 'Exibição',
    summary: 'Rótulo curto para status, categorias e contagens.',
    imports: ['Badge'],
    playground: {
      controls: [
        {
          type: 'select',
          prop: 'tone',
          label: 'tone',
          options: ['neutral', 'primary', 'accent', 'info', 'success', 'warning', 'danger'],
          default: 'primary',
        },
        {
          type: 'select',
          prop: 'appearance',
          label: 'appearance',
          options: ['soft', 'solid', 'outline'],
          default: 'soft',
        },
        { type: 'select', prop: 'size', label: 'size', options: ['sm', 'md'], default: 'md' },
        { type: 'boolean', prop: 'dot', label: 'dot', default: false },
        { type: 'text', prop: 'children', label: 'Texto', default: 'Novo' },
      ],
      render: (v) => (
        <Badge
          tone={v.tone as BadgeTone}
          appearance={v.appearance as BadgeAppearance}
          size={v.size as 'sm' | 'md'}
          dot={Boolean(v.dot)}
        >
          {str(v.children)}
        </Badge>
      ),
      code: ({ children, ...v }) =>
        toJsx('Badge', v, str(children), {
          tone: 'neutral',
          appearance: 'soft',
          size: 'md',
          dot: false,
        }),
    },
    examples: [{ title: 'Tons e aparências', path: 'badge/Tones' }],
    props: [
      {
        name: 'tone',
        type: "'neutral' | 'primary' | 'accent' | 'info' | 'success' | 'warning' | 'danger'",
        default: "'neutral'",
        description: 'Cor.',
      },
      {
        name: 'appearance',
        type: "'soft' | 'solid' | 'outline'",
        default: "'soft'",
        description: 'Preenchimento.',
      },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Tamanho.' },
      { name: 'dot', type: 'boolean', default: 'false', description: 'Ponto antes do texto.' },
      { name: 'icon', type: 'ReactNode', description: 'Ícone decorativo.' },
    ],
    a11y: [
      'Cor não carrega informação sozinha: o texto do badge precisa dizer o status.',
      'Todos os pares de cor passam no contraste AA nos dois temas.',
    ],
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    category: 'Exibição',
    summary: 'Foto de perfil com fallback para iniciais ou ícone quando a imagem falha.',
    imports: ['Avatar'],
    playground: {
      controls: [
        { type: 'text', prop: 'name', label: 'name', default: 'Guilherme Bonin' },
        {
          type: 'select',
          prop: 'size',
          label: 'size',
          options: ['xs', 'sm', 'md', 'lg', 'xl'],
          default: 'lg',
        },
        {
          type: 'select',
          prop: 'shape',
          label: 'shape',
          options: ['circle', 'square'],
          default: 'circle',
        },
        {
          type: 'select',
          prop: 'status',
          label: 'status',
          options: ['nenhum', 'online', 'offline', 'busy', 'away'],
          default: 'online',
        },
      ],
      render: (v) => (
        <Avatar
          name={str(v.name)}
          size={v.size as AvatarSize}
          shape={v.shape as 'circle' | 'square'}
          status={v.status === 'nenhum' ? undefined : (v.status as AvatarStatus)}
        />
      ),
      code: (v) =>
        toJsx('Avatar', { ...v, status: v.status === 'nenhum' ? undefined : v.status }, undefined, {
          size: 'md',
          shape: 'circle',
        }),
    },
    examples: [
      { title: 'Tamanhos e status', path: 'avatar/Group' },
      { title: 'Fallback', path: 'avatar/Fallback' },
    ],
    props: [
      { name: 'src', type: 'string', description: 'URL da imagem.' },
      { name: 'name', type: 'string', description: 'Gera as iniciais e o texto alternativo.' },
      { name: 'alt', type: 'string', description: 'Texto alternativo. Padrão: name.' },
      {
        name: 'size',
        type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
        default: "'md'",
        description: 'Tamanho.',
      },
      { name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: 'Formato.' },
      {
        name: 'status',
        type: "'online' | 'offline' | 'busy' | 'away'",
        description: 'Indicador de presença.',
      },
    ],
    a11y: [
      'Exposto como role="img". O status entra no nome: "Ana Lima, online".',
      'Se a imagem falhar, as iniciais aparecem sem mudar o nome acessível.',
    ],
  },
  {
    slug: 'toast',
    name: 'Toast',
    category: 'Feedback',
    summary: 'Notificações temporárias. Já vem dentro do SakuraProvider; use o hook useToast.',
    imports: ['useToast'],
    playground: {
      controls: [
        {
          type: 'select',
          prop: 'tone',
          label: 'tone',
          options: ['info', 'success', 'warning', 'danger'],
          default: 'success',
        },
        { type: 'text', prop: 'title', label: 'title', default: 'Alterações salvas' },
      ],
      render: (v) => <ToastDemo tone={v.tone as ToastTone} title={str(v.title)} />,
      code: (v) =>
        `const { toast } = useToast();\n\ntoast({ title: '${str(v.title).replace(/'/g, "\\'")}', tone: '${str(v.tone)}' });`,
    },
    examples: [
      { title: 'Tons', path: 'toast/Tones' },
      {
        title: 'Com ação',
        description: 'A notificação fica 8 segundos e tem um botão de desfazer.',
        path: 'toast/WithAction',
      },
    ],
    props: [
      { name: 'title', type: 'ReactNode', required: true, description: 'Texto principal.' },
      { name: 'description', type: 'ReactNode', description: 'Detalhe abaixo do título.' },
      {
        name: 'tone',
        type: "'info' | 'success' | 'warning' | 'danger'",
        default: "'info'",
        description: 'Cor e ícone.',
      },
      {
        name: 'duration',
        type: 'number',
        default: '5000',
        description: 'Tempo em ms. Infinity mantém até fechar.',
      },
      {
        name: 'action',
        type: '{ label, onClick }',
        description: 'Botão de ação, como "Desfazer".',
      },
      { name: 'id', type: 'string', description: 'Reusar o id substitui a notificação anterior.' },
    ],
    extraProps: [
      {
        title: 'ToastProvider (via SakuraProvider toast={...})',
        props: [
          {
            name: 'position',
            type: "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'",
            default: "'bottom-right'",
            description: 'Canto da tela.',
          },
          { name: 'limit', type: 'number', default: '5', description: 'Máximo ao mesmo tempo.' },
          { name: 'duration', type: 'number', default: '5000', description: 'Duração padrão.' },
        ],
      },
    ],
    a11y: [
      'Regiões aria-live fixas: info, sucesso e aviso são educadas (polite); erro é assertivo.',
      'O tempo pausa com o ponteiro em cima ou com foco dentro da notificação.',
    ],
  },
  {
    slug: 'progress-bar',
    name: 'Progress Bar',
    category: 'Feedback',
    summary: 'Mostra o andamento de uma tarefa, com valor conhecido ou indeterminado.',
    imports: ['ProgressBar'],
    playground: {
      controls: [
        { type: 'number', prop: 'value', label: 'value', default: 64, min: 0, max: 100 },
        { type: 'text', prop: 'label', label: 'label', default: 'Upload' },
        {
          type: 'select',
          prop: 'tone',
          label: 'tone',
          options: ['primary', 'accent', 'info', 'success', 'warning', 'danger', 'neutral'],
          default: 'primary',
        },
        { type: 'select', prop: 'size', label: 'size', options: sizes, default: 'md' },
        { type: 'boolean', prop: 'showValue', label: 'showValue', default: true },
      ],
      render: (v) => (
        <div style={{ width: '100%', maxWidth: 360 }}>
          <ProgressBar
            value={typeof v.value === 'number' ? v.value : undefined}
            label={str(v.label)}
            tone={v.tone as ProgressTone}
            size={v.size as 'sm' | 'md' | 'lg'}
            showValue={Boolean(v.showValue)}
          />
        </div>
      ),
      code: (v) =>
        toJsx('ProgressBar', v, undefined, { tone: 'primary', size: 'md', showValue: false }),
    },
    examples: [
      { title: 'Determinada', path: 'progress-bar/Basic' },
      { title: 'Indeterminada', path: 'progress-bar/Indeterminate' },
    ],
    props: [
      {
        name: 'value',
        type: 'number',
        description: 'Valor atual. Sem valor, a barra fica indeterminada.',
      },
      { name: 'max', type: 'number', default: '100', description: 'Valor máximo.' },
      { name: 'label', type: 'ReactNode', description: 'Rótulo visível. Sem ele, use aria-label.' },
      {
        name: 'showValue',
        type: 'boolean',
        default: 'false',
        description: 'Mostra a porcentagem.',
      },
      {
        name: 'valueText',
        type: 'string',
        description: 'Texto lido no lugar do número, como "3 de 10 arquivos".',
      },
      {
        name: 'tone',
        type: "'primary' | 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'",
        default: "'primary'",
        description: 'Cor do preenchimento. primary usa o gradiente da marca.',
      },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Espessura.' },
    ],
    a11y: [
      'role="progressbar" com aria-valuenow, aria-valuemin e aria-valuemax.',
      'Indeterminada não informa valor e marca aria-busy. Com movimento reduzido, pulsa em vez de deslizar.',
    ],
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    category: 'Feedback',
    summary: 'Formas que reservam o espaço do conteúdo enquanto ele carrega.',
    imports: ['Skeleton'],
    playground: {
      controls: [
        {
          type: 'select',
          prop: 'variant',
          label: 'variant',
          options: ['text', 'rect', 'circle'],
          default: 'text',
        },
        { type: 'number', prop: 'lines', label: 'lines', default: 3, min: 1, max: 6 },
        { type: 'boolean', prop: 'animated', label: 'animated', default: true },
      ],
      render: (v) => (
        <div style={{ width: '100%', maxWidth: 320 }}>
          <Skeleton
            variant={v.variant as SkeletonVariant}
            lines={typeof v.lines === 'number' ? v.lines : 1}
            animated={Boolean(v.animated)}
          />
        </div>
      ),
      code: (v) =>
        toJsx('Skeleton', { ...v, lines: v.variant === 'text' ? v.lines : undefined }, undefined, {
          variant: 'text',
          lines: 1,
          animated: true,
        }),
    },
    examples: [{ title: 'Card carregando', path: 'skeleton/CardLoading' }],
    props: [
      {
        name: 'variant',
        type: "'text' | 'rect' | 'circle'",
        default: "'text'",
        description: 'Formato.',
      },
      { name: 'width / height', type: 'CSSProperties', description: 'Tamanho.' },
      {
        name: 'lines',
        type: 'number',
        default: '1',
        description: 'Linhas no modo text. A última fica menor.',
      },
      { name: 'animated', type: 'boolean', default: 'true', description: 'Brilho animado.' },
    ],
    a11y: [
      'Fica oculto para leitores de tela. Marque o container que está carregando com aria-busy="true".',
      'Com movimento reduzido, o brilho é desligado.',
    ],
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    category: 'Feedback',
    summary: 'Indicador circular de carregamento.',
    imports: ['Spinner'],
    playground: {
      controls: [
        { type: 'select', prop: 'size', label: 'size', options: sizes, default: 'lg' },
        {
          type: 'select',
          prop: 'tone',
          label: 'tone',
          options: ['primary', 'accent', 'info', 'success', 'warning', 'danger', 'neutral'],
          default: 'primary',
        },
        { type: 'text', prop: 'label', label: 'label', default: 'Carregando' },
      ],
      render: (v) => (
        <Spinner size={v.size as SpinnerSize} tone={v.tone as SpinnerTone} label={str(v.label)} />
      ),
      code: (v) =>
        toJsx('Spinner', v, undefined, { size: 'md', tone: 'primary', label: 'Carregando' }),
    },
    examples: [
      { title: 'Tamanhos', path: 'spinner/Sizes' },
      { title: 'Tons', path: 'spinner/Tones' },
    ],
    props: [
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Tamanho.' },
      {
        name: 'tone',
        type: "'primary' | 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'current'",
        default: "'primary'",
        description: 'Cor. current herda a cor do texto ao redor, como dentro de um botão.',
      },
      {
        name: 'label',
        type: 'string',
        default: "'Carregando'",
        description: 'Texto lido por leitores de tela.',
      },
      {
        name: 'decorative',
        type: 'boolean',
        default: 'false',
        description: 'Esconde de leitores quando outro elemento já anuncia.',
      },
    ],
    a11y: [
      'role="status" com texto oculto, anunciado quando aparece.',
      'Com movimento reduzido, pulsa devagar em vez de girar.',
    ],
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    category: 'Sobreposição',
    summary: 'Dica curta que aparece no hover e no foco do teclado.',
    imports: ['Tooltip'],
    playground: {
      controls: [
        { type: 'text', prop: 'content', label: 'content', default: 'Copia o link da página' },
        {
          type: 'select',
          prop: 'placement',
          label: 'placement',
          options: ['top', 'bottom', 'left', 'right'],
          default: 'top',
        },
        { type: 'number', prop: 'delay', label: 'delay (ms)', default: 300, min: 0, max: 2000 },
      ],
      render: (v) => (
        <Tooltip
          content={str(v.content)}
          placement={v.placement as Side}
          delay={Number(v.delay ?? 0)}
        >
          <Button variant="outline">Passe o mouse ou use Tab</Button>
        </Tooltip>
      ),
      code: (v) =>
        toJsx('Tooltip', v, '\n  <Button variant="outline">Copiar</Button>\n', {
          placement: 'top',
          delay: 300,
        }),
    },
    examples: [{ title: 'Botões com ícone', path: 'tooltip/Basic' }],
    props: [
      { name: 'content', type: 'ReactNode', required: true, description: 'Texto da dica.' },
      {
        name: 'children',
        type: 'ReactElement',
        required: true,
        description: 'Um elemento focável, como um botão.',
      },
      {
        name: 'placement',
        type: "'top' | 'bottom' | 'left' | 'right'",
        default: "'top'",
        description: 'Lado preferido. Inverte quando falta espaço.',
      },
      {
        name: 'delay',
        type: 'number',
        default: '300',
        description: 'Atraso do hover em ms. O foco abre na hora.',
      },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Desliga a dica.' },
    ],
    a11y: [
      'Ligado ao gatilho por aria-describedby enquanto visível.',
      'Fica aberto com o ponteiro sobre a dica e fecha com Esc (WCAG 1.4.13).',
      'Não use para informação essencial: toque em celular não abre a dica.',
    ],
  },
  {
    slug: 'modal',
    name: 'Modal',
    category: 'Sobreposição',
    summary: 'Janela de diálogo que bloqueia o resto da página até ser fechada.',
    imports: ['Modal'],
    examples: [
      {
        title: 'Confirmação',
        description: 'Usa role="alertdialog" e dispara um toast ao confirmar.',
        path: 'modal/Confirm',
      },
      {
        title: 'Formulário',
        description: 'Select dentro do modal abre a lista por cima, sem cortar.',
        path: 'modal/Form',
      },
    ],
    props: [
      { name: 'open', type: 'boolean', required: true, description: 'Controla a visibilidade.' },
      {
        name: 'onClose',
        type: '() => void',
        required: true,
        description: 'Chamado por Esc, fundo ou botão de fechar.',
      },
      {
        name: 'title',
        type: 'ReactNode',
        required: true,
        description: 'Título (h2), vira o nome do diálogo.',
      },
      {
        name: 'description',
        type: 'ReactNode',
        description: 'Descrição ligada por aria-describedby.',
      },
      { name: 'footer', type: 'ReactNode', description: 'Área de ações.' },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg' | 'full'",
        default: "'md'",
        description: 'Largura máxima.',
      },
      {
        name: 'closeOnOverlayClick / closeOnEsc',
        type: 'boolean',
        default: 'true',
        description: 'Formas de fechar.',
      },
      {
        name: 'initialFocus',
        type: 'RefObject<HTMLElement>',
        description: 'Elemento focado ao abrir.',
      },
      {
        name: 'role',
        type: "'dialog' | 'alertdialog'",
        default: "'dialog'",
        description: 'alertdialog para confirmações.',
      },
    ],
    a11y: [
      'Foco preso dentro do modal enquanto aberto e devolvido ao gatilho ao fechar.',
      'Com modais empilhados, Esc e clique no fundo fecham só o de cima.',
      'Em telas pequenas vira uma folha presa embaixo, ocupando a largura toda.',
    ],
  },
];

export const categories: Category[] = [
  'Ações',
  'Formulários',
  'Exibição',
  'Feedback',
  'Sobreposição',
];

export function getComponent(slug: string): ComponentDoc | undefined {
  return components.find((component) => component.slug === slug);
}
