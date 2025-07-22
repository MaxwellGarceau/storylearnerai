// pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Languages, Lightbulb, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const Home: React.FC = () => {
  const features = [
    {
      icon: <Languages className="h-6 w-6" />,
      title: "Multi-Language Support",
      description: "Translate stories from any language to English with AI-powered accuracy"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Side-by-Side Reading",
      description: "Read original and translated text simultaneously for better comprehension"
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Learning Insights",
      description: "Get detailed explanations and vocabulary help to enhance your learning"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered",
      description: "Advanced language models provide accurate and contextual translations"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Upload Your Story",
      description: "Enter a story in any language you want to learn from"
    },
    {
      number: "2", 
      title: "AI Translation",
      description: "Our AI translates it to English with detailed explanations"
    },
    {
      number: "3",
      title: "Learn & Practice",
      description: "Read and learn with side-by-side translations and vocabulary help"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Language Learning
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Story Learner AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform any story into a powerful learning tool. Translate, understand, and master new languages with AI assistance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/translate">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Translating
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Story Learner AI?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with proven language learning methodologies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in just three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="relative">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </CardContent>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="text-center py-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start Your Language Learning Journey?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are already improving their language skills with Story Learner AI
            </p>
            <Link to="/translate">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Home;
