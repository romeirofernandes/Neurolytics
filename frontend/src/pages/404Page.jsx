import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-xl bg-card text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-6xl font-bold text-destructive">404</span>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                asChild
                className="w-full h-12 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/" className="flex items-center justify-center gap-2">
                  <Home className="h-4 w-4" />
                  Go to Homepage
                </Link>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full h-12 text-base font-semibold border-2 hover:bg-accent hover:text-accent-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Need help? <Link to="/" className="text-primary hover:text-primary/80 font-semibold hover:underline">Contact support</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFoundPage;
