import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  ProgressBar,
  Select,
  Switch,
  Tabs,
  Tooltip,
  useToast,
} from '@guibonin/sakura-ui';
import { motion } from 'framer-motion';
import { Accessibility, ArrowRight, Code, Moon, Sparkles } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { components } from '../content/components';
import { CopyButton } from '../docs-kit/CopyButton';
import { GITHUB_URL } from '../docs-kit/Layout';
import { Petals } from '../docs-kit/Petals';
import { useDocumentTitle } from '../docs-kit/useDocumentTitle';

const INSTALL = 'npm install @guibonin/sakura-ui';

const features = [
  {
    icon: Accessibility,
    title: 'Acessível de verdade',
    text: 'Padrões WAI-ARIA, teclado completo, contraste AA testado e checagem com axe em todos os componentes.',
  },
  {
    icon: Moon,
    title: 'Claro e escuro',
    text: 'Segue o sistema, lembra a escolha da pessoa e muda tudo com variáveis CSS.',
  },
  {
    icon: Sparkles,
    title: 'Movimento com calma',
    text: 'Animações com Framer Motion que ficam paradas quando o sistema pede menos movimento.',
  },
  {
    icon: Code,
    title: 'TypeScript do início ao fim',
    text: 'Props tipadas, refs repassadas e componentes controlados ou não, como você preferir.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function SignupDemo() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const invalid = sent && !email.includes('@');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
    if (!email.includes('@')) return;
    toast({
      title: 'Conta criada!',
      description: `Enviamos um convite para ${email}.`,
      tone: 'success',
    });
    setEmail('');
    setSent(false);
  };

  return (
    <Card className="home-demo-card">
      <Card.Header title="Crie sua conta" description="Leva menos de um minuto." />
      <form className="home-form" onSubmit={submit} noValidate>
        <Input
          label="E-mail"
          type="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={invalid ? 'Digite um e-mail válido.' : undefined}
        />
        <Select
          label="Você vai usar para"
          defaultValue="produto"
          options={[
            { value: 'produto', label: 'Um produto' },
            { value: 'estudo', label: 'Estudos' },
            { value: 'cliente', label: 'Projeto de cliente' },
          ]}
        />
        <Switch label="Quero receber novidades" defaultChecked />
        <Button type="submit" fullWidth>
          Criar conta
        </Button>
      </form>
    </Card>
  );
}

function DashboardDemo() {
  return (
    <Card className="home-demo-card">
      <Tabs defaultValue="semana" variant="pills">
        <Tabs.List aria-label="Período do relatório">
          <Tabs.Tab value="semana">Semana</Tabs.Tab>
          <Tabs.Tab value="mes">Mês</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="semana">
          <div className="home-stats">
            <ProgressBar label="Meta de vendas" value={72} showValue />
            <ProgressBar label="Tickets resolvidos" value={45} showValue tone="success" />
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="mes">
          <div className="home-stats">
            <ProgressBar label="Meta de vendas" value={91} showValue />
            <ProgressBar label="Tickets resolvidos" value={88} showValue tone="success" />
          </div>
        </Tabs.Panel>
      </Tabs>
      <div className="home-team">
        <div className="home-avatars">
          <Avatar name="Ana Lima" size="sm" status="online" />
          <Avatar name="Bruno Costa" size="sm" />
          <Avatar name="Carla Souza" size="sm" status="busy" />
        </div>
        <div className="home-badges">
          <Badge tone="success" dot>
            No prazo
          </Badge>
          <Tooltip content="Lançamento previsto para sexta">
            <Button size="sm" variant="ghost">
              v1.0
            </Button>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}

export function Home() {
  useDocumentTitle();

  return (
    <div className="home">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__glow" aria-hidden="true" />
        <Petals />
        <div className="home-hero__content">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <Badge tone="accent" appearance="soft">
              Open source · MIT
            </Badge>
          </motion.div>
          <motion.h1
            id="home-title"
            className="home-title"
            initial="hidden"
            animate="visible"
            custom={0.08}
            variants={fadeUp}
          >
            Componentes React que florescem em <span>qualquer interface</span>
          </motion.h1>
          <motion.p
            className="home-subtitle"
            initial="hidden"
            animate="visible"
            custom={0.16}
            variants={fadeUp}
          >
            {components.length} componentes acessíveis, com tema claro e escuro, animações suaves e
            TypeScript. Feitos para você copiar, colar e seguir em frente.
          </motion.p>
          <motion.div
            className="home-actions"
            initial="hidden"
            animate="visible"
            custom={0.24}
            variants={fadeUp}
          >
            <Link className="docs-cta" to="/comecando">
              Começar agora <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="docs-cta docs-cta--secondary" to="/componentes/button">
              Ver componentes
            </Link>
          </motion.div>
          <motion.div
            className="home-install"
            initial="hidden"
            animate="visible"
            custom={0.32}
            variants={fadeUp}
          >
            <code>
              <span aria-hidden="true">$ </span>
              {INSTALL}
            </code>
            <CopyButton text={INSTALL} label="Copiar comando de instalação" />
          </motion.div>
        </div>
      </section>

      <section className="home-showcase" aria-labelledby="home-showcase-title">
        <h2 id="home-showcase-title" className="home-section-title">
          Teste aqui mesmo
        </h2>
        <p className="home-section-text">
          Tudo abaixo é a biblioteca funcionando. Use o teclado, troque o tema no topo e envie o
          formulário.
        </p>
        <div className="home-demos">
          <SignupDemo />
          <DashboardDemo />
        </div>
      </section>

      <section className="home-features" aria-labelledby="home-features-title">
        <h2 id="home-features-title" className="home-section-title">
          Feita com cuidado nos detalhes
        </h2>
        <ul className="home-feature-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title} className="home-feature">
              <span className="home-feature__icon" aria-hidden="true">
                <Icon />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-faq" aria-labelledby="home-faq-title">
        <h2 id="home-faq-title" className="home-section-title">
          Perguntas frequentes
        </h2>
        <Accordion defaultValue="gratis" headingLevel={3}>
          <Accordion.Item value="gratis" title="É gratuita para uso comercial?">
            Sim. A Sakura UI é distribuída sob a licença MIT.
          </Accordion.Item>
          <Accordion.Item value="react" title="Quais versões do React funcionam?">
            React 18 e 19.
          </Accordion.Item>
          <Accordion.Item value="ssr" title="Funciona com Next.js e renderização no servidor?">
            Sim. O bundle já vem marcado com &quot;use client&quot; e os portais só montam no
            navegador.
          </Accordion.Item>
        </Accordion>
        <p className="home-section-text">
          Encontrou um problema ou quer ajudar?{' '}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            Abra uma issue no GitHub
          </a>
          .
        </p>
      </section>
    </div>
  );
}
