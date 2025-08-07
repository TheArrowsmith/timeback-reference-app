'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { loginUser, confirmUser } from '@/lib/auth/cognito';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

type LoginStep = 'email' | 'confirmation';

export default function LoginPage() {
  const router = useRouter();
  const { setCognitoAuth, isAuthenticated } = useAuth();
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginUser(email);
      
      if (result.success && result.tokens) {
        // Login successful
        await setCognitoAuth(result.tokens);
        router.push('/');
      } else if (result.needsConfirmation) {
        // Need to confirm account
        setStep('confirmation');
      } else {
        // Provide helpful error messages based on the error
        if (result.error?.includes('Network') || result.error?.includes('fetch')) {
          setError('Cannot connect to the server. Please ensure the TimeBack backend is running on http://localhost:8080');
        } else if (result.error?.includes('password')) {
          setError('Authentication failed. This app uses a fixed password for all accounts.');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message?.includes('Network') || err.message?.includes('fetch')) {
        setError('Cannot connect to the authentication service. Please check your internet connection and ensure the backend is running.');
      } else {
        setError('An unexpected error occurred. Please try again or contact support.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Confirm the user
      const confirmResult = await confirmUser(email, confirmationCode);
      
      if (!confirmResult.success) {
        // Provide helpful error messages for confirmation issues
        if (confirmResult.error?.includes('CodeMismatch') || confirmResult.error?.includes('Invalid')) {
          setError('Invalid confirmation code. Please check the 6-digit code sent to your email.');
        } else if (confirmResult.error?.includes('Expired')) {
          setError('Confirmation code has expired. Please request a new code by entering your email again.');
        } else {
          setError(confirmResult.error || 'Confirmation failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Try to login after confirmation
      const loginResult = await loginUser(email);
      
      if (loginResult.success && loginResult.tokens) {
        await setCognitoAuth(loginResult.tokens);
        router.push('/');
      } else {
        setError(loginResult.error || 'Login failed after confirmation. Please try signing in again.');
      }
    } catch (err: any) {
      console.error('Confirmation error:', err);
      if (err.message?.includes('Network') || err.message?.includes('fetch')) {
        setError('Cannot connect to the authentication service. Please check your internet connection.');
      } else {
        setError('An error occurred during confirmation. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to TimeBack</CardTitle>
          <CardDescription>
            {step === 'email' 
              ? 'Enter your email to sign in or create an account'
              : `We sent a verification code to ${email}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking account...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleConfirmationSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="code">6-Digit Confirmation Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || confirmationCode.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Sign In'
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('email');
                  setConfirmationCode('');
                  setError('');
                }}
                disabled={isLoading}
              >
                Use a different email
              </Button>
            </form>
          )}
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>This is a reference application for the TimeBack API platform.</p>
            {step === 'email' && (
              <>
                <p className="mt-2">Password is automatically set for all accounts.</p>
                <div className="mt-4 p-3 bg-muted rounded-md text-left">
                  <p className="font-semibold mb-1">First time setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Make sure TimeBack backend is running on port 8080</li>
                    <li>Check your email spam folder for confirmation codes</li>
                    <li>Confirmation codes expire after 24 hours</li>
                  </ul>
                </div>
              </>
            )}
            {step === 'confirmation' && (
              <div className="mt-4 p-3 bg-muted rounded-md text-left">
                <p className="font-semibold mb-1">Didn't receive a code?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Check your spam/junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Codes are sent from AWS Cognito</li>
                  <li>Try using a different email if issues persist</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}