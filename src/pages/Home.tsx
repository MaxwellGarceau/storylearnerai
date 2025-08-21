// pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Languages,
  Lightbulb,
  Sparkles,
  User,
  HelpCircle,
} from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import { useWalkthrough } from '../hooks/useWalkthrough';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { startWalkthroughById, resetWalkthrough } = useWalkthrough();
  const { t } = useTranslation();

  const features = [
    {
      icon: <Languages className='h-6 w-6' />,
      title: t('home.features.multiLanguage.title'),
      description: t('home.features.multiLanguage.description'),
    },
    {
      icon: <BookOpen className='h-6 w-6' />,
      title: t('home.features.sideBySide.title'),
      description: t('home.features.sideBySide.description'),
    },
    {
      icon: <Lightbulb className='h-6 w-6' />,
      title: t('home.features.learningInsights.title'),
      description: t('home.features.learningInsights.description'),
    },
    {
      icon: <Sparkles className='h-6 w-6' />,
      title: t('home.features.aiPowered.title'),
      description: t('home.features.aiPowered.description'),
    },
  ];

  const steps = [
    {
      number: '1',
      title: t('home.howItWorks.step1.title'),
      description: t('home.howItWorks.step1.description'),
    },
    {
      number: '2',
      title: t('home.howItWorks.step2.title'),
      description: t('home.howItWorks.step2.description'),
    },
    {
      number: '3',
      title: t('home.howItWorks.step3.title'),
      description: t('home.howItWorks.step3.description'),
    },
  ];

  return (
    <Layout>
      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        {/* Hero Section */}
        <div className='text-center mb-16'>
          <Badge variant='secondary' className='mb-4'>
            {t('home.hero.badge')}
          </Badge>
          <h1 className='text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent'>
            {t('home.hero.title')}
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed'>
            {t('home.hero.subtitle')}
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Link to='/translate' data-testid='start-translating-link'>
              <Button
                size='lg'
                className='text-lg px-8 py-6'
                data-testid='start-translating-button'
              >
                {t('home.hero.startTranslating')}
                <ArrowRight className='h-5 w-5' />
              </Button>
            </Link>
            <Button
              variant='outline'
              size='lg'
              onClick={() => {
                resetWalkthrough('home-walkthrough');
                startWalkthroughById('home-walkthrough');
              }}
              className='text-lg px-8 py-6'
            >
              <HelpCircle className='h-5 w-5 mr-2' />
              {t('home.hero.restartTutorial')}
            </Button>
            {!user && (
              <Link to='/auth?mode=signup'>
                <Button
                  variant='outline'
                  size='lg'
                  className='text-lg px-8 py-6'
                >
                  <User className='h-5 w-5 mr-2' />
                  {t('home.hero.signUpFree')}
                </Button>
              </Link>
            )}
            {user && (
              <Link to='/dashboard'>
                <Button
                  variant='outline'
                  size='lg'
                  className='text-lg px-8 py-6'
                >
                  <BookOpen className='h-5 w-5 mr-2' />
                  {t('home.hero.myDashboard')}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className='mb-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              {t('home.features.title')}
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {features.map((feature, index) => (
              <Card
                key={index}
                className='text-center hover:shadow-lg transition-shadow'
              >
                <CardHeader className='pb-4'>
                  <div className='mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit'>
                    <div className='text-primary'>{feature.icon}</div>
                  </div>
                  <CardTitle className='text-lg'>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-sm'>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className='mb-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              {t('home.howItWorks.title')}
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              {t('home.howItWorks.subtitle')}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {steps.map((step, index) => (
              <Card key={index} className='relative'>
                <CardHeader className='text-center pb-4'>
                  <div className='mx-auto mb-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg'>
                    {step.number}
                  </div>
                  <CardTitle className='text-xl'>{step.title}</CardTitle>
                </CardHeader>
                <CardContent className='text-center'>
                  <CardDescription className='text-base'>
                    {step.description}
                  </CardDescription>
                </CardContent>
                {index < steps.length - 1 && (
                  <div className='hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2'>
                    <ArrowRight className='h-6 w-6 text-muted-foreground' />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className='bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20'>
          <CardContent className='text-center py-12'>
            <h3 className='text-2xl md:text-3xl font-bold mb-4'>
              {t('home.cta.title')}
            </h3>
            <p className='text-lg text-muted-foreground mb-8 max-w-2xl mx-auto'>
              {user ? t('home.cta.subtitleUser') : t('home.cta.subtitleGuest')}
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Link to='/translate'>
                <Button size='lg' className='text-lg px-8 py-6'>
                  {t('home.cta.startTranslating')}
                  <ArrowRight className='h-5 w-5' />
                </Button>
              </Link>
              {!user && (
                <Link to='/auth?mode=signup'>
                  <Button
                    variant='outline'
                    size='lg'
                    className='text-lg px-8 py-6'
                  >
                    <User className='h-5 w-5 mr-2' />
                    {t('home.cta.createAccount')}
                  </Button>
                </Link>
              )}
              {user && (
                <Link to='/dashboard'>
                  <Button
                    variant='outline'
                    size='lg'
                    className='text-lg px-8 py-6'
                  >
                    <BookOpen className='h-5 w-5 mr-2' />
                    {t('home.cta.viewDashboard')}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Home;
